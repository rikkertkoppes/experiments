Counting
==========

Goal: build up basic math from the principle of counting

Observations: defined symbols for decimal numbers, they can be any base and any symbol and it works fine

Next step may be to even omit the declaration of symbols and deriver everything from rules

rules for next in decimal (don't even need the symbols)

	n(~0) = ~1
	n(~1) = ~2
	n(~2) = ~3
	n(~3) = ~4
	n(~4) = ~5
	n(~5) = ~6
	n(~6) = ~7
	n(~7) = ~8
	n(~8) = ~9
	n(~9) = n(~)0

prev rules are similar, but reversed, also, we need an extra for N, since no negatives

	p(0) = NaN
	p(~0) = p(~)9
	p(~1) = p(~0)

how to remove leading zero's?

adding is looping through next operations, multplying is looping through adding etc

once operations are done a few times, a new rule can be learned that would skip the calculation
like 4*8 -> 32

This would still allow all calculations, but speed up "known" calculations.


