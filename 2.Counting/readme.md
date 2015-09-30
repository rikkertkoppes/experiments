Counting (positive integer math)
==========

Goal: build up basic math from the principle of counting

Result: <http://rikkertkoppes.github.io/experiments/2.Counting/>

Created two implementation. One functional, based around function composition (`count.ts`). The other is a rule based system based on regular expression string replacement (`rules.ts`).

Observations:
--------

- defined symbols for decimal numbers, they can be any base and any symbol and it works fine
- defined symbols for roman numbers, these are somewhat different, yet still simple
- it is possible to set up basic positive integer math using substitution rules alone
- the system can learn by remembering (adding rules for) calculations that have already been done. We learn the tables of multiplication below 10 in order to do long multiplication

Demo's
---------

### Decimals

Basic positive integer math (including 0), using string substitution.

These are the rules for incrementing numbers:

	rule(/inc\(\)/, '1');
	rule(/inc\((\d*)0\)/, '$11');
	rule(/inc\((\d*)1\)/, '$12');
	rule(/inc\((\d*)2\)/, '$13');
	rule(/inc\((\d*)3\)/, '$14');
	rule(/inc\((\d*)4\)/, '$15');
	rule(/inc\((\d*)5\)/, '$16');
	rule(/inc\((\d*)6\)/, '$17');
	rule(/inc\((\d*)7\)/, '$18');
	rule(/inc\((\d*)8\)/, '$19');
	rule(/inc\((\d*)9\)/, 'inc($1)0');

And these for decrementing

	rule(/dec\(0\)/, 'NaN');
	rule(/dec\((\d+)0\)/, 'dec($1)9');
	rule(/dec\((\d*)1\)/, '$10');
	rule(/dec\((\d*)2\)/, '$11');
	rule(/dec\((\d*)3\)/, '$12');
	rule(/dec\((\d*)4\)/, '$13');
	rule(/dec\((\d*)5\)/, '$14');
	rule(/dec\((\d*)6\)/, '$15');
	rule(/dec\((\d*)7\)/, '$16');
	rule(/dec\((\d*)8\)/, '$17');
	rule(/dec\((\d*)9\)/, '$18');
	//remove leading zeros
	rule(/0*(\d+)/g, '$1');

### Romans

Basic math using roman numerals. The only thing that differers from the decimal implementation are the rules for incrementing and decrementing.

These are the rules for incrementing

	rule(/inc\(([IVXLCDM]+)\)/, '$1I');
	rule(/inc\(0\)/, 'I');
	rule(/IIII/, 'IV');
	rule(/IVI/, 'V');
	rule(/VIV/, 'IX');
	rule(/IXI/, 'X');
	rule(/XXXX/, 'XL');
	rule(/XLX/, 'L');
	rule(/LXL/, 'XC');
	rule(/XCX/, 'C');
	rule(/CCCC/, 'CD');
	rule(/CDC/, 'D');
	rule(/DCD/, 'CM');
	rule(/CMC/, 'M');

And these for decrementing

	rule(/dec\(0\)/, 'NaN');
	rule(/dec\(([IVXLCDM]+)I\)/, '$1');
	rule(/dec\(I\)/, '0');
	rule(/dec\(([IVXLCDM]*)V\)/, '$1IV');
	rule(/dec\(([IVXLCDM]*)IV\)/, '$1III');
	rule(/dec\(([IVXLCDM]*)X\)/, '$1IX');
	rule(/dec\(([IVXLCDM]*)IX\)/, '$1VIII');
	rule(/dec\(([IVXLCDM]*)L\)/, '$1XLIX');
	rule(/dec\(([IVXLCDM]*)XL\)/, '$1XXXIX');
	rule(/dec\(([IVXLCDM]*)C\)/, '$1XCIX');
	rule(/dec\(([IVXLCDM]*)XC\)/, '$1LXXXIX');
	rule(/dec\(([IVXLCDM]*)D\)/, '$1CDXCIX');
	rule(/dec\(([IVXLCDM]*)CD\)/, '$1CCCXCIX');
	rule(/dec\(([IVXLCDM]*)M\)/, '$1CMXCIX');
	rule(/dec\(([IVXLCDM]*)CM\)/, '$1DCCCXCIX');

Doing math
-----

When doing math, the order of rules becomes very important. The rules are stored in an array and the rules engine applies the first rules in the array first.

In the source code, the most important rules come last. This is done by prepending every rule to the already existing array (by using `unshift`)

### Addition

We can perform addition by iteratively incrementing one operand and decrementing the other until the second equals 0. Then another rule kicks in stating that a number plus 0 equals the number:

	rule(/add\(([0-9IVXLCDM]+),([0-9IVXLCDM]+)\)/, 'add(inc($1),dec($2))');
	rule(/add\(([0-9IVXLCDM]+),0\)/, '$1');

Furthermore, we add a rule to rewrite normal math (`a + b`) in the format used in the rules (`add(a,b)`)

	rule(/([0-9IVXLCDM]+)\s?\+\s?([0-9IVXLCDM]+)/, 'add($1,$2)');

The substitution sequence goes like this

	4 + 3		//input
	add(4,3)	//3rd rule
	add(5,2)	//1st rule
	add(6,1)	//1st rule
	add(7,0)	//1st rule
	7			//2nd rule

### Subtraction

This is basically the same as addition, decrement the first number and the second number until the second is 0. Then another rule kicks in that returns the number itself.

	rule(/sub\(([0-9IVXLCDM]+),([0-9IVXLCDM]+)\)/, 'sub(dec($1),dec($2))');
	rule(/sub\(([0-9IVXLCDM]+),0\)/, '$1');

Note that you can't go below 0, to the first number should be greater than or equal to the second

	rule(/sub\(NaN,([0-9IVXLCDM]+)\)/, 'NaN');

Also, there is a rule that rewrites normal math in the representation used here:

	rule(/([0-9IVXLCDM]+)\s?\-\s?([0-9IVXLCDM]+)/, 'sub($1,$2)');

The substitution sequence goes like this

	4 - 3		//input
	sub(4,3)	//4rd rule
	sub(3,2)	//1st rule
	sub(2,1)	//1st rule
	sub(1,0)	//1st rule
	1			//2nd rule

### Multiplication

This is done by repeated addition:

	rule(/mul\(([0-9IVXLCDM]+),([0-9IVXLCDM]+),([0-9IVXLCDM]+)\)/, 'mul($1,dec($2),add($1,$3))');
	rule(/mul\(([0-9IVXLCDM]+),0,([0-9IVXLCDM]+)\)/, '$2');
	rule(/mul\(([0-9IVXLCDM]+),([0-9IVXLCDM]+)\)/, 'mul($1,$2,0)');

And math rewriting

	rule(/([0-9IVXLCDM]+)\s?\*\s?([0-9IVXLCDM]+)/, 'mul($1,$2)');

Note that a subtotal is carried over as the third argument to `mul`. The substitution sequence goes like this:

	4 * 3			//input
	mul(4,3)		//4th rule
	mul(4,3,0)		//3rd rule
	mul(4,2,4)		//1st rule
	mul(4,1,8)		//1st rule
	mul(4,0,12)		//1st rule
	12				//2nd rule

Also note that the above substitution sequences are simplifications. What actually happens is more like this:

	...
	mul(4,3,0)							//multiplication 3rd rule
	mul(4,dec(3),add(4,0))				//multiplication 1st rule
	mul(4,dec(3),4)						//addition 2nd rule
	mul(4,2,4)							//decrement 5th rule
	mul(4,dec(2),add(4,4))				//multiplication 1st rule
	mul(4,dec(2),add(inc(4),dec(4)))	//addition 1st rule
	mul(4,dec(2),add(5,dec(4)))			//increment 6th rule
	mul(4,dec(2),add(5,3))				//decrement 6th rule
	...
	mul(4,dec(2),8))					//addition 2nd rule
	mul(4,1,8)							//decrement 4th rule
	...
	mul(4,0,12)							//multiplication 1st rule
	12									//multiplication 2nd rule

### Division

Division is done by repeated subtraction. We first need a comparison rule to be able to define a stop rule when the numerator is smaller than de denominator:

	rule(/lt\(([0-9IVXLCDM]+),([0-9IVXLCDM]+)\)/, 'lt(dec($1),dec($2))');
	rule(/lt\(0,[1-9IVXLCDM]+\)/, 'T');
	rule(/lt\([0-9IVXLCDM]+,0\)/, 'F');

These rules state that:

1. Anything is not smaller than 0, including 0 (3rd rule)
2. 0 is always smaller than anything, except 0
3. for all other numbers, compare the decremented numbers

Then for division, we have

	rule(/div\([0-9IVXLCDM]+,0\)/, 'NaN');
	rule(/div\(([0-9IVXLCDM]+),([0-9IVXLCDM]+)\)/, 'div($1,$2,0,lt($1,$2))');
	rule(/div\(([0-9IVXLCDM]+),([0-9IVXLCDM]+),([0-9IVXLCDM]+),T\)/, '$3');
	rule(/div\(([0-9IVXLCDM]+),([0-9IVXLCDM]+),([0-9IVXLCDM]+),F\)/, 'div(sub($1,$2),$2,inc($3),lt(sub($1,$2),$2))');

And math rewriting

	rule(/([0-9IVXLCDM]+)\s?\/\s?([0-9IVXLCDM]+)/, 'div($1,$2)');

The first rule prohibits dividing by 0, the second sets things up (much like multiplication). The third is a stop rule, returning the accumulated quotient. The last rule accumulates the quotient while the stop condition is not true.

The (simplified) substitution sequence is like this:

	13 / 4
	div(13,4)		//5th rule
	div(13,4,0,F)	//2nd rule
	div(9,4,1,F)	//4th rule
	div(5,4,2,F)	//4th rule
	div(1,4,3,T)	//4th rule
	3				//3rd rule

Improvements
---------

Some ideas for improvements:

- we may write the math rules directely in the normal format (`1+2` instead of `add(1,2)`)
- once operations are done a few times, a new rule can be learned that would skip the calculation
like

		mult(4,8) => 32

	This would still allow all calculations, but speed up "known" calculations.

- Multiplication rules can be simpler, especially for large numbers (long multiplication)
- Same for division (long division)

Rules to RDF triples
-----

Rules can be generalized to RDF triples, in which the predicate can have a particular rdf:domain, e.g. integer math.

The predicate may be "activated" by recognizing we are doing positive integer math. If we are doing Complex math, a pattern recognizer may see that and disable the whole group of predicates.


