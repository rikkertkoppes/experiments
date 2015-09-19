///<reference path="Voronoi.d.ts"/>
module Network {
    export class Neuron {
        cell: Voronoi.Cell;
        neighbors: Neuron[];
        path: any;
        activity: number;
        constructor(cell: Voronoi.Cell) {
            this.activity = 0;
            this.cell = cell;
        };
        setNeighbors(neighbors: Neuron[]) {
            this.neighbors = neighbors;
        };
        getCenter(): Voronoi.Site {
            return this.cell.site;
        };
        getPath(): Voronoi.Vertex[] {
            return this.cell.halfedges.map(_ => _.getStartpoint());
        }
    }
}