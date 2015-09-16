///<reference path='typings/node/node.d.ts'/>
var mongoCreateCollectionTemplates = [
    {
        caption: "createCollection",
        snippet: "createCollection(\"${1:name}\", { capped : true, size : 512 * 1024, max : 1000 } )",
        comment: 'Creates a new collection explicitly. set capped option is true',
        example: "db.createCollection(\"log\", { capped : true, size : 5242880, max : 5000 } )",
        score: 1000
    }
];
var mongoStatsTemplates = [
    {
        caption: "stats",
        snippet: "stats(1024)",
        comment: 'Returns statistics that reflect the use state of a single database.',
        example: "db.stats(1024)",
        score: 1000
    }
];
var mongoCreateUserTemplates = [
    {
        caption: "stats",
        snippet: "createUser(\n   {\n     user: \"$2\",\n     pwd: \"$3\",\n     roles: [ \"read\" ] //read|readWrite|dbAdmin|dbOwner|userAdmin ...\n   }\n)",
        comment: 'Creates a new user for the database where the method runs. db.createUser() returns a duplicate user error if the user already exists on the database.',
        example: "use products\ndb.createUser( { \"user\" : \"accountAdmin01\",\n                 \"pwd\": \"cleartext password\",\n                 \"customData\" : { employeeId: 12345 },\n                 \"roles\" : [ { role: \"clusterAdmin\", db: \"admin\" },\n                             { role: \"readAnyDatabase\", db: \"admin\" },\n                             \"readWrite\"\n                             ] },\n               { w: \"majority\" , wtimeout: 5000 } )",
        score: 1000
    }
];
var mongoCurrentOpTemplates = [
    {
        caption: "currentOpWriteOperationsWaitingLock",
        snippet: "currentOp(\n   {\n     \"waitingForLock\" : true,\n     \\$or: [\n        { \"op\" : { \"\\$in\" : [ \"insert\", \"update\", \"remove\" ] } },\n        { \"query.findandmodify\": { \\$exists: true } }\n    ]\n   }\n)",
        comment: 'Returns information on all write operations that are waiting for a lock',
        example: "db.currentOp(\n   {\n     \"waitingForLock\" : true,\n     $or: [\n        { \"op\" : { \"$in\" : [ \"insert\", \"update\", \"remove\" ] } },\n        { \"query.findandmodify\": { $exists: true } }\n    ]\n   }\n)",
    },
    {
        caption: "currentOpActiveAndNeverYielded",
        snippet: "currentOp(\n   {\n     \"active\" : true,\n     \"numYields\" : 0,\n     \"waitingForLock\" : false\n   }\n)",
        comment: 'returns information on all active running operations that have never yielded',
        example: "db.currentOp(\n   {\n     \"active\" : true,\n     \"numYields\" : 0,\n     \"waitingForLock\" : false\n   }\n)",
    },
    {
        caption: "currentOpActiveAndRunningLongerThan3Secs",
        snippet: "currentOp(\n   {\n     \"active\" : true,\n     \"secs_running\" : { \"\\$gt\" : 3 },\n     \"ns\" : /^db1\\./\n   }\n)",
        comment: 'returns information on all active operations for database db1 that have been running longer than 3 seconds',
        example: "db.currentOp(\n   {\n     \"active\" : true,\n     \"secs_running\" : { \"$gt\" : 3 },\n     \"ns\" : /^db1\\./\n   }\n)",
    },
    {
        caption: "currentOpActiveIndexingOperations",
        snippet: "currentOp(\n    {\n      \\$or: [\n        { op: \"query\", \"query.createIndexes\": { \\$exists: true } },\n        { op: \"insert\", ns: /\\.system\\.indexes\\b/ }\n      ]\n    }\n)",
        comment: 'returns information on all active operations for database db1 that have been running longer than 3 seconds',
        example: "db.currentOp(\n    {\n      $or: [\n        { op: \"query\", \"query.createIndexes\": { $exists: true } },\n        { op: \"insert\", ns: /\\.system\\.indexes\\b/ }\n      ]\n    }\n)",
    }
];
var databaseTemplates = [];
var addMongoCodeTemplates = function (mongoMethod, templates) {
    var theTmpls = templates.map(function (it) {
        it.meta = "code template";
        it.isMongoTemplateCommand = true;
        it.methodDotName = "db." + mongoMethod; //for help url
        return it;
    });
    databaseTemplates = databaseTemplates.concat(templates);
};
var initMongoCursorTemplates = function () {
    addMongoCodeTemplates("createCollection", mongoCreateCollectionTemplates);
    addMongoCodeTemplates("stats", mongoStatsTemplates);
    addMongoCodeTemplates("currentOp", mongoCurrentOpTemplates);
};
initMongoCursorTemplates();
module.exports = databaseTemplates;
