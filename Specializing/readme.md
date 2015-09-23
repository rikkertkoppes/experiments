There are already specialized AI implementations, like vision (Wolfram ImageIdentify), anwering Jeopardy questions (Watson), playing Chess (Deep Blue) or song recognition (Shazam)

As I understand (from Kurzweil), in a human brain, a familiar image or song spikes neuron groups in a hierarchy. Starting with pattern matches, until somewhere a group spikes that says "I know what this is".

Subsequently, I assume all sorts of pathways into memory get activated, leading to assocations or behaviour. This part is missing.

So recognition is a part of intelligence that is covered pretty well. Subsequent actions only in a specialized domain (like moving a the relevant chess piece), which are very much rule based (if not just lines in a program)

Basically, an intelligence works towards a goal. By observing and recognizing (state of) the world (or at least the relevant parts) and changing it to optimize it towards the goal (ComputerPhile video)

Some form of planning is needed there. Steps to work to a goal may be stored in memory (and triggered by the obervation?). When the exact goal (or state) is not observed before, partial matches may lead a way ( - analogies in CRUM)

--------------
In CRUM we have

- rules
- analogies
- networks / connections
- images
- logic
- concepts
---------------

Here is where experience comes into play. An infant does not know how to solve problems, so it copies observed behaviour (mirror neurons), or tries random things (random firing? - what is the system here?)

So what we need is an AI with experience. That works well with goals that change the world, but what about goals that are purely "internal" (what is the answer to life, universe and everything?). How does reasoning work? It does require a set of acquired rules and analogies. The AI needs to be street-wise in the field.

Then what does it need to do? Substitution system (like mathematica, or a computer algebra system (CAS) in general) seems logical

Distributed mind
===========

What if we were to distribute the mind? According to Kurzweil, it is groups of ~300 neurons anyway. This brings down the number of moving parts a bit (20 - 100 * 10^9 neurons to ~ 3e8)

Communication between parts does not need to follow rules of nature (a spike of a neuron), but can be a more elaborate message, like full json, maybe something like web intents.

When Wolfram ImageIdentify identifies an image, it can just report the results. We can use that as input to an association engine (e.g. into dbpedia)

Problem solving
============

Can problem solving be classified?

- navigation (from a state to a goal, using given actions constrained by the world)
- simplification / symbolic substitution reasoning (all of math)

How can a problem be stated?

General intelligence
==============

The holy grail is general intelligence. Which means the AI should be usable for all sorts of problems we use human minds for. Without user modification, except for learning (where does programming stop and learning start? do we have a definition?)

How does "learning" work? Showing images, reading books, browsing the internet? Do we need the tutor? Isn't learning just programming in natural language? Is it fuzzy programming (opening the way for reasoning by analogy)?

It is not so much about rules, but about patterns. And recognizing patterns in goals and plans.

So are there any patterns in problem solving? How can we identify them and categorize them? And plot them in a space so that we can pick patterns that are similar?

Maybe a plot of cause and effect (Fishbone diagram)? Maybe more like a symbolic substitution system (substitute in many small problems, then solve it and aggregate back)?

How do break down a problem into smaller ones?

- problem
- break down in smaller steps
- solve the steps
- excute the solutions
- verify?

Associations via triples (RDF)
===========

A network is nice, but to implement e.g. rules or concepts, we need a typed network. A bit like how RDF is composed of triples (subject predicate object). So not binary associations (x triggers y), but ternary. This allows us to activate analogies, by activating the predicates of a certain type. E.G. activating all triples that have a "is a" predicate. Or a "is part of" predicate.

Triples trivially allow us to store slots in concepts (Thagard). Also rules have typically a triple structure. Images are already networks of patterns and networks are in general a set of triples with one generic predicate (call it "triggers" or "associates with").

Could a network of triples be the key to AGI? If so, there is a whole RDF network we could learn from... On the other hand, I can imagine this was the idea of the RDF network, but never took off (for what reason?)

We may need to add a few things to RDF

- triple strength -> to be able to work the same as common ANN
- local storage
- network activation spreading

There is already quite a bit of network built: https://en.wikipedia.org/wiki/Semantic_network One such example is wordnet (https://en.wikipedia.org/wiki/WordNet) another is dbpedia (http://dbpedia.org/)

This is a nice idea in clojure: http://www.ericrochester.com/pages/code/aggregating-semantic-web-data/

Can we use this in problem solving? 