//goal: simple prolog unifier

function isVariable(str) {
    return str[0] === '?';
}

function rest(arr) {
  var r = arr.slice(1);
  if (!arr.length) return undefined;
  return r;
}
function first(arr) {
  return arr[0];
}
//soft equals
function equals(x,y) {
  return JSON.stringify(x) === JSON.stringify(y);
}

isVariable('sdf')

function lookup(key,bindings) {
  return bindings[key];
}

function extendBinding(key,value,bindings) {
  bindings[key] = value;
  return bindings;
}

function unifyVariable(key,x,bindings) {
  if (bindings[key]) return unify(lookup(key,bindings), x, bindings);
  if (isVariable(x) && bindings[x]) return unify(key, lookup(x, bindings), bindings);
  return extendBinding(key,x,bindings);
}

function unify(x,y,bindings) {
  //initialize to empty bindings
  if (!bindings) return unify(x,y,{});
  //if both are the same, we are done
  if (equals(x,y)) return bindings;
  if (isVariable(x)) return unifyVariable(x,y,bindings);
  if (isVariable(y)) return unifyVariable(y,x,bindings);
  if (x.length && y.length) return unify(rest(x), rest(y), unify(first(x),first(y),bindings));
  return undefined;
}

console.log(unify('?x','a'));
console.log(unify(['?x','?y'],['a','a']));

function substituteBindings(bindings,x) {
    if (equals(bindings,{})) return x;
    if (isVariable(x) && bindings[x]) return substituteBindings(bindings,lookup(x,bindings));
    if (typeof x === 'string') return x;
    return [substituteBindings(bindings,first(x))].concat(substituteBindings(bindings,rest(x)));
}

function unifier(x,y) {
    return substituteBindings(unify(x,y),x);
}

console.log(unifier('?x','a'));
console.log(unifier('x','?a'));
console.log(unifier('?x','?a'));