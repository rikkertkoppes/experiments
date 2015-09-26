var rules = [];
function rule(regex, sub) {
    return function (str) {
        return str.replace(regex, sub);
    };
}
//recursively apply rules until the result no longer changes
function applier(rules) {
    return function apply(input) {
        var res = rules.reduce(function (sofar, rule) {
            return rule(sofar);
        }, input);
        if (res === input) {
            return res;
        }
        return apply(res);
    };
}
//unshift to have last rules as most important
//next decimal
rules.unshift(rule(/next\(\)/, '1'));
rules.unshift(rule(/next\((\d*)0\)/, '$11'));
rules.unshift(rule(/next\((\d*)1\)/, '$12'));
rules.unshift(rule(/next\((\d*)2\)/, '$13'));
rules.unshift(rule(/next\((\d*)3\)/, '$14'));
rules.unshift(rule(/next\((\d*)4\)/, '$15'));
rules.unshift(rule(/next\((\d*)5\)/, '$16'));
rules.unshift(rule(/next\((\d*)6\)/, '$17'));
rules.unshift(rule(/next\((\d*)7\)/, '$18'));
rules.unshift(rule(/next\((\d*)8\)/, '$19'));
rules.unshift(rule(/next\((\d*)9\)/, 'next($1)0'));
//next roman
rules.unshift(rule(/next\((\w+)\)/, '$1I'));
rules.unshift(rule(/next\(0\)/, 'I'));
rules.unshift(rule(/IIII/, 'IV'));
rules.unshift(rule(/IVI/, 'V'));
rules.unshift(rule(/VIV/, 'IX'));
rules.unshift(rule(/IXI/, 'X'));
rules.unshift(rule(/XXXX/, 'XL'));
rules.unshift(rule(/XLX/, 'L'));
rules.unshift(rule(/LXL/, 'XC'));
rules.unshift(rule(/XCX/, 'C'));
rules.unshift(rule(/CCCC/, 'CD'));
rules.unshift(rule(/CDC/, 'D'));
rules.unshift(rule(/DCD/, 'CM'));
rules.unshift(rule(/CMC/, 'M'));
//previous
rules.unshift(rule(/prev\(0\)/, 'NaN'));
rules.unshift(rule(/prev\((\d+)0\)/, 'prev($1)9'));
rules.unshift(rule(/prev\((\d*)1\)/, '$10'));
rules.unshift(rule(/prev\((\d*)2\)/, '$11'));
rules.unshift(rule(/prev\((\d*)3\)/, '$12'));
rules.unshift(rule(/prev\((\d*)4\)/, '$13'));
rules.unshift(rule(/prev\((\d*)5\)/, '$14'));
rules.unshift(rule(/prev\((\d*)6\)/, '$15'));
rules.unshift(rule(/prev\((\d*)7\)/, '$16'));
rules.unshift(rule(/prev\((\d*)8\)/, '$17'));
rules.unshift(rule(/prev\((\d*)9\)/, '$18'));
//addition
rules.unshift(rule(/add\((\d+),(\d+)\)/, 'add(next($1),prev($2))'));
rules.unshift(rule(/add\((\d+),0\)/, '$1'));
//normal syntax: a+b -> add(a,b)
rules.unshift(rule(/(\d+)\s?\+\s?(\d+)/, 'add($1,$2)'));
//subtraction
rules.unshift(rule(/sub\((\d+),(\d+)\)/, 'sub(prev($1),prev($2))'));
rules.unshift(rule(/sub\((\d+),0\)/, '$1'));
//normal syntax: a-b -> sub(a,b)
rules.unshift(rule(/(\d+)\s?\-\s?(\d+)/, 'sub($1,$2)'));
//multiplication
rules.unshift(rule(/mul\((\d+),(\d+),(\d+)\)/, 'mul($1,prev($2),add($1,$3))'));
rules.unshift(rule(/mul\((\d+),0,(\d+)\)/, '$2'));
rules.unshift(rule(/mul\((\d+),(\d+)\)/, 'mul($1,$2,0)'));
//normal syntax: a*b -> mul(a,b)
rules.unshift(rule(/(\d+)\s?\*\s?(\d+)/, 'mul($1,$2)'));
//remove leading zeros
rules.unshift(rule(/0*(\d+)/g, '$1'));
var apply = applier(rules);
// var input = '7 -1 * 6 + 3';
// console.log(apply(input));
var count = 110;
var current = '0';
while (count--) {
    console.log(current);
    current = apply('next(' + current + ')');
}
