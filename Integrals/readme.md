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