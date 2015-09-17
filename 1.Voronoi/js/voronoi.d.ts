declare module Voronoi {
    export interface Vertex {
        x: number;
        y: number;
    }

    export interface Site {
        x: number;
        y: number;
        voronoiId: number;
    }

    export interface Edge {
        lSite: Site;
        rSite: Site;
        va: Vertex;
        vb: Vertex;
    }

    export interface Halfedge {
        site: Site;
        edge: Edge;
        getStartpoint(): Vertex;
        getEndpoint(): Vertex;
    }

    export interface Cell {
        site: Site;
        halfedges: Halfedge[];
    }

    export interface Result {
        edges: Edge[];
        cells: Cell[];
        execTime: number;
    }
}

declare var Voronoi: any;