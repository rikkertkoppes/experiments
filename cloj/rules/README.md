Rules
======

Clojure take at rules. Prettu much the same with regex's. But we may take advantage of clojures data-centric design

However, it would be nice to implement the rules as functions and macros. Something like

    (rule `(:a + :b) `(add :a :b))

But how would we translate `(\d+)0` to a list?
There would be a difference between lists without spaces and lists with spaces
Maybe just omit all the spaces and treat everything as a series of characters.

    "10 - 5 + 3"
    "10-5+3"
    '(1 0 - 5 + 3)
    ; adjacent digits are one number, synbols are operators
    '(num(1 0) op(-) num(5) op(+) num(3))
    ; stuck....


Maybe get some inspiration from Norvig's language example (treat rules as data)

- First create a list of symbols

        [a x ^ 2 + b x + 13]
        [10 - 5 + 3]

    with proper parsing, numbers are immediately clustered

- Rules are a subsitution system, like mathematica. This is known as a computer algebra system (cas) <https://en.wikipedia.org/wiki/List_of_computer_algebra_systems>
- can we maybe develop a cas lib for clojure? (there is expresso: https://github.com/clojure-numerics/expresso)