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
};
initMongoCursorTemplates();
module.exports = databaseTemplates;
