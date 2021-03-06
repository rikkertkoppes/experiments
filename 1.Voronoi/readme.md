Experiment 1: Voronoi
===========

Goal:
-----

- Randomly seed a rectangle with cells
- calculate nearest neughbors using voronoi
- create an in memory network (2D)
- visualize the network
- allow propagation of signals

Observations
--------

- non-regular network results in interesting behaviour. Bits of activity pop up in unexpected places
- firing from multiple spots sometimes leads to lingering activity in the middle
- every activity dies off after some time
- network propagation is best done by internal reflection: every cell should look at its neighbors to determine its own state (like a cellular automaton), rather than dictating its neighbors
- need a diffusion / wave propagation CA 
- every fire adds energy to the system, need dissipation

Sources
------

Voronoi

- <http://www.comp.nus.edu.sg/~tants/jfa/i3d06.pdf>
- <http://paperjs.org/examples/voronoi/>
- <http://www.raymondhill.net/voronoi/rhill-voronoi-demo5.html>
- <http://paperjs.org/assets/js/rhill-voronoi-core.js>