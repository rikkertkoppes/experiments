//returns the shallow merge of multiple objects
function extend(a, b) {
    return [].slice.apply(arguments).reduce(function(obj, arg) {
        return Object.keys(arg).reduce(function(obj, key) {
            obj[key] = arg[key];
            return obj;
        }, obj);
    }, {});
}

//checks whether an atom is a variable (starts with capital)
function isVariable(x) {
    if (typeof x !== 'string') return false;
    return (x[0] === x[0].toUpperCase());
}

function unifyVar(v, x, bindings) {
    if (bindings[v]) {
        //check if the stored thing unifies with x
        var res = unify([bindings[v]], [x]);
        return (res === false) ? res : extend(bindings, res);
    } else if (isVariable(x) && bindings[x]) {
        //check if x is stored and the stored value unifies with var
        var res = unify([bindings[x]], [v]);
        return (res === false) ? res : extend(bindings, res);
    } else {
        //extend the bindings
        bindings[v] = x;
    }
    return bindings;
}

function unify(a, b) {
    if (a.length !== b.length) return false;
    return a.reduce(function(bindings, x, i) {
        var y = b[i];
        if (bindings === false) {
            return false;
        } else if (x === y) {
            return bindings;
        } else if (isVariable(x)) {
            return unifyVar(x, y, bindings);
        } else if (isVariable(y)) {
            return unifyVar(y, x, bindings);
        }
        return false;
    }, {});
}

var expect = require('expect.js');

describe('extend', function() {
    it('should join objects', function() {
        expect(extend({a: 2,d: 2}, {b: 3,c: 4}, {d: 5,e: 6})).to.eql({a: 2,b: 3,c: 4,d: 5,e: 6});
    })
});

describe('isVariable', function() {
    it('should be a var when the first letter is a capital', function() {
        expect(isVariable('Xsd')).to.be(true);
        expect(isVariable('ssd')).to.be(false);
        expect(isVariable(1)).to.be(false);
    })
})

describe('unify', function() {
    it('should fail lists of different lengths', function() {
        expect(unify([], [1])).to.be(false);
    });
    it('should unify a var with a number', function() {
        expect(unify(['X'], [1])).to.eql({X: 1});
    });
    it('should unify a var with another var', function() {
        expect(unify(['X'], ['Y'])).to.eql({X: 'Y'});
    });
    it('should unify two vars with numbers', function() {
        expect(unify(['X', 'Y'], [1, 2])).to.eql({X: 1,Y: 2});
        expect(unify(['X', 2], [1, 'Y'])).to.eql({X: 1,Y: 2});
    });
    it('should fail when it cannot be unified', function() {
        expect(unify(['X', 'X'], [1, 2])).to.eql({});
    });
});