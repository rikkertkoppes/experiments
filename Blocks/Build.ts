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
        p.setAttribute('class', this.name);
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
    paths: SVGPathElement[];
    dragMoveHandler: (e: MouseEvent) => void;
    dragEndHandler: (e: MouseEvent) => void;
    dragPath: SVGPathElement;
    onUpdate: (canvas:Canvas) => void;
    constructor(id:string) {
        this.paths = [];
        this.el = document.getElementById(id);
        this.svg = <SVGSVGElement> this.el.appendChild(document.createElementNS(SVGNS, 'svg'));
        this.g = <SVGGElement> this.svg.appendChild(document.createElementNS(SVGNS, 'g'));
        this.g.setAttribute('transform', 'scale(0.1)');
        this.dragMoveHandler = this.dragMove.bind(this);
        this.dragEndHandler = this.dragEnd.bind(this);
    }
    drawItem(item:MenuElement):void {
        var path = item.renderPath();
        path.setAttribute('transform', 'matrix(1 0 0 1 1000 1000)');
        path.addEventListener('mousedown', this.dragStart.bind(this, path));
        this.paths.push(path);
        this.g.appendChild(path);
        this.drop(path);
        if (this.onUpdate) {
            this.onUpdate(this);
        }
    }
    getMousePoint(e): SVGPoint {
        var pt = this.svg.createSVGPoint();
        pt.x = e.pageX; pt.y = e.pageY;
        return pt.matrixTransform(this.g.getScreenCTM().inverse());
    }
    getEdges(path: SVGPathElement) {
        var m = path.transform.baseVal[0].matrix;
        var bb = path.getBBox();
        return {
            left: m.e - bb.width / 2,
            right: m.e + bb.width / 2,
            top: m.f - bb.height/2,
            bottom: m.f + bb.height/2
        };
    }
    supports(query:SVGPathElement,base:SVGPathElement) {
        var qlr = this.getEdges(query);
        var blr = this.getEdges(base);
        return (
            (query !== base) &&
            (qlr.right > blr.left) &&
            (qlr.left < blr.right) &&
            (qlr.bottom === blr.top)
        );
    }
    touches(query:SVGPathElement,base:SVGPathElement) {
        var qlr = this.getEdges(query);
        var blr = this.getEdges(base);
        return (
            (query !== base) &&
            (
                (qlr.bottom > blr.top) ||
                (qlr.top < blr.bottom)
            ) &&
            (
                (Math.abs(qlr.right - blr.left) < 50) || 
                (Math.abs(qlr.left - blr.right) < 50)
            )
        );
    }
    drop(path: SVGPathElement):void {
        var lr = this.getEdges(path);
        //get heighest level within the width of the dropped item
        var floor = this.paths.reduce((floor, item) => {
            var ilr = this.getEdges(item);
            if ((item !== path) && (lr.right > ilr.left) && (lr.left < ilr.right)) {
                var ptop = ilr.top;
                return Math.min(ptop, floor);
            }
            return floor;
        },3000);
        var bb = path.getBBox();
        var m = path.transform.baseVal[0].matrix;
        var y = floor - bb.height / 2;
        path.setAttribute('transform', 'translate(' + m.e + ',' + y + ')');
    }
    dragStart(path:SVGPathElement, e:MouseEvent):void {
        this.dragPath = path;
        this.anchor = this.getMousePoint(e);
        this.anchorMatrix = path.transform.baseVal[0].matrix;
        window.addEventListener('mousemove', this.dragMoveHandler);
        window.addEventListener('mouseup', this.dragEndHandler);
    }
    dragMove(e:MouseEvent):void {
        var point = this.getMousePoint(e);
        var d = [point.x - this.anchor.x, point.y - this.anchor.y];
        var m = this.anchorMatrix.translate.apply(this.anchorMatrix,d);

        this.dragPath.setAttribute('transform', 'translate(' + m.e + ',' + m.f + ')');
    }
    dragEnd(e:MouseEvent):void {
        window.removeEventListener('mousemove', this.dragMoveHandler);
        window.removeEventListener('mouseup', this.dragEndHandler);
        this.drop(this.dragPath);
        if (this.onUpdate) {
            this.onUpdate(this);
        }
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

//creating a network from the canvas and visualizing it
//using http://visjs.org/ here
declare var vis;

interface visNode {
    id: number;
    label: string;
}
interface visEdge {
    from: number;
    to: number;
}

class Network {
    net: any;
    canvas: Canvas;
    constructor(id:string) {
        this.net = new vis.Network(document.getElementById(id), {}, {});
    }
    fromCanvas(canvas:Canvas) {
        this.canvas = canvas;
        canvas.onUpdate = this.update.bind(this);
    }
    getRelations(path:SVGPathElement,i): visEdge[] {
        return this.canvas.paths.reduce((relations, item,j) => {
            if (this.canvas.supports(path,item)) {
                relations.push({
                    from: j,
                    to: i,
                    label: 'supports',
                    arrows: 'to'
                });
            } else if (this.canvas.touches(path, item)) {
                relations.push({
                    from: j,
                    to: i,
                    label: 'touches',
                    arrows: 'to'
                });
            }
            return relations;
        }, []);
    }
    getNode(path: SVGPathElement, i: number):visNode {
        return {
            id: i,
            label: path.getAttribute('class')
        }
    }
    update(canvas) {
        var nodes = canvas.paths.map(this.getNode);
        var edges = canvas.paths.reduce((all, path, i) => {
            return all.concat(this.getRelations(path, i));
        },[]);
        this.net.setData({ nodes: nodes, edges: edges });
    }
}

var n = new Network('network').fromCanvas(c);