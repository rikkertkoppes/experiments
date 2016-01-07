var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Neo4j = require('rainbird-neo4j');
var config = require('./config.json');
var Promise = require('bluebird');
var db = new Neo4j('http://localhost:7474', config.username, config.password);
var activity = require('./activity');
Promise.promisifyAll(db);
function merge() {
    var objs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        objs[_i - 0] = arguments[_i];
    }
    return objs.reduce(function (merged, obj) {
        Object.keys(obj).forEach(function (key) {
            merged[key] = obj[key];
        });
        return merged;
    }, {});
}
var RDFNode = (function () {
    function RDFNode(labels, properties) {
        this.labels = [].concat(labels);
        this.properties = properties;
    }
    RDFNode.prototype.toNeoProps = function () {
        var objs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            objs[_i - 0] = arguments[_i];
        }
        var merged = merge.apply(void 0, objs);
        var list = Object.keys(merged).reduce(function (list, key) {
            if (merged[key] !== undefined) {
                return list.concat(key + ':' + JSON.stringify(merged[key]));
            }
            return list;
        }, []).join(', ');
        return '{' + list + '}';
    };
    RDFNode.prototype.toNode = function (varName) {
        return '(' + varName + ':' + this.labels.join(':') + ' ' + this.toNeoProps(this.properties) + ')';
    };
    RDFNode.prototype.toRelation = function (context) {
        return '[:' + this.labels.join(':') + ' ' + this.toNeoProps(this.properties, { context: context.properties.id }) + ']';
    };
    return RDFNode;
})();
var Resource = (function (_super) {
    __extends(Resource, _super);
    function Resource(ns, local, props) {
        if (props === void 0) { props = {}; }
        _super.call(this, 'IRI', merge(props, {
            id: ns + local,
            ns: ns,
            local: local,
            activity: 0,
            newActivity: 0
        }));
    }
    return Resource;
})(RDFNode);
var Blank = (function (_super) {
    __extends(Blank, _super);
    function Blank(props) {
        if (props === void 0) { props = {}; }
        _super.call(this, 'Blank', merge(props, {
            id: '_:b' + Blank.count++,
            activity: 0,
            newActivity: 0
        }));
    }
    Blank.count = 0;
    return Blank;
})(RDFNode);
var MY_NS = 'http://www.example.com/';
var MY_VAR = 'http://www.example.com/var/';
var RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
var RDFS = 'http://www.w3.org/2000/01/rdf-schema#';
var RDF_TYPE = new Resource(RDF, 'type');
//simple RDF quad
var Quad = (function () {
    function Quad(s, p, o, c) {
        this.subject = s;
        this.predicate = p;
        this.object = o;
        this.context = c;
    }
    Quad.prototype.mergeQuery = function () {
        var c = Quad.queryCount++;
        return [
            'MERGE ' + this.subject.toNode('s' + c),
            'MERGE ' + this.object.toNode('o' + c),
            'MERGE (s' + c + ')-' + this.predicate.toRelation(this.context) + '->(o' + c + ')',
            'MERGE ' + this.context.toNode('c' + c)
        ].join(' ');
    };
    ;
    Quad.prototype.save = function () {
        return db.queryAsync(this.mergeQuery());
    };
    ;
    Quad.queryCount = 0;
    return Quad;
})();
//prolog like expression
var Expression = (function () {
    function Expression(predicate) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var context = new Blank();
        context.labels.push('Context');
        var pNode = new Blank();
        var ptypeNode = new Resource(MY_NS, predicate);
        var argRel = new Resource(MY_NS, 'argument');
        this.quads = [new Quad(pNode, RDF_TYPE, ptypeNode, context)].concat(args.map(function (arg) {
            return new Quad(pNode, argRel, new Resource(MY_VAR, arg), context);
        }));
    }
    Expression.prototype.mergeQuery = function () {
        return this.quads.map(function (q) { return q.mergeQuery(); }).join(' ');
    };
    ;
    Expression.prototype.save = function () {
        console.log(this.mergeQuery());
        return db.queryAsync(this.mergeQuery());
    };
    ;
    return Expression;
})();
var q = new Quad(new Blank(), new Resource(MY_NS, 'argument'), new Blank({ value: 'X' }), new Blank());
function series(promiseFns) {
    return promiseFns.reduce(function (sofar, fn) {
        return sofar.then(fn);
    }, Promise.resolve());
}
console.log(q.mergeQuery());
var expr1 = new Expression('Add', 'X', 'Y', 'Z');
var expr2 = new Expression('Inc', 'X', 'A');
var expr3 = new Expression('Dec', 'Y', 'B');
var expr4 = new Expression('Add', 'A', 'B', 'Z');
// expr.save();
var spirit = new activity.Spirit(db);
spirit.cycle().then(function (res) {
    console.log(JSON.stringify(res, null, 2));
});
// series([
//     function() { return expr1.save(); },
//     function() { return expr2.save(); },
//     function() { return expr3.save(); },
//     function() { return expr4.save(); }
// ]).then(function() {
//     return db.queryAsync('MATCH (n) RETURN n');
// }).then(function(results) {
//     console.log(JSON.stringify(results, null, 4));
// }); 
