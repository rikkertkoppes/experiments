///<reference path="voronoi.d.ts"/>
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
function generateNetwork(result) {
    return result.cells.map(function (cell) { return ({
        site: cell.site,
        neighbors: cell.halfedges.map(getOtherSite(cell.site)),
        halfedges: cell.halfedges
    }); });
}
function drawPoints(points) {
    points.forEach(function (point) {
        var p = new paper.Path.Circle(point, 0.5);
        p.fillColor = 'black';
    });
}
function drawCells(cells) {
    console.log(cells);
    cells.forEach(function (cell) {
        var p = new paper.Path(cell.halfedges.map(function (_) { return _.getStartpoint(); }));
        p.fillColor = 'white';
        p.cell = cell;
        p.cell.path = p;
    });
}
function drawEdges(edges) {
    edges.forEach(function (edge) {
        var l = new paper.Path.Line(edge.va, edge.vb);
        l.strokeColor = 'black';
    });
}
function flash(node) {
    var p = node.path;
    p.fillColor = 'red';
    setTimeout(function () {
        p.fillColor = 'white';
        node.neighbors.forEach(flash);
    }, 500);
}
function initMouse() {
    var tool = new paper.Tool();
    tool.onMouseDown = function (event) {
        event.item.fillColor = 'red';
        console.log(event.item.cell);
    };
}
function init() {
    // Get a reference to the canvas object
    var canvas = document.getElementById('myCanvas');
    // Create an empty project and a view for the canvas:
    paper.setup(canvas);
    var points = generatePoints(200);
    var result = generateVoronoi(points);
    var network = generateNetwork(result);
    console.log(network);
    drawPoints(points);
    drawCells(network);
    // drawEdges(result.edges);
    initMouse();
    // Draw the view now:
    paper.view.draw();
}
init();
