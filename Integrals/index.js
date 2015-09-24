;// Production steps of ECMA-262, Edition 6, 22.1.2.1
// Reference: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.from
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike/*, mapFn, thisArg */) {
      // 1. Let C be the this value.
      var C = this;

      // 2. Let items be ToObject(arrayLike).
      var items = Object(arrayLike);

      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new TypeError("Array.from requires an array-like object - not null or undefined");
      }

      // 4. If mapfn is undefined, then let mapping be false.
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        // 5. else      
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }

        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      var len = toLength(items.length);

      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 16. Let k be 0.
      var k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  }());
}

//basic math functions
var M = {
    sum: function(a,b) {return a+b;},
    diff: function(a,b) {return a-b;},
    mult: function(a,b) {return a*b;},
    div: function(a,b) {return a/b;}
}

function infixWriter(pre,symbol,post) {
    return function(args) {
        return pre+args.join(symbol)+post;
    }
}

function operation(type,writer) {
    return function() {
        return {
            type: type,
            args: Array.from(arguments),
            writer: writer
        };
    };
}

function infixOperation(type,symbols) {
    return operation(type,infixWriter.apply(null,symbols));
}

var sum = infixOperation('sum',['(',' + ',')']);
var diff = infixOperation('diff',['(',' - ',')']);
var mult = infixOperation('mult',['(',' * ',')']);
var div = infixOperation('div',['(',' / ',')']);
var pow = infixOperation('pow',['(',' ^ ',')']);
var int = infixOperation('int',['~',' d','']);

function write(form) {
    if (typeof form == 'object') {
        return form.writer(form.args.map(write));
    } else {
        return form;
    }
}

//return a solver function that takes a form and applies the given transformers
function solver(transformers) {
    return function(form) {
        //transform arguments
        if (form.args) {
            form.args = form.args.map(solver(transformers));
        }
        //transform itself
        var res = transformers.reduce(function(form,tx) {
            return tx(form);
        },form);
        if (write(res) === write(form)) {
            //result is the same as last time, no further simplification possible (we tried)
            return res;
        }
        //try solving again
        return solver(transformers)(res);
    };
}

//solve if all arguments are numeric
//TODO: can also do if some are numeric - is this needed if we iteratively try? rules can probably be simple
function numberSolver(type,red) {
    return function(form) {
        if (form.type==type && form.args.every(function(arg) {
            return typeof arg === 'number';
        })) {
            return form.args.reduce(red);
        }
        return form;
    };
}

//TODO: create a representation for substitution rules (patterns!)
//we need "placeholder" symbols for this:
//sum(_1,_1) -> mult(2,_1)                      //a + a = 2a
//sum(_1,mult(_2,_1)) -> mult(sum(_2,1),_1)     //a + ba = (b+1) a
var tx = [];
//add numeric values sum(d,d) -> (d+d)
tx.push(numberSolver('sum',M.sum));
//multiplying numbers mult(d,d) -> (d*d)
tx.push(numberSolver('mult',M.mult));
//adding same values is multiplying sum(x,x,x) -> mult(3,x)
tx.push(function(form) {
    if (form.type=='sum' && form.args.every(function(arg) {
        return arg === form.args[0];
    })) {
        return mult(form.args.length,form.args[0]);
    }
    return form;
});
//multiplication of multiplication mult(a,mult(b,c)) -> mult(a,b,c);
tx.push(function(form) {
    if (form.type=='mult' && form.args.every(function(arg) {
        return arg.type === undefined || arg.type === 'mult';
    })) {
        return mult.apply(null,form.args.reduce(function(all,arg) {
            return all.concat(arg.args||arg);
        },[]));
    }
    return form;
})
// tx.push(transform(sum('_','_'), mult(2,'_')));

var solve = solver(tx);

var poly = sum(mult('a',pow('x',2)),mult('b','x'),'c');
var f1 = int(div((mult(-5,pow('x',4))),pow(diff(1,pow('x',2)),div(5,2))),'x');

console.log(write(f1));
console.log(write(poly));

var f2 = mult(2,sum('a','a'));
// var f2 = mult(2,mult(2,'a'));
console.log(write(f2),'->',write(solve(f2)));