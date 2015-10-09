
interface Rule {
    (str: string): string;
}

var mathRules: Rule[] = [];
var decimalCounting: Rule[] = [];
var romanCounting: Rule[] = [];

function rule(regex: RegExp, sub: string) {
    return function(str: string): string {
        return str.replace(regex, sub);
    }
}

//recursively apply rules until the result no longer changes
function applier(rules: Rule[]) {
    return function apply(input: string): string {
        var res = rules.reduce(function(sofar, rule) {
            return rule(sofar);
        }, input);
        if (res === input) {
            return res;
        }
        return apply(res);
    }
}

//unshift to have last rules as most important

//inc decimal
decimalCounting.unshift(rule(/inc\(\)/, '1'));
decimalCounting.unshift(rule(/inc\((\d*)0\)/, '$11'));
decimalCounting.unshift(rule(/inc\((\d*)1\)/, '$12'));
decimalCounting.unshift(rule(/inc\((\d*)2\)/, '$13'));
decimalCounting.unshift(rule(/inc\((\d*)3\)/, '$14'));
decimalCounting.unshift(rule(/inc\((\d*)4\)/, '$15'));
decimalCounting.unshift(rule(/inc\((\d*)5\)/, '$16'));
decimalCounting.unshift(rule(/inc\((\d*)6\)/, '$17'));
decimalCounting.unshift(rule(/inc\((\d*)7\)/, '$18'));
decimalCounting.unshift(rule(/inc\((\d*)8\)/, '$19'));
decimalCounting.unshift(rule(/inc\((\d*)9\)/, 'inc($1)0'));

//previous
decimalCounting.unshift(rule(/dec\(0\)/, 'NaN'));
decimalCounting.unshift(rule(/dec\((\d+)0\)/, 'dec($1)9'));
decimalCounting.unshift(rule(/dec\((\d*)1\)/, '$10'));
decimalCounting.unshift(rule(/dec\((\d*)2\)/, '$11'));
decimalCounting.unshift(rule(/dec\((\d*)3\)/, '$12'));
decimalCounting.unshift(rule(/dec\((\d*)4\)/, '$13'));
decimalCounting.unshift(rule(/dec\((\d*)5\)/, '$14'));
decimalCounting.unshift(rule(/dec\((\d*)6\)/, '$15'));
decimalCounting.unshift(rule(/dec\((\d*)7\)/, '$16'));
decimalCounting.unshift(rule(/dec\((\d*)8\)/, '$17'));
decimalCounting.unshift(rule(/dec\((\d*)9\)/, '$18'));

//inc roman
romanCounting.unshift(rule(/inc\(([IVXLCDM]+)\)/, '$1I'));
romanCounting.unshift(rule(/inc\(0\)/, 'I'));
romanCounting.unshift(rule(/IIII/, 'IV'));
romanCounting.unshift(rule(/IVI/, 'V'));
romanCounting.unshift(rule(/VIV/, 'IX'));
romanCounting.unshift(rule(/IXI/, 'X'));
romanCounting.unshift(rule(/XXXX/, 'XL'));
romanCounting.unshift(rule(/XLX/, 'L'));
romanCounting.unshift(rule(/LXL/, 'XC'));
romanCounting.unshift(rule(/XCX/, 'C'));
romanCounting.unshift(rule(/CCCC/, 'CD'));
romanCounting.unshift(rule(/CDC/, 'D'));
romanCounting.unshift(rule(/DCD/, 'CM'));
romanCounting.unshift(rule(/CMC/, 'M'));

//dec roman
romanCounting.unshift(rule(/dec\(0\)/, 'NaN'));
romanCounting.unshift(rule(/dec\(([IVXLCDM]+)I\)/, '$1'));
romanCounting.unshift(rule(/dec\(I\)/, '0'));
romanCounting.unshift(rule(/dec\(([IVXLCDM]*)V\)/, '$1IV'));
romanCounting.unshift(rule(/dec\(([IVXLCDM]*)IV\)/, '$1III'));
romanCounting.unshift(rule(/dec\(([IVXLCDM]*)X\)/, '$1IX'));
romanCounting.unshift(rule(/dec\(([IVXLCDM]*)IX\)/, '$1VIII'));
romanCounting.unshift(rule(/dec\(([IVXLCDM]*)L\)/, '$1XLIX'));
romanCounting.unshift(rule(/dec\(([IVXLCDM]*)XL\)/, '$1XXXIX'));
romanCounting.unshift(rule(/dec\(([IVXLCDM]*)C\)/, '$1XCIX'));
romanCounting.unshift(rule(/dec\(([IVXLCDM]*)XC\)/, '$1LXXXIX'));
romanCounting.unshift(rule(/dec\(([IVXLCDM]*)D\)/, '$1CDXCIX'));
romanCounting.unshift(rule(/dec\(([IVXLCDM]*)CD\)/, '$1CCCXCIX'));
romanCounting.unshift(rule(/dec\(([IVXLCDM]*)M\)/, '$1CMXCIX'));
romanCounting.unshift(rule(/dec\(([IVXLCDM]*)CM\)/, '$1DCCCXCIX'));

//addition
mathRules.unshift(rule(/add\(([0-9IVXLCDM]+),([0-9IVXLCDM]+)\)/, 'add(inc($1),dec($2))'));
mathRules.unshift(rule(/add\(([0-9IVXLCDM]+),0\)/, '$1'));
//normal syntax: a+b -> add(a,b)
mathRules.unshift(rule(/([0-9IVXLCDM]+)\s?\+\s?([0-9IVXLCDM]+)/, 'add($1,$2)'));

//subtraction
mathRules.unshift(rule(/sub\(([0-9IVXLCDM]+),([0-9IVXLCDM]+)\)/, 'sub(dec($1),dec($2))'));
mathRules.unshift(rule(/sub\(([0-9IVXLCDM]+),0\)/, '$1'));
//not below zero
mathRules.unshift(rule(/sub\(NaN,([0-9IVXLCDM]+)\)/, 'NaN'));
//normal syntax: a-b -> sub(a,b)
mathRules.unshift(rule(/([0-9IVXLCDM]+)\s?\-\s?([0-9IVXLCDM]+)/, 'sub($1,$2)'));

//multiplication
mathRules.unshift(rule(/mul\(([0-9IVXLCDM]+),([0-9IVXLCDM]+),([0-9IVXLCDM]+)\)/, 'mul($1,dec($2),add($1,$3))'));
mathRules.unshift(rule(/mul\(([0-9IVXLCDM]+),0,([0-9IVXLCDM]+)\)/, '$2'));
mathRules.unshift(rule(/mul\(([0-9IVXLCDM]+),([0-9IVXLCDM]+)\)/, 'mul($1,$2,0)'));
//normal syntax: a*b -> mul(a,b)
mathRules.unshift(rule(/([0-9IVXLCDM]+)\s?\*\s?([0-9IVXLCDM]+)/, 'mul($1,$2)'));

//comparison
mathRules.unshift(rule(/lt\(([0-9IVXLCDM]+),([0-9IVXLCDM]+)\)/, 'lt(dec($1),dec($2))'));
mathRules.unshift(rule(/lt\(0,[1-9IVXLCDM]+\)/, 'T'));
mathRules.unshift(rule(/lt\([0-9IVXLCDM]+,0\)/, 'F'));

//division, using comparison
mathRules.unshift(rule(/div\([0-9IVXLCDM]+,0\)/, 'NaN'));    //division by 0
mathRules.unshift(rule(/div\(([0-9IVXLCDM]+),([0-9IVXLCDM]+)\)/, 'div($1,$2,0,lt($1,$2))'));
mathRules.unshift(rule(/div\(([0-9IVXLCDM]+),([0-9IVXLCDM]+),([0-9IVXLCDM]+),T\)/, '$3'));
mathRules.unshift(rule(/div\(([0-9IVXLCDM]+),([0-9IVXLCDM]+),([0-9IVXLCDM]+),F\)/, 'div(sub($1,$2),$2,inc($3),lt(sub($1,$2),$2))'));
//normal syntax: a/b -> div(a,b)
mathRules.unshift(rule(/([0-9IVXLCDM]+)\s?\/\s?([0-9IVXLCDM]+)/, 'div($1,$2)'));

//remove leading zeros
mathRules.unshift(rule(/0*(\d+)/g, '$1'));

var applyDecimal = applier([].concat(decimalCounting,mathRules));
var applyRoman = applier([].concat(romanCounting,mathRules));
var input = '7 -1 * 6 + 3';
var input = 'lt(0,0)';
console.log(applyDecimal(input));

var input = 'I + IX * V - IV';
// console.log(applyRoman(input));

// var count = 110;
// var currentRoman = 'M';
// var currentDecimal = '1000';
// while (count--) {
//     console.log(currentDecimal,currentRoman);
//     currentRoman = applyRoman('dec(' + currentRoman + ')');
//     currentDecimal = applyDecimal('dec(' + currentDecimal + ')');
// }