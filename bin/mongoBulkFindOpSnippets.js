///<reference path='typings/node/node.d.ts'/>
var mongoUpdateTemplates = [
    {
        caption: "update",
        snippet: "update({ \\$set: { $2 } })",
        comment: 'Adds a multi update operation to a bulk operations list. The method updates specific fields in existing documents.',
        example: "var bulk = db.items.initializeUnorderedBulkOp();\nbulk.find( { status: \"D\" } ).update( { $set: { status: \"I\", points: \"0\" } } );\nbulk.find( { item: null } ).update( { $set: { item: \"TBD\" } } );\nbulk.execute();",
        score: 1000
    }
];
var bulkFindOpTemplates = [];
var addMongoCodeTemplates = function (mongoMethod, templates) {
    var theTmpls = templates.map(function (it) {
        it.meta = "code template";
        it.isMongoTemplateCommand = true;
        it.methodDotName = "db." + mongoMethod; //for help url
        return it;
    });
    bulkFindOpTemplates = bulkFindOpTemplates.concat(templates);
};
var initMongoBulkFindOpTemplates = function () {
    addMongoCodeTemplates("update", mongoUpdateTemplates);
};
initMongoBulkFindOpTemplates();
module.exports = bulkFindOpTemplates;
