var SVGNS = 'http://www.w3.org/2000/svg';
var MenuElement = (function () {
    function MenuElement(name, path) {
        this.name = name;
        this.path = path;
    }
    MenuElement.prototype.render = function () {
        var d = document.createElement('div');
        d.classList.add('element');
        var title = document.createElement('span');
        title.appendChild(document.createTextNode(this.name));
        d.appendChild(title);
        if (this.path) {
            var svg = document.createElementNS(SVGNS, 'svg');
            svg.setAttribute('width', '50');
            svg.setAttribute('height', '50');
            svg.setAttribute('viewBox', '0 0 100 100');
            svg.appendChild(this.renderPath());
            d.appendChild(svg);
        }
        return d;
    };
    MenuElement.prototype.renderPath = function () {
        var p = document.createElementNS(SVGNS, 'path');
        p.setAttribute('d', this.path);
        return p;
    };
    return MenuElement;
})();
var Menu = (function () {
    function Menu(id, canvas) {
        this.children = [];
        this.canvas = canvas;
        this.el = document.getElementById(id);
    }
    ;
    Menu.prototype.addElement = function (name, path) {
        var item = new MenuElement(name, path);
        this.children.push(item);
        var el = item.render();
        el.addEventListener('click', this.drawItem.bind(this, item));
        this.el.appendChild(el);
        return this;
    };
    Menu.prototype.drawItem = function (item) {
        console.log(arguments);
        this.canvas.drawItem(item);
    };
    return Menu;
})();
var Canvas = (function () {
    function Canvas(id) {
        this.el = document.getElementById(id);
        this.svg = this.el.appendChild(document.createElementNS(SVGNS, 'svg'));
        this.dragHandler = this.drag.bind(this);
        this.dragEndHandler = this.endDrag.bind(this);
    }
    Canvas.prototype.drawItem = function (item) {
        var path = item.renderPath();
        path.addEventListener('mousedown', this.startDrag.bind(this, path));
        this.svg.appendChild(path);
        var bb = path.getBBox();
        console.log(bb);
    };
    Canvas.prototype.startDrag = function (path, e) {
        this.dragPath = path;
        this.anchor = [e.pageX, e.pageY];
        window.addEventListener('mousemove', this.dragHandler);
        window.addEventListener('mouseup', this.dragEndHandler);
        console.log('start', this.anchor);
    };
    Canvas.prototype.drag = function (e) {
        var d = [e.pageX - this.anchor[0], e.pageY - this.anchor[1]];
        var t = this.dragPath.transform;
        console.log(t);
        console.log(d);
    };
    Canvas.prototype.endDrag = function (e) {
        window.removeEventListener('mousemove', this.dragHandler);
        window.removeEventListener('mouseup', this.dragEndHandler);
    };
    return Canvas;
})();
var c = new Canvas('canvas');
var m = new Menu('menu', c)
    .addElement('hrect', 'M 0 25 L 100 25 L 100 75 L 0 75 Z')
    .addElement('vrect', 'M 25 0 L 75 0 L 75 100 L 25 100 Z')
    .addElement('hplate', 'M 0 50 L 100 50 L 100 75 L 0 75 Z')
    .addElement('vplate', 'M 25 0 L 50 0 L 50 100 L 25 100 Z')
    .addElement('ssquare', 'M 25 25 L 25 75 L 75 75 L 75 25 Z')
    .addElement('lsquare', 'M 0 0 L 0 100 L 100 100 L 100 0 Z')
    .addElement('arc', 'M 0 25 L 100 25 L 100 75 L 75 75 A 25 25 0 1 0 25 75 L 0 75 Z')
    .addElement('cylinder', 'M 25 50 A 25 25 0 1 0 50 25 A 25 25 0 0 0 25 50 Z')
    .addElement('ltriangle', 'M 25 75 L 75 75 L 50 50 Z')
    .addElement('ltriangle', 'M 0 75 L 100 75 L 50 25 Z');
console.log(c, m);
