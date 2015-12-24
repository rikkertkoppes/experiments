/// <reference path='Cytoscape.d.ts'/>
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
var Set = (function () {
    function Set(hasher) {
        if (hasher === void 0) { hasher = function (obj) { return JSON.stringify(obj); }; }
        this.store = {};
        this.hasher = hasher;
    }
    ;
    Set.prototype.push = function (value) {
        this.store[this.hasher(value)] = value;
        return this;
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
    quads.forEach(function (quad) {
        var subId = '' + quad.subject.value;
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
        var objId = (['IRI', 'blank node'].indexOf(quad.object.type) !== -1) ? '' + quad.object.value : 'n' + nodes.length();
        nodes.push({
            group: 'nodes',
            data: {
                id: objId,
                parent: quad.graph.value,
                // label: getLocal(quad.object.value),
                label: quad.object.value,
                title: quad.object.value,
                color: getColor(quad.object),
                shape: getShape(quad.object)
            }
        });
        edges.push({
            group: 'edges',
            data: {
                id: 'e' + edges.length(),
                parent: quad.graph.value,
                source: subId,
                target: objId,
                label: getLocal(quad.predicate.value),
                title: quad.predicate.value
            }
        });
    });
    var elements = [].concat(nodes.values(), edges.values());
    console.log(elements);
    cy = cytoscape({
        container: document.getElementById('network'),
        // boxSelectionEnabled: false,
        autounselectify: true,
        elements: elements,
        style: [
            {
                selector: 'node',
                css: {
                    'content': 'data(label)',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'width': 'label',
                    'height': 'label'
                }
            },
            {
                selector: '$node > node',
                css: {
                    'padding-top': '10px',
                    'padding-left': '10px',
                    'padding-bottom': '10px',
                    'padding-right': '10px',
                    'text-valign': 'top',
                    'text-halign': 'center',
                    'background-color': '#bbb'
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