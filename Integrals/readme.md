Solver
======

Goal: Create a symbolic reasoning algebra solver using substitution rules

- given a (representation of) a formula
- iteratively apply substitution rules
- while doing this, build a tree of results (bifurcate if two substitutions can be applied)
- the optimal result is the one with the simplest represention
    - smaller operation depth and simplest operations (rank them)

Obervation: the substitution rules are patterns. One pattern is linked to another pattern here
This is some neocortex stuff right?

So we have created a representation for the domain, but also for patterns in the domain.
Then we link patterns

What makes the pattern symbols (_1) special? We can define a hierarchy of symbols:

- 1 is-a _d
- 2 is-a _d

How do we know _1 is (represents) "any" symbol?

Also, can we generalize numeric symbols to be handled the same as non-numeric symbols (see learning)?

What is we set this whole lot up with clojures core.logic? Starting with next and prev? And greater than 1 numbers?

----------
Intermezzo (next.js)

rules for next in decimal (don;t even need the symbols)

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

then there is a rule, next-of 9 is rolling over to 10. etc. This can be caught with core.logic

is-prev-of is the reverse of this

adding is looping through next operations, multplying is looping through adding etc

once operations are done a few times, a new rule can be learned that would skip the calculation
like 4*8 -> 32

This would still allow all calculations, but speed up "known" calculations.


---------------

Calculating
--------

If we have a solver, we can probably calculate function values or partials

Can we also solve for unknowns?

Learning
-------

Can we start with no "innate" knowledge and start by defining symbols and counting, learning math by defining how to add (repeated count), multiply (repeated add) etc?

We need some knowledge of sequences (order at least)

Triples
-------

Can the rules be defined as triples (concepts?)

There are also heuristic rules here (distributing brackets doesn't always yield a result). Could this maybe be used with other uncertain concepts (expanding the goal tree and picking the best end state)?