Thinking with RDF
===========

Libraries

- http://www.w3.org/community/rdfjs/wiki/Comparison_of_RDFJS_libraries
- http://www.michelepasin.org/blog/2011/02/24/survey-of-pythonic-tools-for-rdf-and-linked-data-programming/

Implementation
--------

"firing" a node in RDF can get complicated fast. Given a node, we can get all related stuff with a SPARQL query (using the node as subject, predicate or object). All related nodes get "activated" and to find the related nodes of those, we need to create additional queries.

This grows exponentially and does not handle loops.

Can we build a somewhat smarter system, exploiting the fact that signals are fired in a hierarchical fasion in the brain?

Also, does is make sense to approach it as a cellular automaton instead, checking the state of each node (neuron) on each tick? This scales linearly, but is probably very intensive.

So... RDF is fine to define the structure, but operating on it requires something better than the usual libraries (we also need some more metadata on nodes)

Knowledge
--------

Knowledge can be represented by RDF data, this is nothing new (ommitting urls):

    me -> name -> Rikkert
    me -> gender -> male

We can also define that "name" and "gender" are properties

    name -> rdf:type -> property
    gender -> rdf:type -> property

When something (say the auditory or vision system) recognizes the word "Rikkert", some language algorithm may find that it is probably a name. So how would this work? Let's say the "Rikkert" node gets activated, like a neuron. There may be a rule that says it's a name already:

    Rikkert -> rdf:type -> name

This rule would activate the "name" node, the now active nodes activate the "me" node, which also activates other properties of "me" (to a degree). This in turn may activate all kinds of other associations.

But how do we know that "Rikkert" is a name? Someone may have given us the rule, or some language processing may have created the rule from the context.

Actions
--------

Next, we'd like to perform an action, like pronouncing the name, or writing it down. How do actions work in an RDF model? After all, it is about data descriptions. One object methods basically the same as properties:

    car -> drive -> 20mph
    drive -> rdf:type -> method

In turtle syntax

    <car>
        drive 20mph;

Multiple arguments (with a blank node):

    <car>
        drive [
            speed 20mph;
            direction backward].

How do we forward some random activated node (like a word) to an activated action (like "speak")?

For speech, it may work as follows:

- an activated word triggers activation of phonemes (you can already hear it in your head)
- active phonemes (a limited set) can trigger a set of muscle movements creating sound if the predicate is activated

    [
        <rdf:type> <Word>
        <rdf:value> "Hello"
        <phonemes> [
            rdf:type timed-seq
            rdf:li <phoneme-h>
            rdf:li <phoneme-e>
            rdf:li <phoneme-l>
            rdf:li <phoneme-o>
        ]
    ]

And already stored:

    <phoneme-h> <rdf:type> <Phoneme>
    <phoneme-h> <when-speak> [
        rdf:type <rdf:sseq>
        rdf:li <open-mouth>
        rdf:li <breath-out>
    ]

So "hello" triggers the phonemes, these are active. Also a general "when-speak" predicate is triggered, which allows the actions to be executed.

So how is the sequence executed? Phonemes should be activated in a timely manner (or the execution of "when-speak"). "timed-seq" instead of "seq" may do this

how does a transient value (temp stored, e.g. a large number) link to  its parts. Some dynamic pattern matching may produce these links??

... stuck in reasoning here

Timing
----------

In general, some activation may be delayed, by a mechanism like this

    ??? - something like timed-seq above

Substitution reasoning systems (see counting)
-----------------

The vision system may see a number, say 42. The corresponding node gets activated, which tells us it is a number, due to the rule

    42 -> rdf:type -> number

or maybe there is a more general rule, using patterns (regex here, maybe we need BNF). Patterns may greatly reduce the amount of rules needed (we can't possibly list all numbers in triples)

    4 -> is-a -> \d         // \d meaning "digit" in regex
    2 -> is-a -> \d
    \d+ -> is-a -> number   // + meaning "one or more", so one or more digits

Which leads to the concept "number" getting activated. This may further activate predicates defining substitution rules that are related to number

    number -> has-rule -> number-sub

This would activate substition rules (this is a mechanism to enable a set of rules in a certain context only)

    nextOp -> is-a -> number-sub
    ~0 -> nextOp -> ~1
    ~1 -> nextOp -> ~2
    ~2 -> nextOp -> ~3

or (or maybe both?)

    \d+ -> nextOp -> next($0)
    next((\d*)0) -> number-sub -> $11
    next((\d*)1) -> number-sub -> $12
    next((\d*)2) -> number-sub -> $13

This is a rules for getting the next decimal number. The predicate "nextOp" is activated by activating the whole set of number substitutions. Further activation may be done by activating nextOp explicitly by asking for it (input from the vision system that activates "next" word)

    next -> is-a -> word
    nextOp -> name -> next

What about higher level, like additions?

    (\d+)\s?+\s?(\d+) -> number-sub -> add($1,$2)       // 42 + 1 -> add(42,1)
    add(a,0) -> number-sub -> a
    add(a,b) -> number-sub -> add(next(a),prev(b))

This form is somewhat different from next

Representing hierarchies
------------

These math tricks are only text substitution, can we create similar rules that work on hierarchies instead? Or arbitrary data structures?

Think about the mind as data

A list can be represented as head,tail structure, and also using an RDF bag/alt/seq

    list -> head -> 'head value'
    list -> tail -> _1
    _1 -> head -> 'value 2'
    _1 -> tail -> _2

(where _1 and _2 are blank nodes)

Switching domains
-------------

Some node can have multiple rdf:types. Depending on context, pattern matching or some other scheme, one of the types may be more activated.

This can also work through to properties, by means of the domain of the property. So:

    <_:word> <value> "7A"
    <_:word> <rdf:type> <Word>
    <_:word> <rdf:type> <Address-number>
    <_:word> <rdf:type> <Hexadecimal>
    <_:word> <rdf:type> <Licence-plate>
    <dev-value> <rdfs:domain> <Hexadecimal>
    <length> <rdfs:domain> <Word>
    <_:word> <dec-value> "122"
    <_:word> <length> "2"

When the context "Hexadecimal" is activated, this results in "dec-value" getting more activated than "length"
