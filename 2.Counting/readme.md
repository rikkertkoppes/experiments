Counting (positive integer math)
==========

Goal: build up basic math from the principle of counting

Observations: defined symbols for decimal numbers, they can be any base and any symbol and it works fine

Next
-----
Next step may be to even omit the declaration of symbols and deriver everything from rules

rules for next in decimal (don't even need the symbols)

	n(~0) => ~1
	n(~1) => ~2
	n(~2) => ~3
	n(~3) => ~4
	n(~4) => ~5
	n(~5) => ~6
	n(~6) => ~7
	n(~7) => ~8
	n(~8) => ~9
	n(~9) => n(~)0

prev rules are similar, but reversed, also, we need an extra for N, since no negatives

	p(0) => NaN
	p(~0) => p(~)9
	p(~1) => p(~0)

how to remove leading zero's? -> by defining a special rule to decrement 10:

	p(10) => 9

Or a rule that explicitly removes zeros (which is probably better, or just have both):

	0~ => ~

Also adding may me caught in rules

	add(a,0) => a
	add(a,b) => add(n(a),p(b))

The second iteratively reduces the addition, until it reaches the first. Subtracting is similar

For multiplying:
	
	mult(a,b) => mult(a,b,0)
	mult(a,0,c) => c
	mult(a,b,c) => mult(a,p(b),add(a,c))
	
These rules start with the first, carry a subtotal (c) to the third and iterates until no remaining additions (b) need to be done, the second returns the result

For division, we first need comparison

	lt(a,0) => false
	lt(0,b) => true
	lt(a,b) => lt(p(a),p(b))		//this is VERY simple, may be optimized by looking at digits

Then, use the comparison as a stop condition

	div(a,0) => NaN
	div(n,d) => div(n,d,0,lt(n,d))
	div(n,d,t,true) => t
	div(n,d,t,false) => div(sub(n,d),d,n(t),lt(sub(n,d),d))

once operations are done a few times, a new rule can be learned that would skip the calculation
like 
	
	mult(4,8) => 32

This would still allow all calculations, but speed up "known" calculations.

Note that rules need to have an order here

Also, the predicates (=>) is just one example here. Rules need not be bound to only this predicate

The predicate may be "activated" by recognizing we are doing positive integer math. If we are doing Complex math, a pattern recognizer may see that and disable the while group of predicates.