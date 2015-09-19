///<reference path="Voronoi.d.ts"/>
///<reference path="Network.ts"/>
declare var paper: any;
declare var network: Network.Network;

function generatePoints(numPoints: number): number[] {
    var points = [];
    while (numPoints--) {
        points.push([
            0.5 + Math.round(400 * Math.random()),
            0.5 + Math.round(400 * Math.random())
        ]);
    }
    return points;
}

function generateVoronoi(points: number[]): Voronoi.Result {
    var sites = points.map(point => ({
        x: point[0],
        y: point[1]
    }));
    var voronoi = new Voronoi();
    var bbox = { xl: 0, xr: 400, yt: 0, yb: 400 };
    var result = voronoi.compute(sites, bbox);
    console.log(result.execTime);
    return result;
}

function generateNetwork(result: Voronoi.Result): Network.Network {
    return new Network.Network(result.cells);
}

function drawPoints(network: Network.Network): void {
    network.neurons.forEach(neuron => {
        var p = new paper.Path.Circle(neuron.getCenter(),0.5);
        p.fillColor = 'black';
    });
}

function drawCells(network: Network.Network): void {
    network.neurons.forEach(neuron => {
        var p = new paper.Path(neuron.getPath());
        p.fillColor = 'white';
        p.strokeColor = 'silver';
        neuron.path = p;
        p.neuron = neuron;
    });
}

function drawEdges(edges: Voronoi.Edge[]) {
    edges.forEach(edge => {
        var l = new paper.Path.Line(edge.va, edge.vb);
        l.strokeColor = 'silver';
    });
}

function createColor(activity: number): string {
    return 'rgba('+[
        255,
        255 * (1 - activity),
        255 * (1 - activity),
        1
    ].join(',')+')';
}

function startTick(network: Network.Network, delay=50, falloff = 0.2) {
    function tick() {
        network.neurons.forEach(function(neuron) {
            var color = createColor(neuron.activity);
            // console.log(color);
            neuron.path.fillColor = color;
        });
        network.neurons.forEach(function(neuron) {
            if (neuron.activity > 0) {
                neuron.neighbors.forEach(function(neighbor) {
                    var activity = neuron.activity - falloff;
                    setTimeout(function() {
                        neighbor.activity = activity;
                    }, delay);
                })
            }
        });
        paper.view.draw();
        requestAnimationFrame(tick);
    }
    tick();
}


function initMouse() {
    var tool = new paper.Tool();
    tool.onMouseDown = function(event) {
        if (event.item.neuron) {
            fire(event.item.neuron);
        }
    }
}

function fire(neuron: Network.Neuron) {
    neuron.activity = 1;
}

function fireRandom(numberOfCells = 0) {
    while (numberOfCells--) {
        var i = Math.floor(network.neurons.length * Math.random());
        fire(network.neurons[i]);
    }
}

function init(): void {
    // Get a reference to the canvas object
    var canvas = document.getElementById('myCanvas');
    // Create an empty project and a view for the canvas:
    paper.setup(canvas);

    var points = generatePoints(200);
    var result = generateVoronoi(points);
    network = generateNetwork(result);

    console.log(result);
    console.log(network);

    drawCells(network);
    drawPoints(network);
    // drawEdges(result.edges);
    initMouse();

    // Draw the view now:
    paper.view.draw();
    startTick(network,50);
}

init();