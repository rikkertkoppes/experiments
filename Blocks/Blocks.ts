enum Shape {
    VRECT,
    HRECT,
    CIRCLE,
    TRIANGLE
}

enum Relation {
    TOUCH,
    NOTOUCH,
    SUPPORTS,
    ONTOPOF,
}

class Vertex {
    id: number;
    data: any;
    constructor(id: number, data: any) {
        this.id = id;
        this.data = data;
    }
}

class Edge {
    id: number;
    from: Vertex;
    to: Vertex;
    relation: any;
    constructor(id: number, from: Vertex, to: Vertex, relation: any) {
        this.id = id;
        this.from = from;
        this.to = to;
        this.relation = relation;
    }
}

class Graph {
    vertices: Vertex[];
    edges: Edge[];
    constructor() {
        this.vertices = [];
        this.edges = [];
    }
    vertex(data: any): Vertex {
        var v = new Vertex(this.vertices.length, data);
        this.vertices.push(v);
        return v;
    };
    edge(from: Vertex, to: Vertex, relation: any): Edge {
        var e = new Edge(this.edges.length, from, to, relation);
        this.edges.push(e);
        return e;
    };
    //helper
    block(shape: Shape, color: string) {
        return this.vertex({
            shape: shape,
            color: color
        });
    };
    static create(builder: (graph: Graph) => void): Graph {
        var graph = new Graph();
        builder(graph);
        return graph;
    }
}

function compareSame(a: any, b: any): boolean {
    return a === b;
}

function compareVertex(a: Vertex, b: Vertex): boolean {
    return Object.keys(a.data).every(function(key) {
        return a.data[key] === b.data[key];
    });
}

function compareEdge(a: Edge, b: Edge): boolean {
    return compareVertex(a.from, b.from) &&
        compareSame(a.to.id, b.to.id) &&
        compareSame(a.relation, b.relation);
}

//levenshtein distance of two (sorted) arrays
function distance<T>(arr1: T[], arr2: T[], compare = compareSame): number {
    var matrix: number[][] = [];
    matrix[0] = [0];
    arr1.forEach(function(el, i) {
        matrix[i + 1] = [i + 1];
    });
    arr2.forEach(function(el, i) {
        matrix[0][i + 1] = i + 1;
    });
    arr2.forEach(function(el, j) {
        arr1.forEach(function(el, i) {
            if (compare(arr1[i], arr2[j])) {
                matrix[i + 1][j + 1] = matrix[i][j] || 0;
            } else {
                matrix[i + 1][j + 1] = Math.min(
                    matrix[i][j + 1] + 1,
                    matrix[i + 1][j] + 1,
                    matrix[i][j] + 1
                );
            }
        });
    });
    return matrix[arr1.length][arr2.length];
}

//graph edit distance based on levenshtein distance of verices and edges
function GED(g1: Graph, g2: Graph): number {
    var dv = distance(g1.vertices, g2.vertices, compareVertex);
    var de = distance(g1.edges, g2.edges, compareEdge);
    //value from 0 to 1
    return 1 / (1 + dv + de);
}

var case1 = Graph.create(function(graph) {
    var rect1 = graph.block(Shape.VRECT, 'red');
    var rect2 = graph.block(Shape.VRECT, 'red');
    var rect3 = graph.block(Shape.HRECT, 'red');

    graph.edge(rect1, rect3, Relation.SUPPORTS);
    graph.edge(rect2, rect3, Relation.SUPPORTS);
});

var case2 = Graph.create(function(graph) {
    var rect1 = graph.block(Shape.VRECT, 'red');
    var rect2 = graph.block(Shape.VRECT, 'red');
    var rect3 = graph.block(Shape.HRECT, 'red');

    graph.edge(rect1, rect3, Relation.SUPPORTS);
    graph.edge(rect2, rect3, Relation.SUPPORTS);
    graph.edge(rect1, rect2, Relation.NOTOUCH);
});

var case2a = Graph.create(function(graph) {
    var rect1 = graph.block(Shape.VRECT, 'red');
    var rect2 = graph.block(Shape.VRECT, 'red');
    var rect3 = graph.block(Shape.HRECT, 'red');

    graph.edge(rect1, rect3, Relation.SUPPORTS);
    graph.edge(rect2, rect3, Relation.SUPPORTS);
    graph.edge(rect1, rect2, Relation.TOUCH);
});

var case3 = Graph.create(function(graph) {
    var rect1 = graph.block(Shape.VRECT, 'red');
    var rect2 = graph.block(Shape.VRECT, 'red');
    var rect3 = graph.block(Shape.HRECT, 'red');
});

var input = Graph.create(function(graph) {
    var rect1 = graph.block(Shape.VRECT, 'red');
    var rect2 = graph.block(Shape.VRECT, 'red');
    var rect3 = graph.block(Shape.TRIANGLE, 'red');

    graph.edge(rect1, rect3, Relation.SUPPORTS);
    graph.edge(rect2, rect3, Relation.SUPPORTS);
    graph.edge(rect1, rect2, Relation.NOTOUCH);
});


function sortBy(key: string, desc = false) {
    return function(a, b): number {
        if (a[key] === b[key]) {
            return 0;
        } else {
            return (desc !== (a[key] < b[key])) ? -1 : 1;
        }
    }
}

// examples from https://en.wikipedia.org/wiki/Levenshtein_distance
// var d1 = distance('sitting'.split(''),'kitten'.split(''));
// var d2 = distance('sunday'.split(''),'saturday'.split(''));
// console.log(d1,d2);

// graph edit distance between two graphs
// console.log(GED(case2, input));

var patterns = [case1, case2, case2a, case3];

function bestMatch(patterns: Graph[], input: Graph): any {
    return match(patterns, input)[0];
}

interface Match {
    pattern: Graph;
    grade: number;
};

function match(patterns: Graph[], input: Graph): Match[] {
    return patterns.map(function(pattern) {
        return {
            pattern: pattern,
            grade: GED(pattern, input)
        }
    }).sort(sortBy('grade', true));
}

//best of patterns
console.log(bestMatch(patterns, input));
console.log(match(patterns, input));

interface Brain {
    [index: string]: Match[];
}

function learn(brain: Brain, input: Graph, label: string, match = false) {
    if (!brain[label]) {
        brain[label] = [];
    }
    brain[label].push({
        pattern: input,
        grade: match ? 1 : -1
    });
}

function classify(brain: Brain, input: Graph) {
    return Object.keys(brain).map(function(label) {
        //TODO: boosting
        var total = brain[label].reduce(function(partial, match) {
            return partial + match.grade * GED(match.pattern, input);
        }, 0);
        return {
            label: label,
            grade: total
        };
    }).sort(sortBy('grade', true));
}

var brain: Brain = {};

learn(brain, case1, 'arch', true);
learn(brain, case2, 'arch', true);
// near miss
learn(brain, case2a, 'arch', false);
//something else
learn(brain, case3, 'nothing', true);

//we now have a set of weak classifiers for every label
console.log(brain);


var res = classify(brain, input);
console.log(res);

//TODO
//- work with boosting
//- instead of working with the patterns, should we work with the vertices and edges in the patterns and let weights be built by the boosting algorithm? Updating the weights every time a new pattern is learned?
//- as a result, every edge and vertex is a weak (binary- it is there or not) classifier in itself, then the pattern recognizer is a booster with weights on any of these. These weights describe how important features in the pattern are.
//- this makes a whole lot of sense! also from brain topology

//- scaling this up, then for recognizing, we have a spreading match pattern. Each booster (graph) is a classifier for a higher level booster. These are not binary, but continuous [-1,1].
//
//- how does this work for logic? analogies? analogies are patterns right? It would be mostly the edges that match there. We need to drag in some associations (generalizations) before we can do a good match.

// console.log(g1);
// console.log(g2);