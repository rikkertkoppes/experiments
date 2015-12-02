
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
            svg.setAttribute('viewBox', '0 0 100 100');
            svg.appendChild(this.renderPath());
            d.appendChild(svg);
        }
        return d;
    }
    renderPath(): SVGPathElement {
        var p = <SVGPathElement> document.createElementNS(SVGNS, 'path');
        p.setAttribute('d', this.path);
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
        console.log(arguments);
        this.canvas.drawItem(item);

    }
}


class Canvas {
    el: HTMLElement;
    svg: SVGElement;
    anchor: number[];
    dragHandler: (e: MouseEvent) => void;
    dragEndHandler: (e: MouseEvent) => void;
    dragPath: SVGPathElement;
    constructor(id:string) {
        this.el = document.getElementById(id);
        this.svg = <SVGElement> this.el.appendChild(document.createElementNS(SVGNS, 'svg'));
        this.dragHandler = this.drag.bind(this);
        this.dragEndHandler = this.endDrag.bind(this);
    }
    drawItem(item:MenuElement) {
        var path = item.renderPath();
        path.addEventListener('mousedown', this.startDrag.bind(this, path));
        this.svg.appendChild(path);
        var bb = path.getBBox();
        console.log(bb);
    }
    startDrag(path:SVGPathElement, e:MouseEvent) {
        this.dragPath = path;
        this.anchor = [e.pageX, e.pageY];
        window.addEventListener('mousemove', this.dragHandler);
        window.addEventListener('mouseup', this.dragEndHandler);
        console.log('start', this.anchor);
    }
    drag(e:MouseEvent) {
        var d = [e.pageX - this.anchor[0], e.pageY - this.anchor[1]];
        var t = this.dragPath.transform;
        console.log(t);
        console.log(d);
    }
    endDrag(e:MouseEvent) {
        window.removeEventListener('mousemove', this.dragHandler);
        window.removeEventListener('mouseup', this.dragEndHandler);
    }
}


var c = new Canvas('canvas');
var m = new Menu('menu',c)
    .addElement('hrect','M 0 25 L 100 25 L 100 75 L 0 75 Z')
    .addElement('vrect','M 25 0 L 75 0 L 75 100 L 25 100 Z')
    .addElement('hplate', 'M 0 50 L 100 50 L 100 75 L 0 75 Z')
    .addElement('vplate', 'M 25 0 L 50 0 L 50 100 L 25 100 Z')
    .addElement('ssquare','M 25 25 L 25 75 L 75 75 L 75 25 Z')
    .addElement('lsquare','M 0 0 L 0 100 L 100 100 L 100 0 Z')
    .addElement('arc','M 0 25 L 100 25 L 100 75 L 75 75 A 25 25 0 1 0 25 75 L 0 75 Z')
    .addElement('cylinder','M 25 50 A 25 25 0 1 0 50 25 A 25 25 0 0 0 25 50 Z')
    .addElement('ltriangle','M 25 75 L 75 75 L 50 50 Z')
    .addElement('ltriangle','M 0 75 L 100 75 L 50 25 Z');

console.log(c,m);