///<reference path='typings/node/node.d.ts'/>
var mongoFindTemplates = [
    {
        caption: "find",
        snippet: "find({ $2 })",
        comment: 'Selects documents in a collection and returns a cursor to the selected documents.',
        example: "db.products.find( { qty: { $gte: 25, $lt: 35 } })",
        score: 1000
    },
    {
        caption: "find with a projection",
        snippet: "find( { $2 }, { _id: 0, $3: 1 } )",
        comment: 'The projection parameter specifies which fields to return. corresponds to the SELECT statement in SQL. The parameter contains either include or exclude specifications, not both, unless the exclude is for the _id field.',
        example: "db.products.find( { qty: { $gte: 25, $lt: 35 } }, { _id: 0, qty: 1 } )",
        score: 100
    },
    {
        caption: "find with forEach method",
        snippet: "find( { $2 }, { _id: 0, $3: 1 } )",
        comment: 'uses the cursor method forEach() to iterate the cursor and access the documents.',
        example: "db.products.find({$2},{name:1})\n   .sort({name:1})\n   .forEach((it)=>{ \n      $4\n      return it;  \n})",
        score: 90
    },
    {
        caption: "find sort and limit",
        snippet: "find({ $2 }).sort({ name: 1}).limit(5)",
        comment: 'uses the cursor method forEach() to iterate the cursor and access the documents.',
        example: "db.bios.find().sort({name:1}).limit(5)",
        score: 90
    },
];
var mongoFindOneTemplates = [
    {
        caption: "findOne",
        snippet: "findOne({$2})",
        comment: 'Returns one document that satisfies the specified query criteria. ',
        example: "db.bios.findOne({name:/name/})",
        score: 100
    },
    {
        caption: "findOne with a projection",
        snippet: "findOne(\n    { $2 },\n    { name: 1}\n)",
        comment: 'The projection parameter specifies which fields to return. The parameter contains either include or exclude specifications, not both, unless the exclude is for the _id field.',
        example: "db.bios.findOne(\n    { },\n    { name: 1, contribs: 1 }\n)",
        score: 100
    },
];
var mongoUpdateTemplates = [
    //update$modifier
    {
        caption: "update",
        snippet: "update(\n   { $2 },\n   { $set: { $3 } }\n)",
        comment: 'Modifies an existing document or documents in a collection. The $set operator replaces the value of a field with the specified value.',
        example: "db.products.update(\n   { _id: 100 },\n   { $set: { quantity: 500 } }\n)",
        score: 1000
    },
    {
        caption: "update$set",
        snippet: "update(\n   { $2 },\n   { $set: { $3 } }\n)",
        comment: 'Modifies an existing document or documents in a collection. The $set operator replaces the value of a field with the specified value.',
        example: "db.products.update(\n   { _id: 100 },\n   { $set: { quantity: 500 } }\n)",
        meta: "template",
        score: 100,
    },
    {
        caption: "update$inc",
        snippet: "update(\n   { $2 },\n   { $inc: { $3 } }\n)",
        comment: 'Modifies an existing document or documents in a collection. The $inc operator increments a field by a specified value.',
        example: "db.products.update(\n   { sku: \"abc123\" },\n   { $inc: { quantity: -2, \"metrics.orders\": 1 } }\n)",
        meta: "template",
        score: 90,
    },
    {
        caption: "update$push",
        snippet: "update(\n   { $2 },\n   { $push: { $3 } }\n)",
        comment: 'Modifies an existing document or documents in a collection. $push adds the array field with the value as its element.',
        example: "db.students.update(\n   { _id: 1 },\n   { $push: { scores: 89 } }\n)",
        meta: "template",
        score: 90,
    },
    {
        caption: "update$addToSet",
        snippet: "update(\n   { $2 },\n   { $addToSet: { $3 } }\n)",
        comment: 'Modifies an existing document or documents in a collection. The $addToSet operator adds a value to an array unless the value is already present, in which case $addToSet does nothing to that array.',
        example: "db.test.update(\n   { _id: 1 },\n   { $addToSet: {letters: [ \"c\", \"d\" ] } }\n)",
        meta: "template",
        score: 90,
    },
    {
        caption: "upsert",
        snippet: "update(\n   { $2 },\n   { $set: { $3 } },\n   { upsert: true}\n)",
        comment: ' An upsert updates the documentif found or inserts it if not. ',
        example: "db.products.update(\n   { _id: 100 },\n   { $set: { quantity: 500 } },\n   { upsert: true}\n)",
        meta: "template",
        score: 90,
    },
    {
        caption: "update with multi option",
        snippet: "update(\n   { $2 },\n   { $set: { $3 } },\n   { multi: true }\n)",
        comment: 'update with multi option',
        example: "db.products.update(\n   { _id: 100 },\n   { $set: { quantity: 500 } },\n   { multi: true }\n)",
        meta: "template",
        score: 90,
    },
    {
        caption: "update with upsert and multi options",
        snippet: "update(\n   { $2 },\n   { $set: { $3 } },\n   { upsert:true, multi: true }\n)",
        comment: 'Combine the upsert and multi Options',
        example: "db.books.update(\n   { item: \"EFG222\" },\n   { $set: { reorder: false, tags: [ \"literature\", \"translated\" ] } },\n   { upsert: true, multi: true }\n)",
        meta: "template",
        score: 90,
    },
];
var mongoFindAndModifyTemplates = [
    {
        caption: "findAndModify",
        snippet: "findAndModify({\n    query: { $2 },\n    sort: { $3 },\n    update: { $4 },\n    new: true\n})",
        comment: 'Modifies and returns a single document. By default, the returned document does not include the modifications made on the update. To return the document with the modifications made on the update, use the new option.',
        example: "db.people.findAndModify({\n    query: { name: \"Andy\" },\n    sort: { rating: 1 },\n    update: { $inc: { score: 1 } },\n    new: true\n})",
        score: 100
    },
    {
        caption: "findAndModify sort and remove",
        snippet: "findAndModify({\n     query: { $2 },\n     sort: { $3 },\n     remove: true\n})",
        comment: 'Modifies and returns a single document. By default, the returned document does not include the modifications made on the update. To return the document with the modifications made on the update, use the new option.',
        example: "db.people.findAndModify(\n   {\n     query: { state: \"active\" },\n     sort: { rating: 1 },\n     remove: true\n   }\n)",
        score: 90
    },
];
var mongoDistinctTemplates = [
    {
        caption: "distinct with query and sort",
        snippet: "db.inventory.distinct(\"$2\", { $3 })\n    .sort((a,b)=>compare(b,a))",
        comment: 'distinct with query and sort.',
        example: "db.inventory.distinct( \"item.sku\", {dept: \"A\" })\n    .sort((a,b)=>compare(b,a)) //desc",
        score: 100
    }
];
var mongoMapReduceTemplates = [
    {
        caption: "mapReduce with Options",
        snippet: "mapReduce(\n      ()=>{emit(this.$2cust_id, this.amount)}, //mapFunction\n      (key, values)=>{return Array.sum(values)},//reduceFunction\n      {\n          query:{ status: \"A\" }\n          out: { \"order_totals\" }\n      })",
        comment: 'The mapReduce command allows you to run map-reduce aggregation operations over a collection. ',
        example: "db.orders.mapReduce(\n      ()=>{emit(this.cust_id, this.amount)}, //mapFunction\n      (key, values)=>{return Array.sum(values)},//reduceFunction\n      {\n          query:{ status: \"A\" }\n           out: { \"order_totals\" }\n      })",
        score: 100
    }
];
var mongoRemoveTemplates = [
    {
        caption: "remove",
        snippet: "remove({$2})",
        comment: 'Removes documents from a collection.',
        example: "db.products.remove({qty:{$gt: 20}})",
        score: 100
    },
    {
        caption: "remove with justone",
        snippet: "remove({$2},{justOne: true}} )",
        comment: 'Removes documents from a collection. The "justone" option to limit the deletion to just one document',
        example: "db.products.remove({qty:{$gt: 20}},{justOne: true}})",
        score: 100
    }
];
var mongoInsertTemplates = [
    {
        caption: "insert",
        snippet: "insert({$2})",
        comment: 'Inserts a document or documents into a collection.',
        example: "db.products.insert( { item: \"card\", qty: 15 } )",
        score: 100
    },
    {
        caption: "insert Multiple Documents",
        snippet: "insert(\n    [\n      { $2 },\n     ] \n)",
        comment: 'insert Multiple Documents',
        example: "db.products.insert(\n   [\n     { _id: 11, item: \"pencil\", qty: 50, type: \"no.2\" },\n     { item: \"pen\", qty: 20 },\n     { item: \"eraser\", qty: 25 }\n   ]\n)",
        score: 100
    }
];
var mongoCodeTemplates = [];
var addMongoCodeTemplates = function (templates) {
    var theTmpls = templates.map(function (it) {
        it.meta = "code template";
        it.isMongoTemplateCommand = true;
        return it;
    });
    mongoCodeTemplates = mongoCodeTemplates.concat(templates);
};
var initMongoCodeTemplates = function () {
    addMongoCodeTemplates(mongoFindTemplates);
    addMongoCodeTemplates(mongoFindOneTemplates);
    addMongoCodeTemplates(mongoFindAndModifyTemplates);
    addMongoCodeTemplates(mongoInsertTemplates);
    addMongoCodeTemplates(mongoUpdateTemplates);
    addMongoCodeTemplates(mongoDistinctTemplates);
    addMongoCodeTemplates(mongoRemoveTemplates);
    addMongoCodeTemplates(mongoDistinctTemplates);
};
initMongoCodeTemplates();
module.exports = mongoCodeTemplates;
