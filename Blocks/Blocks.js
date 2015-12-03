var Shape;
(function (Shape) {
    Shape[Shape["VRECT"] = 0] = "VRECT";
    Shape[Shape["HRECT"] = 1] = "HRECT";
    Shape[Shape["HPLATE"] = 2] = "HPLATE";
    Shape[Shape["VPLATE"] = 3] = "VPLATE";
    Shape[Shape["SSQUARE"] = 4] = "SSQUARE";
    Shape[Shape["LSQUARE"] = 5] = "LSQUARE";
    Shape[Shape["ARC"] = 6] = "ARC";
    Shape[Shape["CYLINDER"] = 7] = "CYLINDER";
    Shape[Shape["STRIANGLE"] = 8] = "STRIANGLE";
    Shape[Shape["LTRIANGLE"] = 9] = "LTRIANGLE";
})(Shape || (Shape = {}));
var Relation;
(function (Relation) {
    Relation[Relation["TOUCHES"] = 0] = "TOUCHES";
    Relation[Relation["NOTOUCH"] = 1] = "NOTOUCH";
    Relation[Relation["SUPPORTS"] = 2] = "SUPPORTS";
    Relation[Relation["ONTOPOF"] = 3] = "ONTOPOF";
})(Relation || (Relation = {}));
var Vertex = (function () {
    function Vertex(id, data) {
        this.id = id;
        this.data = data;
    }
    return Vertex;
})();
var Edge = (function () {
    function Edge(id, from, to, relation) {
        this.id = id;
        this.from = from;
        this.to = to;
        this.relation = relation;
    }
    return Edge;
})();
var Graph = (function () {
    function Graph() {
        this.vertices = [];
        this.edges = [];
    }
    Graph.prototype.vertex = function (data) {
        var v = new Vertex(this.vertices.length, data);
        this.vertices.push(v);
        return v;
    };
    ;
    Graph.prototype.edge = function (from, to, relation) {
        var e = new Edge(this.edges.length, from, to, relation);
        this.edges.push(e);
        return e;
    };
    ;
    //helper
    Graph.prototype.block = function (shape, color) {
        return this.vertex({
            shape: shape,
            color: color
        });
    };
    ;
    Graph.create = function (builder) {
        var graph = new Graph();
        builder(graph);
        return graph;
    };
    return Graph;
})();
function compareSame(a, b) {
    return a === b;
}
function compareVertex(a, b) {
    return Object.keys(a.data).every(function (key) {
        return a.data[key] === b.data[key];
    });
}
function compareEdge(a, b) {
    return compareVertex(a.from, b.from) &&
        compareSame(a.to.id, b.to.id) &&
        compareSame(a.relation, b.relation);
}
//levenshtein distance of two (sorted) arrays
function distance(arr1, arr2, compare) {
    if (compare === void 0) { compare = compareSame; }
    var matrix = [];
    matrix[0] = [0];
    arr1.forEach(function (el, i) {
        matrix[i + 1] = [i + 1];
    });
    arr2.forEach(function (el, i) {
        matrix[0][i + 1] = i + 1;
    });
    arr2.forEach(function (el, j) {
        arr1.forEach(function (el, i) {
            if (compare(arr1[i], arr2[j])) {
                matrix[i + 1][j + 1] = matrix[i][j] || 0;
            }
            else {
                matrix[i + 1][j + 1] = Math.min(matrix[i][j + 1] + 1, matrix[i + 1][j] + 1, matrix[i][j] + 1);
            }
        });
    });
    return matrix[arr1.length][arr2.length];
}
//graph edit distance based on levenshtein distance of verices and edges
//TODO: sort vertices and edges first
function GED(g1, g2) {
    var dv = distance(g1.vertices, g2.vertices, compareVertex);
    var de = distance(g1.edges, g2.edges, compareEdge);
    //value from 0 to 1
    return 1 / (1 + dv + de);
}
var case1 = Graph.create(function (graph) {
    var rect1 = graph.block(Shape.VPLATE, 'red');
    var rect2 = graph.block(Shape.VPLATE, 'red');
    var rect3 = graph.block(Shape.HPLATE, 'red');
    graph.edge(rect1, rect3, Relation.SUPPORTS);
    graph.edge(rect2, rect3, Relation.SUPPORTS);
});
var case2 = Graph.create(function (graph) {
    var rect1 = graph.block(Shape.VPLATE, 'red');
    var rect2 = graph.block(Shape.VPLATE, 'red');
    var rect3 = graph.block(Shape.HPLATE, 'red');
    graph.edge(rect1, rect3, Relation.SUPPORTS);
    graph.edge(rect2, rect3, Relation.SUPPORTS);
    graph.edge(rect1, rect2, Relation.NOTOUCH);
});
var case2a = Graph.create(function (graph) {
    var rect1 = graph.block(Shape.VPLATE, 'red');
    var rect2 = graph.block(Shape.VPLATE, 'red');
    var rect3 = graph.block(Shape.HPLATE, 'red');
    graph.edge(rect1, rect3, Relation.SUPPORTS);
    graph.edge(rect2, rect3, Relation.SUPPORTS);
    graph.edge(rect1, rect2, Relation.TOUCHES);
});
var case3 = Graph.create(function (graph) {
    var rect1 = graph.block(Shape.VPLATE, 'red');
    var rect2 = graph.block(Shape.VPLATE, 'red');
    var rect3 = graph.block(Shape.HPLATE, 'red');
});
var input = Graph.create(function (graph) {
    var rect1 = graph.block(Shape.VPLATE, 'red');
    var rect2 = graph.block(Shape.VPLATE, 'red');
    var rect3 = graph.block(Shape.LTRIANGLE, 'red');
    graph.edge(rect1, rect3, Relation.SUPPORTS);
    graph.edge(rect2, rect3, Relation.SUPPORTS);
    graph.edge(rect1, rect2, Relation.NOTOUCH);
});
function sortBy(key, desc) {
    if (desc === void 0) { desc = false; }
    return function (a, b) {
        if (a[key] === b[key]) {
            return 0;
        }
        else {
            return (desc !== (a[key] < b[key])) ? -1 : 1;
        }
    };
}
// examples from https://en.wikipedia.org/wiki/Levenshtein_distance
// var d1 = distance('sitting'.split(''),'kitten'.split(''));
// var d2 = distance('sunday'.split(''),'saturday'.split(''));
// console.log(d1,d2);
// graph edit distance between two graphs
// console.log(GED(case2, input));
var patterns = [case1, case2, case2a, case3];
function bestMatch(patterns, input) {
    return match(patterns, input)[0];
}
;
function match(patterns, input) {
    return patterns.map(function (pattern) {
        return {
            pattern: pattern,
            grade: GED(pattern, input)
        };
    }).sort(sortBy('grade', true));
}
function learn(brain, input, label, match) {
    if (match === void 0) { match = false; }
    if (!brain[label]) {
        brain[label] = [];
    }
    brain[label].push({
        pattern: input,
        grade: match ? 1 : -1
    });
}
function classify(brain, input) {
    return Object.keys(brain).map(function (label) {
        //TODO: boosting
        var total = brain[label].reduce(function (partial, match) {
            return partial + match.grade * GED(match.pattern, input);
        }, 0);
        return {
            label: label,
            grade: total
        };
    }).sort(sortBy('grade', true));
}
var brain = {};
learn(brain, case1, 'arch', true);
learn(brain, case2, 'arch', true);
// near miss
learn(brain, case2a, 'arch', false);
//something else
learn(brain, case3, 'nothing', true);
//we now have a set of weak classifiers for every label
// console.log(brain);
// var res = classify(brain, input);
// console.log(res);
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
//# sourceMappingURL=Blocks.js.map