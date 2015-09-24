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
        ;
        Neuron.prototype.fire = function (activity) {
            if (activity === void 0) { activity = 1; }
            this.activity = activity;
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
        ;
        Network.prototype.propagate = function (delay, falloff) {
            var _this = this;
            if (delay === void 0) { delay = 50; }
            if (falloff === void 0) { falloff = 0.2; }
            //calculate new state
            this.neurons.forEach(function (neuron) {
                //neighbors and itself
                var range = neuron.neighbors.concat(neuron);
                var range = neuron.neighbors;
                //average of the range -> need dissipation here
                var activity = range.reduce(function (activity, cell) {
                    return activity + (cell.activity / range.length);
                }, 0);
                // var activity = Math.min(1,neuron.neighbors.reduce(function(activity, neighbor) {
                //     return activity + Math.max(0,neighbor.activity - falloff);
                //     // return Math.min(1, Math.max(activity, neighbor.activity - falloff));
                // }, neuron.activity - falloff));
                // console.log(activity);
                neuron.nextActivity = activity;
                // setTimeout(function() {
                //     neuron.activity = activity;
                // }, 0);
            });
            //set new state
            setTimeout(function () {
                _this.neurons.forEach(function (neuron) {
                    neuron.activity = neuron.nextActivity;
                });
            }, 0);
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
function generateRegular(numPoints) {
    var points = [];
    var i, j, side = Math.floor(Math.sqrt(numPoints));
    for (i = 0; i < side; i++) {
        for (j = 0; j < side; j++) {
            points.push([
                0.5 + Math.round((i + 0.5) * 400 / side),
                0.5 + Math.round((j + 0.5) * 400 / side)
            ]);
        }
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
        p.strokeColor = 'silver';
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
        network.propagate(delay, falloff);
        paper.view.draw();
        // requestAnimationFrame(tick);
        setTimeout(tick, delay);
    }
    tick();
}
function initMouse() {
    var tool = new paper.Tool();
    tool.onMouseDown = function (event) {
        if (event.item.neuron) {
            event.item.neuron.fire();
        }
    };
}
function fireRandom(numberOfCells) {
    if (numberOfCells === void 0) { numberOfCells = 0; }
    while (numberOfCells--) {
        var i = Math.floor(network.neurons.length * Math.random());
        network.neurons[i].fire();
    }
}
function init() {
    // Get a reference to the canvas object
    var canvas = document.getElementById('myCanvas');
    // Create an empty project and a view for the canvas:
    paper.setup(canvas);
    var points = generatePoints(200);
    // var points = generateRegular(200);
    network = generateNetwork(points);
    console.log(network);
    drawCells(network);
    drawPoints(network);
    // drawEdges(network);
    initMouse();
    // Draw the view now:
    paper.view.draw();
    startTick(network, 200);
}
init();
//# sourceMappingURL=main.js.map