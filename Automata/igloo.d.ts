module Igloo {
    export interface Buffer {
        bind(): Buffer;
        update(): Buffer;
    }

    export interface Texture {
        bind(unit: number): Texture;
        blank(width: number, height: number): Texture;
        set(source: Array<number>|ArrayBufferView, xoff:number, yoff:number): Texture;
        subset(source: Array<number>|ArrayBufferView, xoff:number, yoff:number, width: number, height: number): Texture;
        copy(source: Array<number>|ArrayBufferView, x:number, y: number, width: number, height: number): Texture;
    }

    export interface FrameBuffer {
        bind(): FrameBuffer;
        unbind(): FrameBuffer;
        attach(texture: Texture): FrameBuffer;
        attachDepth(width: number, height: number): FrameBuffer;
    }

    export interface Program {
        makeShader(type: number, source: string): WebGLShader;
        use(): Program;
        uniform(name: string, value: number|Array<any>|ArrayBufferView): Program;
        matrix(name: string, matrix: Array<any>|ArrayBufferView): Program;
        uniformi(name, value): Program;
        attrib(name: string, value: WebGLBuffer, size: number, stride?: number): Program;
        draw(mode?: number, count?: number, type?: number): Program;
        disable(): Program;
    }

    export interface IglooGlobal {
        new (canvas: HTMLCanvasElement): Igloo;
        fetch(url: string, callback: Function) : string;
        getContext(canvas: HTMLCanvasElement, options: Object, noerror: boolean);
        looksLikeURL(str: string): boolean;
        isArray(obj: any): boolean;
        Program(): Program;
        Buffer(): Buffer;
        Texture(): Texture;
        Framebuffer(): FrameBuffer;
        QUAD2: Float32Array;
    }
    export interface Igloo {
        gl: WebGLRenderingContext;
        canvas: HTMLCanvasElement;
        defaultFramebuffer: FrameBuffer;
        program(vertex: string, fragment: string, transform?: Function);
        array(data: ArrayBuffer|ArrayBufferView, usage?: number): WebGLBuffer;
        elements();
        texture(source: string, format:number, wrap: number, filter: number): Texture;
        framebuffer(texture?: Texture): FrameBuffer;
    }
}

declare var Igloo: Igloo.IglooGlobal;