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

    export interface ElementCollection {
        //manipulation
        remove(): ElementCollection;
        restore();
        clone(): ElementCollection;
        copy(): ElementCollection;
        move(location: any);
        //events
    }

    export interface Instance {
        add(eleObj: (NodeLiteral|EdgeLiteral));
        add(eleObjs: (NodeLiteral|EdgeLiteral)[]);
        add(eles: ElementCollection);
    }
    interface Static {
        (config: Config): Instance;
    }
}


declare var cytoscape: Cytoscape.Static;