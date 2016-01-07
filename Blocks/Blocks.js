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
function hash(str) {
    var i, hash = 0;
    if (str.length == 0)
        return hash.toString(36);
    for (i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
}
//produces a unique string describing an object
function objectToString(obj) {
    return Object.keys(obj).sort().map(function (key) {
        key + ':' + obj[key];
    }).join(',');
}
function sortBy(key, desc) {
    if (desc === void 0) { desc = false; }
    return function (a, b) {
        var va = a[key], vb = b[key];
        if (typeof va === 'function') {
            va = va.call(a);
            vb = vb.call(b);
        }
        if (va === vb) {
            return 0;
        }
        else {
            return (desc !== (va < vb)) ? -1 : 1;
        }
    };
}
var Vertex = (function () {
    function Vertex(data) {
        this.id = generateKey();
        this.data = data;
        Vertex.index[this.id] = this;
    }
    Vertex.prototype.hashCode = function () {
        return hash(objectToString(this.data));
    };
    Vertex.index = {};
    return Vertex;
})();
var Edge = (function () {
    function Edge(from, to, data) {
        this.weight = 0;
        this.id = generateKey();
        this.from = from;
        this.to = to;
        this.data = data;
        Edge.index[this.id] = this;
    }
    Edge.prototype.hashCode = function () {
        return hash(this.from.hashCode() + this.to.hashCode() + objectToString(this.data));
    };
    Edge.index = {};
    return Edge;
})();
function generateKey(length) {
    if (length === void 0) { length = 8; }
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}
var Graph = (function () {
    function Graph(vertices, edges) {
        if (vertices === void 0) { vertices = []; }
        if (edges === void 0) { edges = []; }
        this.vertices = vertices;
        this.edges = edges;
    }
    Graph.prototype.vertex = function (data) {
        var v = new Vertex(data);
        this.vertices.push(v);
        return v;
    };
    ;
    Graph.prototype.edge = function (from, to, relation) {
        var e = new Edge(from, to, relation);
        this.edges.push(e);
        return e;
    };
    ;
    //this plus everything in g2
    Graph.prototype.union = function (g2) {
        return Graph.union(this, g2);
    };
    ;
    //this minus everything in g2
    Graph.prototype.complement = function (g2) {
        var vertices = this.vertices.filter(function (v1) {
            return g2.vertices.map(function (v2) { return v2.id; }).indexOf(v1.id) == -1;
        });
        var edges = this.edges.filter(function (e1) {
            return g2.edges.map(function (e2) { return e2.id; }).indexOf(e1.id) == -1;
        });
        return new Graph(vertices, edges);
    };
    ;
    //what is in both g1 and g2 (this minus everything not in g2)
    Graph.prototype.intersect = function (g2) {
        var vertices = this.vertices.filter(function (v1) {
            return g2.vertices.map(function (v2) { return v2.id; }).indexOf(v1.id) !== -1;
        });
        var edges = this.edges.filter(function (e1) {
            return g2.edges.map(function (e2) { return e2.id; }).indexOf(e1.id) !== -1;
        });
        return new Graph(vertices, edges);
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
    ;
    Graph.union = function (g1, g2) {
        var vertices = g1.vertices.concat(g2.vertices.filter(function (v2) {
            return g1.vertices.map(function (v1) { return v1.id; }).indexOf(v2.id) == -1;
        }));
        var edges = g1.edges.concat(g2.edges.filter(function (e2) {
            return g1.edges.map(function (e1) { return e1.id; }).indexOf(e2.id) == -1;
        }));
        return new Graph(vertices, edges);
    };
    ;
    return Graph;
})();
function compareSame(a, b) {
    return a === b;
}
function compareHash(a, b) {
    return a.hashCode() === b.hashCode();
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
//sort vertices and edges first, by hash to keep consistency
function GED(g1, g2) {
    var byHash = sortBy('hashCode');
    var dv = distance(g1.vertices.sort(byHash), g2.vertices.sort(byHash));
    var de = distance(g1.edges.sort(byHash), g2.edges.sort(byHash));
    //value from 0 to 1
    return 1 / (1 + dv + de);
}
var left = new Vertex({ shape: Shape.VPLATE, color: 'red' });
var right = new Vertex({ shape: Shape.VPLATE, color: 'red' });
var topPlate = new Vertex({ shape: Shape.HPLATE, color: 'red' });
var topTriangle = new Vertex({ shape: Shape.LTRIANGLE, color: 'red' });
var leftSupportsPlate = new Edge(left, topPlate, { type: Relation.SUPPORTS });
var rightSupportsPlate = new Edge(right, topPlate, { type: Relation.SUPPORTS });
var leftSupportsTriangle = new Edge(left, topTriangle, { type: Relation.SUPPORTS });
var rightSupportsTriangle = new Edge(right, topTriangle, { type: Relation.SUPPORTS });
var leftTouchesRight = new Edge(left, right, { type: Relation.TOUCHES });
var rightTouchesLeft = new Edge(right, left, { type: Relation.TOUCHES });
var case1 = new Graph([left, right, topPlate], [leftSupportsPlate, rightSupportsPlate]);
var case2 = new Graph([left, right, topPlate], [leftSupportsPlate, rightSupportsPlate]);
var case2a = new Graph([left, right, topPlate], [leftSupportsPlate, rightSupportsPlate, leftTouchesRight, rightTouchesLeft]);
var case3 = new Graph([left, right, topPlate]);
var input = new Graph([left, right, topTriangle], [leftSupportsTriangle, rightSupportsTriangle]);
// console.log('1',case1);
// console.log('3',case3);
// console.log('1-3',case1.complement(case3));
// console.log('3-1',case3.complement(case1));
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
function learn(brain, input, label, grade) {
    if (grade === void 0) { grade = 0; }
    if (!brain[label]) {
        brain[label] = input;
    }
    else {
        var intersection = brain[label].intersect(input);
        var leftComplement = brain[label].complement(input);
        var rightComplement = input.complement(brain[label]);
        //TODO: check this logic, maybe use boosting here
        //first assemble all examples, then combine them
        //maybe not, think about how the networks are actually stored
        //different observations may be nodes that link to the same content
        //this would allow for compression and identification -> draw
        if (grade < 0) {
            //near miss
            leftComplement.edges.forEach(function (e) { return e.weight += -grade; });
            rightComplement.edges.forEach(function (e) { return e.weight += grade; });
        }
        else {
            //example
            intersection.edges.forEach(function (e) { return e.weight += grade; });
        }
        //matches makes same stuff stronger, misses make them weaker
        //matches makes new stuf stringer, misses make them weaker
        //matches makes unique stuff weaker, misses make them stronger
        brain[label] = brain[label].union(input);
    }
}
function classify(brain, input) {
    return Object.keys(brain).map(function (label) {
        //TODO: boosting
        var total = brain[label].reduce(function (partial, match, i, a) {
            return partial + (match.grade * GED(match.pattern, input) / a.length);
        }, 0);
        return {
            label: label,
            grade: total
        };
    }).sort(sortBy('grade', true));
}
var brain = {};
//basic
learn(brain, case1, 'arch', 1);
//first near miss, supports relation is important
learn(brain, case3, 'arch', -1);
//second near miss, touch relation should not be there
learn(brain, case2a, 'arch', -1);
//example, triangles are also ok
learn(brain, input, 'arch', 1);
// near miss
//something else
learn(brain, case3, 'nothing', 1);
//we now have a set of weak classifiers for every label
console.log(JSON.stringify(brain.arch, null, 2));
// var res = classify(brain, input);
// console.log(res);
//identifying important features
//
//we have the initial example (1) and the first near miss (3). The difference is the omission of the support relations. Hence those are important features
//
//- for misses: important features are the changed ones, overlapping ones are less important
//- for matches: important features are the overlapping ones, changed ones are less important
//
//- require link heuristic: edge = +1
//- forbid link heuristic: edge = -1
//- extend set heuristic: more edges
//- drop link heuristic: edge = 0
//- climb tree heuristic: replacing node with generalization
//
//we can think of a graph describing anything having all possible vertices and all possible adges, all with weight 0
//then, matches and near misses update these relations towards -1 or 1.
//
//following the course, imperative relations (red) are more to -1 or 1 than the unimportant relations.
//Also in course: loosening charachterisics around a seed example to include more examples ~16m
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