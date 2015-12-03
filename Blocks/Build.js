/// <reference path='Blocks.ts'/>
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
            svg.setAttribute('viewBox', '-525 -525 1050 1050');
            svg.appendChild(this.renderPath());
            d.appendChild(svg);
        }
        return d;
    };
    MenuElement.prototype.renderPath = function () {
        var p = document.createElementNS(SVGNS, 'path');
        p.setAttribute('d', this.path);
        p.setAttribute('class', this.name);
        p.setAttribute('transform', 'matrix(1 0 0 1 0 0)');
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
        this.canvas.drawItem(item);
    };
    return Menu;
})();
var Canvas = (function () {
    function Canvas(id) {
        this.paths = [];
        this.el = document.getElementById(id);
        this.svg = this.el.appendChild(document.createElementNS(SVGNS, 'svg'));
        this.g = this.svg.appendChild(document.createElementNS(SVGNS, 'g'));
        this.g.setAttribute('transform', 'scale(0.1)');
        this.dragMoveHandler = this.dragMove.bind(this);
        this.dragEndHandler = this.dragEnd.bind(this);
    }
    Canvas.prototype.drawItem = function (item) {
        var path = item.renderPath();
        path.setAttribute('transform', 'matrix(1 0 0 1 1000 1000)');
        path.addEventListener('mousedown', this.dragStart.bind(this, path));
        this.paths.push(path);
        this.g.appendChild(path);
        this.drop(path);
        if (this.onUpdate) {
            this.onUpdate(this);
        }
    };
    Canvas.prototype.getMousePoint = function (e) {
        var pt = this.svg.createSVGPoint();
        pt.x = e.pageX;
        pt.y = e.pageY;
        return pt.matrixTransform(this.g.getScreenCTM().inverse());
    };
    Canvas.prototype.getEdges = function (path) {
        var m = path.transform.baseVal[0].matrix;
        var bb = path.getBBox();
        return {
            left: m.e - bb.width / 2,
            right: m.e + bb.width / 2,
            top: m.f - bb.height / 2,
            bottom: m.f + bb.height / 2
        };
    };
    Canvas.prototype.supports = function (query, base) {
        var qlr = this.getEdges(query);
        var blr = this.getEdges(base);
        return ((query !== base) &&
            (qlr.right > blr.left) &&
            (qlr.left < blr.right) &&
            (qlr.bottom === blr.top));
    };
    Canvas.prototype.touches = function (query, base) {
        var qlr = this.getEdges(query);
        var blr = this.getEdges(base);
        return ((query !== base) &&
            (qlr.bottom > blr.top) &&
            (qlr.top < blr.bottom) &&
            ((Math.abs(qlr.right - blr.left) < 50) ||
                (Math.abs(qlr.left - blr.right) < 50)));
    };
    Canvas.prototype.drop = function (path) {
        var _this = this;
        var lr = this.getEdges(path);
        //get heighest level within the width of the dropped item
        var floor = this.paths.reduce(function (floor, item) {
            var ilr = _this.getEdges(item);
            if ((item !== path) && (lr.right > ilr.left) && (lr.left < ilr.right)) {
                var ptop = ilr.top;
                return Math.min(ptop, floor);
            }
            return floor;
        }, 3000);
        var bb = path.getBBox();
        var m = path.transform.baseVal[0].matrix;
        var y = floor - bb.height / 2;
        path.setAttribute('transform', 'translate(' + m.e + ',' + y + ')');
    };
    Canvas.prototype.dragStart = function (path, e) {
        this.dragPath = path;
        this.anchor = this.getMousePoint(e);
        this.anchorMatrix = path.transform.baseVal[0].matrix;
        window.addEventListener('mousemove', this.dragMoveHandler);
        window.addEventListener('mouseup', this.dragEndHandler);
    };
    Canvas.prototype.dragMove = function (e) {
        var point = this.getMousePoint(e);
        var d = [point.x - this.anchor.x, point.y - this.anchor.y];
        var m = this.anchorMatrix.translate.apply(this.anchorMatrix, d);
        this.dragPath.setAttribute('transform', 'translate(' + m.e + ',' + m.f + ')');
    };
    Canvas.prototype.dragEnd = function (e) {
        window.removeEventListener('mousemove', this.dragMoveHandler);
        window.removeEventListener('mouseup', this.dragEndHandler);
        this.drop(this.dragPath);
        if (this.onUpdate) {
            this.onUpdate(this);
        }
    };
    return Canvas;
})();
var c = new Canvas('canvas');
var m = new Menu('menu', c)
    .addElement('hrect', 'M -512 -256 L -512 256 L 512 256 L 512 -256 Z')
    .addElement('vrect', 'M -256 -512 L 256 -512 L 256 512 L -256 512 Z')
    .addElement('hplate', 'M -512 -128 L -512 128 L 512 128 L 512 -128 Z')
    .addElement('vplate', 'M -128 -512 L 128 -512 L 128 512 L -128 512 Z')
    .addElement('ssquare', 'M -256 -256 L -256 256 L 256 256 L 256 -256 Z')
    .addElement('lsquare', 'M -512 -512 L -512 512 L 512 512 L 512 -512 Z')
    .addElement('arc', 'M -512 -256 L 512 -256 L 512 256 L 256 256 A 256 256 0 1 0 -256 256 L -512 256 Z')
    .addElement('cylinder', 'M -256 0 A 256 256 0 1 0 0 -256 A 256 256 0 0 0 -256 0 Z')
    .addElement('striangle', 'M -256 128 L 256 128 L 0 -128 Z')
    .addElement('ltriangle', 'M -512 256 L 512 256 L 0 -256 Z');
console.log(c, m);
var Network = (function () {
    function Network(id) {
        this.net = new vis.Network(document.getElementById(id), {}, {});
    }
    Network.prototype.fromCanvas = function (canvas) {
        this.canvas = canvas;
        canvas.onUpdate = this.update.bind(this);
    };
    Network.prototype.getRelations = function (path, i) {
        var _this = this;
        return this.canvas.paths.reduce(function (relations, item, j) {
            if (_this.canvas.supports(path, item)) {
                relations.push({
                    from: j,
                    to: i,
                    label: 'supports',
                    arrows: 'to'
                });
            }
            else if (_this.canvas.touches(path, item)) {
                relations.push({
                    from: j,
                    to: i,
                    label: 'touches',
                    arrows: 'to'
                });
            }
            return relations;
        }, []);
    };
    Network.prototype.getNode = function (path, i) {
        return {
            id: i,
            label: path.getAttribute('class')
        };
    };
    Network.prototype.update = function (canvas) {
        var _this = this;
        var nodes = canvas.paths.map(this.getNode);
        var edges = canvas.paths.reduce(function (all, path, i) {
            return all.concat(_this.getRelations(path, i));
        }, []);
        this.net.setData({ nodes: nodes, edges: edges });
    };
    return Network;
})();
var n = new Network('network').fromCanvas(c);
//# sourceMappingURL=Build.js.map