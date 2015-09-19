///<reference path="Voronoi.d.ts"/>
///<reference path="Neuron.ts"/>
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

    export class Network {
        neurons: Neuron[];
        voronoi: Voronoi.Result;
        constructor(points: number[]) {
            this.voronoi = generateVoronoi(points);
            this.neurons = this.generate(this.voronoi);
            this.link(this.neurons);
        };
        generate(voronoi: Voronoi.Result): Neuron[] {
            return voronoi.cells.map(function(cell) {
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
                    }, [])
                    .map(site => {
                        return neurons[site.voronoiId]
                    })
                );
            });
        };

        propagate(delay = 50, falloff = 0.2) {
            //calculate new state
            this.neurons.forEach(function(neuron) {
                //neighbors and itself
                var range = neuron.neighbors.concat(neuron);
                var range = neuron.neighbors;
                //average of the range -> need dissipation here
                var activity = range.reduce(function(activity,cell) {
                    return activity + (cell.activity / range.length)
                },0);
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
            setTimeout(() => {
                this.neurons.forEach(function(neuron) {
                    neuron.activity = neuron.nextActivity;
                })
            },0);
        }
    }
}