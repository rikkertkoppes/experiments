//innate knowledge of order
var symbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
//numbers are arrays of symbols
//for writing there is a write function that simply joins them
function isFirst(nr) {
    return (nr.length === 1) && (nr[0] === symbols[0]);
}
function copy(nr) {
    return nr.map(function (_) { return _; });
}
//TODO: need to think about symbol handling, rolling over, browsing through a sequence
function next(nr) {
    nr = copy(nr);
    var last = nr.pop() || symbols[0];
    var nextIndex = symbols.indexOf(last) + 1;
    if (nextIndex < symbols.length) {
        return [].concat(nr, symbols[nextIndex]);
    }
    return next(nr).concat(symbols[0]);
}
function prev(nr) {
    nr = copy(nr);
    var last = nr.pop() || symbols[0];
    // console.log('',last);
    var prevIndex = symbols.indexOf(last) - 1;
    if (prevIndex > -1) {
        return [].concat(nr, symbols[prevIndex]);
    }
    if (nr.length === 0) {
        //no symbols left, we reached zero
        return ['NaN'];
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
function mult(base, plier, start) {
    if (start === void 0) { start = ['0']; }
    if (isFirst(plier)) {
        return start;
    }
    return mult(base, prev(plier), add(start, base));
}
function div() {
    //implement tail division
}
function write(symbols) {
    return symbols.join('');
}
console.log(write(prev(['0'])));
console.log(write(prev(['9'])));
console.log(write(prev(['1', '0'])));
console.log(write(prev(['1', '0', '0'])));
var count = 20;
var current = ['0'];
while (count--) {
    console.log(write(current), write(add(['4'], current)), write(mult(['3'], current)));
    current = next(current);
}
;
