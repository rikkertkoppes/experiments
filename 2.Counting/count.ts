//innate knowledge of order
var symbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

//numbers are arrays of symbols
//for writing there is a write function that simply joins them

function isFirst(nr: string[]) {
    return (nr.length === 1) && (nr[0] === symbols[0]);
}

function copy(nr: string[]): string[] {
    return nr.map(_ => _);
}

//TODO: need to think about symbol handling, rolling over, browsing through a sequence
function next(nr: string[]): string[] {
    nr = copy(nr);
    var last = nr.pop() || symbols[0];
    var nextIndex = symbols.indexOf(last) + 1;
    if (nextIndex < symbols.length) {
        return [].concat(nr, symbols[nextIndex]);
    }
    return next(nr).concat(symbols[0]);
}

function prev(nr: string[]): string[] {
    if (isFirst(nr)) {
        return ['NaN'];
    }
    nr = copy(nr);
    var last = nr.pop() || symbols[0];
    // console.log('',last);
    var prevIndex = symbols.indexOf(last) - 1;
    if (prevIndex > -1) {
        return [].concat(nr, symbols[prevIndex]);
    }
    var head = prev(nr);
    //remove leading zeros
    if (isFirst(head)) {
        head = [];
    }
    return head.concat(symbols[9]);
}

//4+2 -> 5+1 -> 6+0 -> 6
function add(base, delta) {
    if (isFirst(delta)) {
        return base;
    }
    return add(next(base), prev(delta));
}

//4-2 -> 3-1 -> 2-0 -> 2
function sub(base, delta) {
    if (isFirst(delta)) {
        return base;
    }
    return sub(prev(base), prev(delta));
}

//4*3+0 -> 4*2+4 -> 4*1+8 -> 4*0+12 -> 12
function mult(base, plier, start = ['0']) {
    if (isFirst(plier)) {
        return start;
    }
    return mult(base, prev(plier), add(start, base));
}

//less than
function lt(a: string[],b:string[]) {
    //hack
    return parseInt(write(a), 10) < parseInt(write(b), 10);

    a = copy(a);
    b = copy(b);
    if (a.length == b.length) {
        var la = symbols.indexOf(a.shift());
        var lb = symbols.indexOf(b.shift());
        if (la == lb) {
            if (la == undefined) {
                //both the same
                return false;
            }
            return lt(a, b);
        }
        //first symbol smaller
        return (la < lb);

    }
    //true if a shorter
    return (a.length < b.length);
}

function div(n: string[], d: string[], res=['0']): string[] {
    //subtract n from d until no longer can
    if (isFirst(d)) {
        //division by zero
        return ['NaN'];
    }
    if (lt(n,d)) {
        return res;
    }
    return div(sub(n, d), d, next(res));
}

function write(symbols: string[]): string {
    return symbols.join('');
}

console.log(write(prev(['0'])));
console.log(write(prev(['9'])));
console.log(write(prev(['1', '0'])));
console.log(write(prev(['1', '0', '0'])));

var count = 20;
var current = ['0'];
while (count--) {
    console.log(
        write(current),
        write(add(['4'], current)),
        write(mult(['3'], current)),
        write(div(current, ['2']))
    );
    current = next(current);
};