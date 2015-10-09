Progress
---------

- created basic webgl setup using threejs (works a lot easier in typescript)
- global data should be passed in using uniforms
- local data (vertex level) should be passed in as attributes. This is probably where activation should be
- we need a way to spawn the 2D canvas with the vertices in a meaningful way. As each pixel should lie on a face that is coupled to 3 or 4 vertices
- pass vertex activity through attribute (and then a varying)
    - maybe this is not the best idea, the ibex game stores world state in a texture and effectively only uses a fragment shader (and one quad of geometry: <https://github.com/gre/ibex/blob/master/src/index.js#L728>) to update the state (texture)
    - fireing neurons could be communicated through uniforms (although this is limited in size)

So suppose we can let data flow into the CA, and we can set it up to distribute data around. How can we get it out?

Also, can't we use a single texture on a mesh of triangles and thus still benefiting from passing in attributes to the vertexes?

How can data flow back from the fragment shader to the vertex shader (and back to attributes)? I guess it cannot. We may be able to get the texture buffer and read out specific locations though. That might not be costly (http://nullprogram.com/blog/2014/06/22/ - glReadPixels is costly). Every step would update the texture to a new state (check ibex for that)

automata.ts
---------

created a simple CA, based on game of life implementation
todo:

- encode rules in the 'gba' values (do we only need totalistic automata?)
- separate the step and draw cycles

how can we encode elementary ca in a 2D ca?

- elementary 1D = 2^2^3 = 256 rules
- elementary 2D = 2^2^8 = 1.15 e77 rules (quite a lot) ~ so we can realistically only encode totalistic 2D rules

Read more on other buffers than just the color buffer: http://www.glprogramming.com/red/chapter10.html
-> webgl does support depth and stencil buffers

nullprogram reports 18000 fps, while I can't seem to get any higher than about 200 (chrome) or 250 (firefox). Something's odd here. Is it just the gpu?

In a hidden markov model, n layers, between layers m and n, with a_m and a_n nodes, we have a_m * a_n connections. If a_m = a_n = a, we need a cube of n*a*a connection stengths. Also, we need size and variance parameters, so n*a*a * 3 bytes or so. This is a a*a movie of n frames. The "brain" movie.

Game of life
-------

There are lots of possible game of life rules: http://fano.ics.uci.edu/ca/rules/

These can be encoded as two 9bits configurations.
- Birth on 0,1,2,3,4,5,6,7,8 neigbhors
- Survive on 0,1,2,3,4,5,6,7,8 neighbors

The original game of life is B3/S23 (http://fano.ics.uci.edu/ca/rules/list.html). Which is
      012345678
    B 000100000     //32
    S 001100000     //96

The rules can hence be compacted in 18bits total, which can be encoded in the GBA channels of a texture
This way we can also create zones in the world that have a different set of rules

Create a page that takes a rulestring as query parameters. Then set up the texture accordingly. Create a generic shader that can handle any rule string

Add controls to manipulate the rule string and poke the world. Maybe also draw in the world with a rule string brush

Notes
----------

check igllo: <https://github.com/skeeto/igloojs>

read about <http://greweb.me/2014/09/ibex-cellular-automata/>
<http://greweb.me/2014/09/ibex/>

- with regard to weights in rules: the weights can be encoded in the cell state (color).
- with regard to links: additional connections (beyond nearest neighbors) may also be encoded in cell state.

order of millions of cells (HD is 2 million pixels, 4K is around 9 million pixels) should be doable with a gpu

(million vertices is not a real problem by the way: <http://www.html5rocks.com/en/tutorials/webgl/million_letters/>)

Takeaways:
- use one geometry for every object (vertex) (draw once)
- do geometry animation in the vertex shader (not in js)
- do the pixel animation in the fragment shader (not in js)


maybe we can encode connections using vertex shaders, at least to the outside world. The value of a vertex can directly influence the the fragments in an interpolated way. This would need some experiments

note: shaders are also hierarchical. (vertex first, then fragment shader)

voronois can also be approached with webgl, however the analogy is different. Here every cell is a vertex, where as above, we propose to let every cell be a pixel
- <http://blog.alexbeutel.com/332/interactive-voronoi-diagrams-with-webgl/>
- <http://nullprogram.com/blog/2014/06/01/>

Also a gpu path solver:
- <http://nullprogram.com/blog/2014/06/22/>

And game of life:
- <http://nullprogram.com/blog/2014/06/10/>

Would it be possible to set up a CA that executes the math rules (need states for all symbols, operators and possibly parenthesis)