///<reference path="voronoi.d.ts"/>
declare var paper: any;

interface NNode {
    site: Voronoi.Site;
    neighbors: Voronoi.Site[];
    halfedges: Voronoi.Halfedge[];
    path?: any;
}

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

function getOtherSite(site: Voronoi.Site) {
    return function(halfedge: Voronoi.Halfedge): NNode {
        var edge = halfedge.edge;
        if (site === edge.rSite) {
            return edge.lSite;
        } else {
            return edge.rSite;
        }
    }
}

function generateNetwork(result: Voronoi.Result): NNode[] {
    return result.cells.map(cell => ({
        site: cell.site,
        neighbors: cell.halfedges.map(getOtherSite(cell.site)),
        halfedges: cell.halfedges
    }));
}

function drawPoints(points: number[]): void {
    points.forEach(point => {
        var p = new paper.Path.Circle(point,0.5);
        p.fillColor = 'black';
    });
}

function drawCells(cells: NNode[]) {
    console.log(cells);
    cells.forEach(cell => {
        var p = new paper.Path(cell.halfedges.map(_ => _.getStartpoint()));
        p.fillColor = 'white';
        p.cell = cell;
        p.cell.path = p;
    });
}

function drawEdges(edges: Voronoi.Edge[]) {
    edges.forEach(edge => {
        var l = new paper.Path.Line(edge.va, edge.vb);
        l.strokeColor = 'black';
    });
}

function flash(node: NNode) {
    var p = node.path;
    p.fillColor = 'red';
    setTimeout(function() {
        p.fillColor = 'white';
        node.neighbors.forEach(flash);
    },500);
}

function initMouse() {
    var tool = new paper.Tool();
    tool.onMouseDown = function(event) {
        event.item.fillColor = 'red';
        console.log(event.item.cell);
    }
}

function init(): void {
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