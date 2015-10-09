/// <reference path="webgl.d.ts" />
/// <reference path="igloo.d.ts" />

class CA {
    igloo: Igloo.Igloo;
    viewsize: Float32Array;
    statesize: Float32Array;
    timer: number;
    stepCount = 1;
    running = false;
    programs: { [key: string]: Igloo.Program; };
    buffers:  { [key: string]: WebGLBuffer; };
    textures:  { [key: string]: Igloo.Texture; };
    framebuffers:  { [key: string]: Igloo.FrameBuffer; };
    constructor(canvas: HTMLCanvasElement, scale = 4) {
        var igloo = this.igloo = new Igloo(<HTMLCanvasElement> canvas);
        var gl = igloo.gl;

        this.scale = scale;
        var w = canvas.width, h = canvas.height;
        this.viewsize = new Float32Array([w, h]);
        this.statesize = new Float32Array([w /scale, h/scale]);
        this.timer = null;

        this.timer = null;
        this.lasttick = CA.now();

        gl.disable(gl.DEPTH_TEST);

        this.programs = {
            copy: igloo.program('quad.vert', 'copy.frag'),
            ca: igloo.program('quad.vert', 'ca.frag')
        };

        this.buffers = {
            quad: igloo.array(Igloo.QUAD2)
        };

        this.textures = {
            front: igloo.texture(null, gl.RGBA, gl.REPEAT, gl.NEAREST)
                .blank(this.statesize[0], this.statesize[1]),
            back: igloo.texture(null, gl.RGBA, gl.REPEAT, gl.NEAREST)
                .blank(this.statesize[0], this.statesize[1])
        };

        this.framebuffers = {
            step: igloo.framebuffer()
        };

        // this.setRandom();
        // set a single pixel to white mid bottom row
        this.textures['front'].subset([255, 255, 255, 255], 127, 0, 1, 1);
    };
    static now(): number {
        return Math.floor(Date.now() / 1000);
    };
    set(state): CA {
        var gl = this.igloo.gl;
        var rgba = new Uint8Array(this.statesize[0] * this.statesize[1] * 4);
        for (var i = 0; i < state.length; i++) {
            var ii = i * 4;
            rgba[ii + 0] = rgba[ii + 1] = rgba[ii + 2] = state[i] ? 255 : 0;
            rgba[ii + 3] = 255;
        }
        this.textures['front'].subset(rgba, 0, 0, this.statesize[0], this.statesize[1]);
        return this;
    };
    setRandom(p): CA {
        var gl = this.igloo.gl, size = this.statesize[0] * this.statesize[1];
        p = p == null ? 0.5 : p;
        var rand = new Uint8Array(size);
        for (var i = 0; i < size; i++) {
            rand[i] = Math.random() < p ? 1 : 0;
        }
        this.set(rand);
        return this;
    };
    //swap front and back textures
    swap(): CA {
        var tmp = this.textures['front'];
        this.textures['front'] = this.textures['back'];
        this.textures['back'] = tmp;
        return this;
    };
    //render on back, get texture from front
    step(): CA {
        if (CA.now() != this.lasttick) {
            $('.fps').text(this.fps + ' FPS');
            this.lasttick = CA.now();
            this.fps = 0;
        } else {
            this.fps++;
        }
        // console.log(this.fps);
        var gl = this.igloo.gl;
        this.framebuffers['step'].attach(this.textures['back']);
        this.textures['front'].bind(0);
        gl.viewport(0, 0, this.statesize[0], this.statesize[1]);
        this.programs['ca'].use()
            .attrib('quad', this.buffers['quad'], 2)
            .uniformi('state', 0)
            .uniform('scale', this.statesize)
            .uniformi('step', this.stepCount)
            .draw(gl.TRIANGLE_STRIP, 4);
        this.swap();
        this.stepCount = (this.stepCount + 1) % this.statesize[1];
        // console.log(this.stepCount);
        return this;
    };
    draw(): CA {
        var gl = this.igloo.gl;
        this.igloo.defaultFramebuffer.bind();
        this.textures['front'].bind(0);
        gl.viewport(0, 0, this.viewsize[0], this.viewsize[1]);
        this.programs['copy']
            .use()
            .attrib('quad', this.buffers['quad'], 2)
            .uniformi('state', 0)
            .uniform('scale', this.viewsize)
            .draw(gl.TRIANGLE_STRIP, 4);

        return this;
    };
    computeTick(): CA {
        if (this.running) {
            this.step();
            setTimeout(() => this.computeTick(),0);
            // this.computeTick();
        }
    }
    tick(): CA {
        if (this.running) {
            this.step();
            // this.draw();
            setTimeout(() => this.tick(),0);
            // this.tick();
            // requestAnimationFrame(() => this.tick());
        }
        return this;
    }
    start(): CA {
        this.running = true;
        // this.computeTick();
        this.tick();
        return this;
    };
    stop(): CA {
        this.running = false;
    }
}

window.onload = function() {
    var canvas = document.getElementById('main');
    var ca = new CA(<HTMLCanvasElement> canvas);
    ca.draw().start();
    // ca.tick().tick();
}