Goal: create a (simple) cellular automaton that can simulate self assembly of lipids into bilayer sheets, micelles and liposomes

Thought: maybe the lipid properties dictate which assembly is reached

Option one
--------

3D, one for rotation, two for spatial (as start)

- if rotations are close, attract
- if spatially close, attract
- what about tail - tail?
- what about hodrophylic / phobic properties?

Option two
----------

2 spatial dimensions, one state for rotation

- allows to code in tail - tail interaction

    [-][ ] -> [i][ ]
    [-][ ]    [!][ ]

- suppose 9 neighbors and 8 rotational states + empty
- simple automaton = 3 neightbors, 2 states -> 2^2^3 rules (256)
- this one 9^9^9 = (2e77) rules
- what is the fraction that preserves mass?

rules
-----

    [ ][ ][ ]
    [ ][x][ ] => [x]    (8) //no reason to move or turn
    [ ][ ][ ]

    [ ][ ][ ]
    [i][x][-] => [/]    (2*8^3 = 1024) //average out rotation
    [ ][ ][ ]

    [ ][ ][ ]
    [i][ ][i] => [i]    //creation? we need a machenism to move, but this is not it
    [ ][ ][ ]