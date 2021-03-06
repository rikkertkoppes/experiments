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
    if (bindings[v] !== undefined) {
        //check if the stored thing unifies with x
        var res = unify([bindings[v]], [x]);
        return (res === false) ? res : extend(bindings, res);
    } else if (isVariable(x) && bindings[x] !== undefined) {
        //check if x is stored and the stored value unifies with var
        var res = unify([bindings[x]], [v]);
        return (res === false) ? res : extend(bindings, res);
    } else {
        //extend the bindings
        bindings[v] = x;
    }
    return bindings;
}

function unify(a, b, bindings) {
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
    }, bindings || {});
}

function substituteBindings(bindings,a) {
    if (bindings === false) return false;
    return a.map(function(x) {
        if (isVariable(x) && bindings[x]) return bindings[x];
        return x;
    });
}

function unifier(x,y) {
    return substituteBindings(unify(x,y),x);
}



function complex(predicate,assocs) {
    return [predicate].concat(assocs);
}

//defines a rule by a head expression and optional body expressions (if none then fact)
function rule(head,c1,c2) {
    return {
        head: head,
        body: [].slice.call(arguments,1)
    }
}

//perform a step
function matchComplex(complex,brain,bindings) {
    var matchingRule = brain.filter(function(rule) {
        return unify(rule.head,complex,bindings);
    })[0];
    // console.log(bindings,complex,matchingRule);
    if (matchingRule) {
        var bindings = unify(matchingRule.head,complex,bindings);
        if (matchingRule.body.length) {
            return {
                bindings: bindings,
                rules: matchingRule.body.map(function(b) {
                    return substituteBindings(bindings,b);
                })
            };
        } else {
            return {
                bindings: bindings,
                rules: [substituteBindings(bindings,matchingRule.head)]
            };
        }
    } else {
        return {
            bindings: bindings,
            rules: [complex]
        };
    }
}

//TODO: consider the input (array of complex) as a whole, that is,
//consider them to have a shared scope / set of bindings
function matchInput(input,brain) {
    //flatmap
    return input.reduce(function(all,complex) {
        var res = matchComplex(complex,brain,all.bindings);
        return {
            bindings: res.bindings,
            rules: all.rules.concat(res.rules)
        };
    },{
        bindings: {},
        rules: []
    });
}

function solve(input,brain) {
    var first = matchInput(input,brain);
    var last = matchInput(first.rules,brain);
    while (JSON.stringify(first) !== JSON.stringify(last)) {
        console.log(first);
        first = last;
        last = matchInput(last.rules,brain);
    };
    return last;
}

module.exports = {
    extend: extend,
    isVariable: isVariable,
    unify: unify,
    unifier: unifier,
    complex: complex,
    rule: rule,
    matchInput: matchInput,
    solve: solve
}