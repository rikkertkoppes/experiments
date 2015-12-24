declare module Cytoscape {
    interface Config {
        container: HTMLElement;
        autounselectify?: boolean;
        elements: (NodeLiteral | EdgeLiteral)[];
        motionBlur?: boolean;
        wheelSensitivity?: number;
        style: any[];
        layout: any;
    }
    export interface NodeLiteral {
        group: string;
        data: any;
    }

    export interface EdgeLiteral {
        group: string;
        data: any;
    }
    export interface Instance {

    }
    interface Static {
        (config: Config): Instance;
    }
}


declare var cytoscape: Cytoscape.Static;