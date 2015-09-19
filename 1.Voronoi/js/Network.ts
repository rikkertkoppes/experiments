///<reference path="Voronoi.d.ts"/>
module Network {
    function getOtherSite(site: Voronoi.Site) {
        return function(halfedge: Voronoi.Halfedge): Voronoi.Site {
            var edge = halfedge.edge;
            if (site === edge.rSite) {
                return edge.lSite;
            } else {
                return edge.rSite;
            }
        }
    }

    export class Network {
        neurons: Neuron[];
        constructor(cells: Voronoi.Cell[]) {
            this.neurons = this.generate(cells);
            this.link(this.neurons);
        };
        generate(cells: Voronoi.Cell[]):Neuron[] {
            return cells.map(function(cell) {
                var n = new Neuron(cell);
                return n;
            });
        };
        link(neurons: Neuron[]) {
            neurons.forEach(neuron => {
                // console.log(neuron.cell.halfedges);
                neuron.setNeighbors(neuron.cell.halfedges
                    .reduce(function(sites, halfedge) {
                        var s = getOtherSite(neuron.cell.site)(halfedge);
                        if (s) {
                            return sites.concat(s);
                        } else {
                            return sites;
                        }
                    },[])
                    .map(site => {
                        return neurons[site.voronoiId]
                    })
                );
            });
        }
    }

    export class Neuron {
        cell: Voronoi.Cell;
        neighbors: Neuron[];
        path: any;
        activity: number;
        constructor(cell: Voronoi.Cell) {
            this.activity = 0;
            this.cell = cell;
        };
        setNeighbors(neighbors:Neuron[]) {
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