
declare var ace: any;
declare var jsonld: any;
declare var cytoscape: any;

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

class Set<T> {
    store = {};
    hasher: (obj: T) => string;
    constructor(hasher = obj => JSON.stringify(obj)) {
        this.hasher = hasher;
    };
    push(value: T):Set<T> {
        this.store[this.hasher(value)] = value;
        return this;
    }
    length(): number {
        return Object.keys(this.store).length;
    }
    values():T[] {
        return Object.keys(this.store).map(key => this.store[key]);
    }
}

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

    quads.forEach(function(quad) {
        var subId = ''+quad.subject.value;
        nodes.push({
            group:'nodes',
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
        var objId = (['IRI', 'blank node'].indexOf(quad.object.type) !== -1) ? ''+quad.object.value : 'n'+nodes.length();
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
                id: 'e'+edges.length(),
                parent: quad.graph.value,
                source: subId,
                target: objId,
                label: getLocal(quad.predicate.value),
                title: quad.predicate.value,
            }
        });
    })

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
                    'height':'label'
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
                    'content': 'data(label)',
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
        layout: {name: 'cose' }
    });
}

function handleChange() {
    var val = editor.getValue();
    localStorage.setItem('ld', val);
    try {
        var doc = JSON.parse(val);
        console.log(doc);
        jsonld.toRDF(doc,function(err, dataset) {
            var quads = Object.keys(dataset).reduce(function(quads, graphId) {
                return quads.concat(dataset[graphId].map(function(quad) {
                    quad.graph = {
                        type: "IRI",
                        value: graphId
                    }
                    return quad;
                }))
            }, []);
            console.log(dataset, quads);
            render(quads);
        });
    } catch (e) {
        //nothing
    }
}

editor.on('change', handleChange);