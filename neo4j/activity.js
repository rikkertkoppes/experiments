var Spirit = (function () {
    function Spirit(db) {
        this.db = db;
    }
    //single query, return array of matches
    Spirit.prototype.query = function (q) {
        return this.db.queryAsync(q).then(function (res) { return res[0]; });
    };
    //get the current activation pattern
    Spirit.prototype.state = function () {
        return this.query('MATCH (s) WHERE s.activity > 0 RETURN s');
    };
    Spirit.prototype.update = function (current) {
        var updated = current.map(function (triple) {
            return {
                s: triple.s,
                r: triple.r,
                o: triple.o
            };
        });
        console.log(JSON.stringify(updated, null, 2));
        //
        return current;
    };
    //get active nodes and its linked nodes, and update them
    Spirit.prototype.cycle = function () {
        return this.db.queryAsync([
            { statement: 'match(c:Context {value: "_:b4" }), (o) - [r {context: c.value }] ->(s) return s' },
            { statement: 'match(s) where s.activity > 0 set s.newActivity = s.activity / (size(()-- > (s)) + 1) return s' },
            { statement: 'match (s)-[r]->(o) where s.activity > 0 set o.newActivity = o.newActivity + s.activity/(size(()-->(o))+1) return s,r,o' },
            { statement: 'match (s) set s.activity = s.newActivity return s' },
            { statement: 'match(s) where s.activity > 0 return s' }
        ]);
    };
    return Spirit;
})();
exports.Spirit = Spirit;
//get a context (a graph) and its content:
//match (c:Context {value:"_:b4"}), (o)-[r {context:c.value}]->(s) return c,r
//
//first, for all active nodes, reduce activity and copy to new activity (scaled by number of parent)
//match (s) where s.activity > 0 set s.newActivity = s.activity/(size(()-->(s))+1) return s
//
//then, flow the activity to children
//match (s)-[r]->(o) where s.activity > 0 set o.newActivity = o.newActivity + s.activity/(size(()-->(o))+1) return s,r,o
//
//finally, update the activity itself to the newly calculated value
//match (s) set s.activity = s.newActivity return s 
