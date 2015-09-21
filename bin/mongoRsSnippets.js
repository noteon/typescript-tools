///<reference path='typings/node/node.d.ts'/>
var configSample = "{\n    _id : \"my_replica_set\",\n     members : [\n         {_id : 0, host : \"rs1.example.net:27017\"},\n         {_id : 1, host : \"rs2.example.net:27017\"},\n         {_id : 2, host : \"rs3.example.net\", arbiterOnly: true},\n     ]\n}";
var mongoInitializeTemplates = [
    {
        caption: "initiate",
        snippet: "initiate();",
        comment: 'Initiates a replica set. Optionally takes a configuration argument in the form of a document that holds the configuration of a replica set.',
        example: "rs.initiate()",
        score: 100
    },
    {
        caption: "initiateWithSampleConfig",
        snippet: "initiate(" + configSample + ");",
        comment: 'Initiates a replica set. Optionally takes a configuration argument in the form of a document that holds the configuration of a replica set.',
        example: "rs.initiate(" + configSample + ")",
        score: 10
    }
];
var replTemplates = [];
var addMongoCodeTemplates = function (mongoMethod, templates) {
    var theTmpls = templates.map(function (it) {
        it.meta = "code template";
        it.isMongoTemplateCommand = true;
        it.methodDotName = "rs." + mongoMethod; //for help url
        return it;
    });
    replTemplates = replTemplates.concat(templates);
};
var initReplTemplates = function () {
    addMongoCodeTemplates("initiate", mongoInitializeTemplates);
};
initReplTemplates();
module.exports = replTemplates;
