//innate knowledge of order
var symbols = ['0','1','2','3','4','5','6','7','8','9'];

//TODO: need to think about symbol handling, rolling over, browsing through a sequence
function next(number) {
    var parts = number.split('');
    var last = parts.pop()||symbols[0];
    var nextIndex = symbols.indexOf(last) + 1;
    if (nextIndex < symbols.length) {
        return parts.concat(symbols[nextIndex]).join('');
    }
    return next(parts.join(''))+symbols[0];
}

function prev(number) {
    var parts = number.split('');
    var last = parts.pop();
    var prevIndex = symbols.indexOf(last) - 1;
    if (prevIndex > -1) {
        return parts.concat(symbols[prevIndex]).join('');
    }
    var head = prev(parts.join(''));
    //remove leading zeros
    if (head === symbols[0]) {head = '';}
    return head+symbols[9];
}

//4+2 -> 5+1 -> 6+0 -> 6
function add(base,delta) {
    if (delta == '0') {
        return base;
    }
    return add(next(base),prev(delta));
}

//4-2 -> 3-1 -> 2-0 -> 2
function sub(base,delta) {
    if (delta == '0') {
        return base;
    }
    return sub(prev(base),prev(delta));
}

//4*3+0 -> 4*2+4 -> 4*1+8 -> 4*0+12 -> 12
function mult(base,plier,start) {
    if (plier == '0') {
        return start||'0';
    }
    return mult(base,prev(plier),add(start||'0',base));
}

function div() {
    //implement tail division
}

console.log(prev('9'));
console.log(prev('10'));
console.log(prev('80'));

var count = 20;
var current = '0';
while (count--) {
    console.log(current,add('4',current),mult('3',current));
    current = next(current);
};