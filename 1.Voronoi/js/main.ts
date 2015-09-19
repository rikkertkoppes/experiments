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

function generateRegular(numPoints: number):number[] {
    var points = [];
    var i,j,side = Math.floor(Math.sqrt(numPoints));
    for (i=0; i<side; i++) {
        for (j=0; j<side; j++) {
            points.push([
                0.5 + Math.round((i+0.5)*400/side),
                0.5 + Math.round((j+0.5)*400/side)
            ])
        }
    }
    return points;
}

function generateNetwork(points: number[]): Network.Network {
    return new Network.Network(points);
}

function drawPoints(network: Network.Network): void {
    network.neurons.forEach(neuron => {
        var p = new paper.Path.Circle(neuron.getCenter(), 0.5);
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

function drawEdges(network: Network.Network) {
    network.voronoi.edges.forEach(edge => {
        var l = new paper.Path.Line(edge.va, edge.vb);
        l.strokeColor = 'silver';
    });
}

function createColor(activity: number): string {
    return 'rgba(' + [
        255,
        255 * (1 - activity),
        255 * (1 - activity),
        1
    ].join(',') + ')';
}

function startTick(network: Network.Network, delay = 50, falloff = 0.2) {
    function tick() {
        network.neurons.forEach(function(neuron) {
            var color = createColor(neuron.activity);
            // console.log(color);
            neuron.path.fillColor = color;
        });
        network.propagate(delay,falloff);
        paper.view.draw();
        // requestAnimationFrame(tick);
        setTimeout(tick,delay);
    }
    tick();
}


function initMouse() {
    var tool = new paper.Tool();
    tool.onMouseDown = function(event) {
        if (event.item.neuron) {
            event.item.neuron.fire();
        }
    }
}

function fireRandom(numberOfCells = 0) {
    while (numberOfCells--) {
        var i = Math.floor(network.neurons.length * Math.random());
        network.neurons[i].fire();
    }
}

function init(): void {
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
    startTick(network,200);
}

init();