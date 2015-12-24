var expect = require('expect.js');
var unify = require('./index.js');

describe('extend', function() {
    it('should join objects', function() {
        expect(unify.extend({a: 2,d: 2}, {b: 3,c: 4}, {d: 5,e: 6})).to.eql({a: 2,b: 3,c: 4,d: 5,e: 6});
    })
});

describe('isVariable', function() {
    it('should be a var when the first letter is a capital', function() {
        expect(unify.isVariable('Xsd')).to.be(true);
        expect(unify.isVariable('ssd')).to.be(false);
        expect(unify.isVariable(1)).to.be(false);
    })
})

describe('unify', function() {
    it('should fail lists of different lengths', function() {
        expect(unify.unify([], [1])).to.be(false);
    });
    it('should unify a var with a number', function() {
        expect(unify.unify(['X'], [1])).to.eql({X: 1});
    });
    it('should unify a var with another var', function() {
        expect(unify.unify(['X'], ['Y'])).to.eql({X: 'Y'});
    });
    it('should unify two vars with numbers', function() {
        expect(unify.unify(['X', 'Y'], [1, 2])).to.eql({X: 1,Y: 2});
        expect(unify.unify(['X', 2], [1, 'Y'])).to.eql({X: 1,Y: 2});
    });
    it('should fail when it cannot be unified', function() {
        expect(unify.unify(['X', 'X'], [1, 2])).to.be(false);
    });
});

describe('unifier',function() {
    it('should unify and substitute',function() {
        expect(unify.unifier(['X'],['a'])).to.eql(['a']);
        expect(unify.unifier(['a'],['X'])).to.eql(['a']);
        expect(unify.unifier(['X'],['Y'])).to.eql(['Y']);
        expect(unify.unifier(['a'],['b'])).to.eql(false);
        expect(unify.unifier(['add',3,2,'X'],['add',3,2,5])).to.eql(['add',3,2,5]);
        expect(unify.unifier(['inc',3,'A'],['inc',3,4])).to.eql(['inc',3,4]);
    })
})

var brain = [
    //static inc and dec facts, to simplify things for now
    unify.rule(unify.complex('inc',[3,4])),
    unify.rule(unify.complex('inc',[4,5])),
    unify.rule(unify.complex('dec',[2,1])),
    unify.rule(unify.complex('dec',[1,0])),
    //addition rules
    unify.rule(unify.complex('add',['X',0,'X'])),
    unify.rule(unify.complex('add',['X','Y','Z']),
               unify.complex('inc',['X','A']),
               unify.complex('dec',['Y','B']),
               unify.complex('add',['A','B','Z'])
    )
];

var input = [
    unify.complex('add',[3,2,'R']),
    unify.complex('goal',['R'])
];

describe('complex',function() {
    it('should create a complex term',function() {
        expect(unify.complex('add',[3,2,'Z'])).to.eql(['add',3,2,'Z']);
    })
});

describe('rule',function() {
    it('should create a fact',function() {
        var head = unify.complex('add',[3,2,5]);
        expect(unify.rule(head)).to.eql({head: head,body:[]});
    });
    it('should create a rule',function() {
        var head = unify.complex('add',['X','Y','Z']);
        var b1 = unify.complex('inc',['X','A']);
        var b2 = unify.complex('dec',['Y','B']);
        var b3 = unify.complex('add',['A','B','Z']);
        expect(unify.rule(head,b1,b2,b3)).to.eql({head: head,body:[b1,b2,b3]});
    });
});

describe('matchInput',function() {
    it('should apply rules to the input',function() {
        // input = [complex('inc',[3,'A'])];
        console.log(input);
        var res1 = unify.matchInput(input,brain);
        console.log(res1);
        var res2 = unify.matchInput(res1,brain);
        console.log(res2);
    });
});