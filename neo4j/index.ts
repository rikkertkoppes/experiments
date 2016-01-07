var Neo4j = require('rainbird-neo4j');
var config = require('./config.json');
var Promise = require('bluebird');
var db = new Neo4j('http://localhost:7474', config.username, config.password);

import activity = require('./activity');

Promise.promisifyAll(db);

function merge(...objs: Object[]):Object {
    return objs.reduce(function(merged: Object, obj: Object) {
        Object.keys(obj).forEach(function(key: string) {
            merged[key] = obj[key];
        });
        return merged;
    }, {});
}

class RDFNode {
    labels: string[];
    properties: Object;
    constructor(labels: string|string[], properties: Object) {
        this.labels = [].concat(labels);
        this.properties = properties;
    }
    private toNeoProps(...objs: Object[]): string {
        var merged = merge(...objs);
        var list = Object.keys(merged).reduce(function(list, key) {
            if (merged[key] !== undefined) {
                return list.concat(key + ':' + JSON.stringify(merged[key]));
            }
            return list;
        }, []).join(', ');
        return '{' + list + '}';
    }
    toNode(varName: string): string {
        return '(' + varName + ':' + this.labels.join(':') + ' ' + this.toNeoProps(this.properties) + ')';
    }
    toRelation(context?: Resource): string {
        return '[:' + this.labels.join(':') + ' ' + this.toNeoProps(this.properties, { context: context.properties.id }) + ']';
    }
}

class Resource extends RDFNode {
    constructor(ns, local, props={}) {
        super('IRI', merge(props, {
            id: ns + local,
            ns: ns,
            local: local,
            activity: 0,
            newActivity: 0
        });
    }
}

class Blank extends RDFNode {
    static count: number = 0;
    constructor(props={}) {
        super('Blank', merge(props,{
            id: '_:b' + Blank.count++,
            activity: 0,
            newActivity: 0
        }));
    }
}


const MY_NS = 'http://www.example.com/';
const MY_VAR = 'http://www.example.com/var/';
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#';
const RDF_TYPE = new Resource(RDF, 'type');

//simple RDF quad
class Quad {
    private static queryCount: number = 0;
    subject: Blank | Resource;
    predicate: Resource;
    object: RDFNode;
    context: Blank | Resource;
    constructor(s, p, o, c) {
        this.subject = s;
        this.predicate = p;
        this.object = o;
        this.context = c;
    }
    mergeQuery() {
        var c = Quad.queryCount++;
        return [
            'MERGE ' + this.subject.toNode('s'+c),
            'MERGE ' + this.object.toNode('o'+c),
            'MERGE (s'+c+')-' + this.predicate.toRelation(this.context) + '->(o'+c+')',
            'MERGE ' + this.context.toNode('c'+c)
        ].join(' ');
    };
    save() {
        return db.queryAsync(this.mergeQuery());
    };
}

//prolog like expression
class Expression {
    quads: Quad[];
    constructor(predicate: string, ...args: string[]) {
        var context = new Blank();
        context.labels.push('Context');
        var pNode = new Blank();
        var ptypeNode = new Resource(MY_NS, predicate);
        var argRel = new Resource(MY_NS, 'argument');
        this.quads = [new Quad(pNode, RDF_TYPE, ptypeNode, context)].concat(args.map(arg => {
            return new Quad(pNode, argRel, new Resource(MY_VAR,arg), context);
        }));
    }
    mergeQuery() {
        return this.quads.map(q => q.mergeQuery()).join(' ');
    };
    save() {
        console.log(this.mergeQuery());
        return db.queryAsync(this.mergeQuery());
    };
}

var q = new Quad(
    new Blank(),
    new Resource(MY_NS, 'argument'),
    new Blank({ value: 'X' }),
    new Blank()
);


function series(promiseFns) {
    return promiseFns.reduce(function(sofar, fn) {
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

spirit.cycle().then(function(res) {
    console.log(JSON.stringify(res, null, 2));
})


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