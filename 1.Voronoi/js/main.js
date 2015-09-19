///<reference path="Voronoi.d.ts"/>
var Network;
(function (Network) {
    var Neuron = (function () {
        function Neuron(cell) {
            this.activity = 0;
            this.cell = cell;
        }
        ;
        Neuron.prototype.setNeighbors = function (neighbors) {
            this.neighbors = neighbors;
        };
        ;
        Neuron.prototype.getCenter = function () {
            return this.cell.site;
        };
        ;
        Neuron.prototype.getPath = function () {
            return this.cell.halfedges.map(function (_) { return _.getStartpoint(); });
        };
        return Neuron;
    })();
    Network.Neuron = Neuron;
})(Network || (Network = {}));
///<reference path="Voronoi.d.ts"/>
///<reference path="Neuron.ts"/>
var Network;
(function (Network_1) {
    function getOtherSite(site) {
        return function (halfedge) {
            var edge = halfedge.edge;
            if (site === edge.rSite) {
                return edge.lSite;
            }
            else {
                return edge.rSite;
            }
        };
    }
    function generateVoronoi(points) {
        var sites = points.map(function (point) { return ({
            x: point[0],
            y: point[1]
        }); });
        var voronoi = new Voronoi();
        var bbox = { xl: 0, xr: 400, yt: 0, yb: 400 };
        var result = voronoi.compute(sites, bbox);
        console.log(result.execTime);
        return result;
    }
    var Network = (function () {
        function Network(points) {
            this.voronoi = generateVoronoi(points);
            this.neurons = this.generate(this.voronoi);
            this.link(this.neurons);
        }
        ;
        Network.prototype.generate = function (voronoi) {
            return voronoi.cells.map(function (cell) {
                var n = new Network_1.Neuron(cell);
                return n;
            });
        };
        ;
        Network.prototype.link = function (neurons) {
            neurons.forEach(function (neuron) {
                // console.log(neuron.cell.halfedges);
                neuron.setNeighbors(neuron.cell.halfedges
                    .reduce(function (sites, halfedge) {
                    var s = getOtherSite(neuron.cell.site)(halfedge);
                    if (s) {
                        return sites.concat(s);
                    }
                    else {
                        return sites;
                    }
                }, [])
                    .map(function (site) {
                    return neurons[site.voronoiId];
                }));
            });
        };
        return Network;
    })();
    Network_1.Network = Network;
})(Network || (Network = {}));
///<reference path="Network.ts"/>
function generatePoints(numPoints) {
    var points = [];
    while (numPoints--) {
        points.push([
            0.5 + Math.round(400 * Math.random()),
            0.5 + Math.round(400 * Math.random())
        ]);
    }
    return points;
}
function generateNetwork(points) {
    return new Network.Network(points);
}
function drawPoints(network) {
    network.neurons.forEach(function (neuron) {
        var p = new paper.Path.Circle(neuron.getCenter(), 0.5);
        p.fillColor = 'black';
    });
}
function drawCells(network) {
    network.neurons.forEach(function (neuron) {
        var p = new paper.Path(neuron.getPath());
        p.fillColor = 'white';
        // p.strokeColor = 'silver';
        neuron.path = p;
        p.neuron = neuron;
    });
}
function drawEdges(network) {
    network.voronoi.edges.forEach(function (edge) {
        var l = new paper.Path.Line(edge.va, edge.vb);
        l.strokeColor = 'silver';
    });
}
function createColor(activity) {
    return 'rgba(' + [
        255,
        255 * (1 - activity),
        255 * (1 - activity),
        1
    ].join(',') + ')';
}
function startTick(network, delay, falloff) {
    if (delay === void 0) { delay = 50; }
    if (falloff === void 0) { falloff = 0.2; }
    function tick() {
        network.neurons.forEach(function (neuron) {
            var color = createColor(neuron.activity);
            // console.log(color);
            neuron.path.fillColor = color;
        });
        network.neurons.forEach(function (neuron) {
            if (neuron.activity > 0) {
                neuron.neighbors.forEach(function (neighbor) {
                    var activity = neuron.activity - falloff;
                    setTimeout(function () {
                        neighbor.activity = activity;
                    }, delay);
                });
            }
        });
        paper.view.draw();
        requestAnimationFrame(tick);
    }
    tick();
}
function initMouse() {
    var tool = new paper.Tool();
    tool.onMouseDown = function (event) {
        if (event.item.neuron) {
            fire(event.item.neuron);
        }
    };
}
function fire(neuron) {
    neuron.activity = 1;
}
function fireRandom(numberOfCells) {
    if (numberOfCells === void 0) { numberOfCells = 0; }
    while (numberOfCells--) {
        var i = Math.floor(network.neurons.length * Math.random());
        fire(network.neurons[i]);
    }
}
function init() {
    // Get a reference to the canvas object
    var canvas = document.getElementById('myCanvas');
    // Create an empty project and a view for the canvas:
    paper.setup(canvas);
    var points = generatePoints(200);
    network = generateNetwork(points);
    console.log(network);
    drawCells(network);
    drawPoints(network);
    drawEdges(network);
    initMouse();
    // Draw the view now:
    paper.view.draw();
    startTick(network, 50);
}
init();
//# sourceMappingURL=main.js.map