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
        return this.query('MATCH (s)-[r]->(o) WHERE s.activity > 0 RETURN s,r,o')
            .then(this.update);
    };
    return Spirit;
})();
exports.Spirit = Spirit;
//get a context (a graph) and its content:
//match (c:Context {value:"_:b4"}), (o)-[r {context:c.value}]->(s) return c,r 
