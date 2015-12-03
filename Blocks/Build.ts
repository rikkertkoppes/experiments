/// <reference path='Blocks.ts'/>

var SVGNS = 'http://www.w3.org/2000/svg';

class MenuElement {
    name: string;
    path: string;
    constructor(name: string, path?: string) {
        this.name = name;
        this.path = path;
    }
    render() {
        var d:HTMLDivElement = document.createElement('div');
        d.classList.add('element');
        var title: HTMLSpanElement = document.createElement('span');
        title.appendChild(document.createTextNode(this.name));
        d.appendChild(title);
        if (this.path) {
            var svg = <SVGElement> document.createElementNS(SVGNS, 'svg');
            svg.setAttribute('width', '50');
            svg.setAttribute('height', '50');
            svg.setAttribute('viewBox', '-525 -525 1050 1050');
            svg.appendChild(this.renderPath());
            d.appendChild(svg);
        }
        return d;
    }
    renderPath(): SVGPathElement {
        var p = <SVGPathElement> document.createElementNS(SVGNS, 'path');
        p.setAttribute('d', this.path);
        p.setAttribute('transform', 'matrix(1 0 0 1 0 0)');
        return p;
    }
}

class Menu {
    el: HTMLElement;
    children: MenuElement[];
    canvas: Canvas;
    constructor(id:string, canvas: Canvas) {
        this.children = [];
        this.canvas = canvas;
        this.el = document.getElementById(id);
    };
    addElement(name:string,path?: string): Menu {
        var item = new MenuElement(name,path);
        this.children.push(item);
        var el = item.render();
        el.addEventListener('click',this.drawItem.bind(this, item));
        this.el.appendChild(el);
        return this;
    }
    drawItem(item:MenuElement) {
        this.canvas.drawItem(item);

    }
}


class Canvas {
    el: HTMLElement;
    svg: SVGSVGElement;
    g: SVGGElement;
    anchor: SVGPoint;
    anchorMatrix: SVGMatrix;
    dragHandler: (e: MouseEvent) => void;
    dragEndHandler: (e: MouseEvent) => void;
    dragPath: SVGPathElement;
    constructor(id:string) {
        this.el = document.getElementById(id);
        this.svg = <SVGSVGElement> this.el.appendChild(document.createElementNS(SVGNS, 'svg'));
        this.g = <SVGGElement> this.svg.appendChild(document.createElementNS(SVGNS, 'g'));
        this.g.setAttribute('transform', 'scale(0.1)');
        this.dragHandler = this.drag.bind(this);
        this.dragEndHandler = this.endDrag.bind(this);
    }
    drawItem(item:MenuElement) {
        var path = item.renderPath();
        path.setAttribute('transform', 'matrix(1 0 0 1 1000 1000)');
        path.addEventListener('mousedown', this.startDrag.bind(this, path));
        this.g.appendChild(path);
        var bb = path.getBBox();
    }
    getMousePoint(e) {
        var pt = this.svg.createSVGPoint();
        pt.x = e.pageX; pt.y = e.pageY;
        return pt.matrixTransform(this.g.getScreenCTM().inverse());
    }
    startDrag(path:SVGPathElement, e:MouseEvent) {
        this.dragPath = path;
        this.anchor = this.getMousePoint(e);
        this.anchorMatrix = path.transform.baseVal[0].matrix;
        window.addEventListener('mousemove', this.dragHandler);
        window.addEventListener('mouseup', this.dragEndHandler);
    }
    drag(e:MouseEvent) {
        var point = this.getMousePoint(e);
        var d = [point.x - this.anchor.x, point.y - this.anchor.y];
        var m = this.anchorMatrix.translate.apply(this.anchorMatrix,d);

        this.dragPath.setAttribute('transform', 'translate(' + m.e + ',' + m.f + ')');
    }
    endDrag(e:MouseEvent) {
        window.removeEventListener('mousemove', this.dragHandler);
        window.removeEventListener('mouseup', this.dragEndHandler);
    }
}


var c = new Canvas('canvas');
var m = new Menu('menu',c)
    .addElement('hrect','M -512 -256 L -512 256 L 512 256 L 512 -256 Z')
    .addElement('vrect','M -256 -512 L 256 -512 L 256 512 L -256 512 Z')
    .addElement('hplate', 'M -512 -128 L -512 128 L 512 128 L 512 -128 Z')
    .addElement('vplate', 'M -128 -512 L 128 -512 L 128 512 L -128 512 Z')
    .addElement('ssquare','M -256 -256 L -256 256 L 256 256 L 256 -256 Z')
    .addElement('lsquare','M -512 -512 L -512 512 L 512 512 L 512 -512 Z')
    .addElement('arc','M -512 -256 L 512 -256 L 512 256 L 256 256 A 256 256 0 1 0 -256 256 L -512 256 Z')
    .addElement('cylinder','M -256 0 A 256 256 0 1 0 0 -256 A 256 256 0 0 0 -256 0 Z')
    .addElement('striangle','M -256 128 L 256 128 L 0 -128 Z')
    .addElement('ltriangle','M -512 256 L 512 256 L 0 -256 Z');

console.log(c,m);