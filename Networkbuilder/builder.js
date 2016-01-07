/// <reference path='Cytoscape.d.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var cy;
var editor = ace.edit("editor");
editor.getSession().setMode("ace/mode/javascript");
if (localStorage.getItem('ld')) {
    editor.setValue(localStorage.getItem('ld'));
    handleChange();
}
function getLocal(IRI) {
    return IRI;
    return IRI.split(/\W/g).pop();
}
//only unique values. Based on hasher function, which defaults to JSON stringify
var Set = (function () {
    function Set(hash) {
        if (hash === void 0) { hash = function (obj) { return JSON.stringify(obj); }; }
        this.store = {};
        this.hash = hash;
    }
    ;
    Set.prototype.push = function (value) {
        this.store[this.hash(value)] = value;
        return this;
    };
    Set.prototype.has = function (value) {
        return !!this.store[this.hash(value)];
    };
    Set.prototype.get = function (hash) {
        return this.store[hash];
    };
    Set.prototype.length = function () {
        return Object.keys(this.store).length;
    };
    Set.prototype.values = function () {
        var _this = this;
        return Object.keys(this.store).map(function (key) { return _this.store[key]; });
    };
    return Set;
})();
//set where every entry is an array, groups "same" items
var GroupSet = (function (_super) {
    __extends(GroupSet, _super);
    function GroupSet() {
        _super.apply(this, arguments);
    }
    GroupSet.prototype.push = function (value) {
        if (this.has(value)) {
            this.store[this.hash(value)].push(value);
        }
        else {
            this.store[this.hash(value)] = [value];
        }
        return this;
    };
    return GroupSet;
})(Set);
function getColor(node) {
    switch (node.datatype) {
        // case 'http://www.w3.org/2001/XMLSchema#string': return 'yellow';
        // case 'http://www.w3.org/2001/XMLSchema#integer': return 'red';
        // case 'http://www.w3.org/2001/XMLSchema#float': return 'red';
        default: return undefined;
    }
}
function getShape(node) {
    switch (node.type) {
        case 'literal': return 'box';
        default: return 'ellipse';
    }
}
function render(quads) {
    var nodes = new Set();
    var edges = new Set();
    //build up a GroupSet, grouping objects with the same subject and predicate together
    var quadIndex = quads.reduce(function (set, quad) {
        return set.push(quad);
    }, new GroupSet(function (quad) {
        return quad.subject.value + ' -> ' + quad.predicate.value;
    }));
    console.log(quadIndex);
    quadIndex.values().forEach(function (quads) {
        //create the subject node
        var quad = quads[0];
        var subId = '' + quad.subject.value;
        var groupId = null;
        var objId = null;
        nodes.push({
            group: 'nodes',
            data: {
                id: subId,
                parent: quad.graph.value,
                // label: getLocal(quad.subject.value),
                label: quad.subject.value,
                title: quad.subject.value,
                color: getColor(quad.subject),
                shape: getShape(quad.subject)
            }
        });
        //create a group of objects if there are more
        if (quads.length > 1) {
            groupId = nodes.length();
            nodes.push({
                group: 'nodes',
                data: {
                    id: groupId,
                    parent: quad.graph.value,
                    label: quad.predicate.value
                }
            });
        }
        quads.forEach(function (quad) {
            objId = (['IRI', 'blank node'].indexOf(quad.object.type) !== -1) ? '' + quad.object.value : 'n' + nodes.length();
            nodes.push({
                group: 'nodes',
                data: {
                    id: objId,
                    parent: groupId || quad.graph.value,
                    // label: getLocal(quad.object.value),
                    label: quad.object.value,
                    title: quad.object.value,
                    color: getColor(quad.object),
                    shape: getShape(quad.object)
                }
            });
        });
        edges.push({
            group: 'edges',
            data: {
                id: 'e' + edges.length(),
                parent: quad.graph.value,
                source: subId,
                target: groupId || objId,
                label: getLocal(quad.predicate.value),
                title: quad.predicate.value
            }
        });
    });
    // // var edgeIndex = {};
    // var edgesIndex = edges.values().reduce(function(edgesIndex, edge) {
    //     var key = edge.data.source + edge.data.title;
    //     if (edgesIndex[key]) {
    //         //edge already there
    //         if (edgesIndex[key] instanceof Array) {
    //             //collection already there
    //             edgesIndex[key].push(edge);
    //         } else {
    //             //no collection, create parent node
    //             var parent = {
    //                 group: 'nodes',
    //                 data: {
    //                     id: 'n'+nodes.length(),
    //                     label: edge.data.label,
    //                     title: edge.data.title,
    //                     color: 'green'
    //                 }
    //             }
    //             nodes.push(parent);
    //         }
    //     } else {
    //         edgesIndex[key] = edge;
    //     }
    //     return edges;
    // },{});
    var elements = [].concat(nodes.values(), edges.values());
    console.log(elements);
    cy = cytoscape({
        container: document.getElementById('network'),
        // boxSelectionEnabled: false,
        autounselectify: true,
        elements: elements,
        motionBlur: true,
        wheelSensitivity: 0.5,
        style: [
            {
                selector: 'node',
                css: {
                    'shape': 'roundrectangle',
                    'content': 'data(label)',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'width': 'label',
                    'height': 'label',
                    'padding-top': '4px',
                    'padding-left': '4px',
                    'padding-bottom': '4px',
                    'padding-right': '4px',
                    'border-width': '2',
                    'border-color': 'black',
                    'background-color': 'white'
                }
            },
            {
                selector: '$node > node',
                css: {
                    'padding-top': '10px',
                    'padding-left': '10px',
                    'padding-bottom': '10px',
                    'padding-right': '10px',
                    'text-valign': 'bottom'
                }
            },
            {
                selector: 'edge',
                css: {
                    'target-arrow-shape': 'triangle',
                    'content': 'data(label)'
                }
            },
            {
                selector: ':selected',
                css: {
                    'background-color': 'black',
                    'line-color': 'black',
                    'target-arrow-color': 'black',
                    'source-arrow-color': 'black'
                }
            }
        ],
        layout: { name: 'cose' }
    });
}
function handleChange() {
    var val = editor.getValue();
    localStorage.setItem('ld', val);
    try {
        var doc = JSON.parse(val);
        console.log(doc);
        jsonld.toRDF(doc, function (err, dataset) {
            var quads = Object.keys(dataset).reduce(function (quads, graphId) {
                return quads.concat(dataset[graphId].map(function (quad) {
                    quad.graph = {
                        type: "IRI",
                        value: graphId
                    };
                    return quad;
                }));
            }, []);
            console.log(dataset, quads);
            render(quads);
        });
    }
    catch (e) {
    }
}
editor.on('change', handleChange);
//# sourceMappingURL=builder.js.map