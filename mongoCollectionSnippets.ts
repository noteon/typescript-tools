///<reference path='typings/node/node.d.ts'/>

var mongoFindTemplates = [
      {
            caption: "find",
            snippet:
            `find({$2})`,
            comment: 'Selects documents in a collection and returns a cursor to the selected documents.',
            example:
            `db.products.find( { qty: { $gte: 25, $lt: 35 } })`,
      },

      {
            caption: "findProjection",
            snippet:
            `find({$2}, {$3: 0, name: 1})`,
            comment: 'The projection parameter specifies which fields to return. corresponds to the SELECT statement in SQL. The parameter contains either include or exclude specifications, not both, unless the exclude is for the _id field.',
            example:
            `db.products.find( { qty: { $gte: 25, $lt: 35 } }, { _id: 0, qty: 1 } )`,
      },

      {
            caption: "findForEach",
            snippet:
            `find({$2},{$3name:1})
   .sort({name:1})
   .forEach((it)=>{
      $4
      return it;
})`,
            comment: 'uses the cursor method forEach() to iterate the cursor and access the documents.',
            example:
            `db.products.find({},{fname:1})
   .sort({name:1})
   .forEach((it)=>{
      it.fullName=it.fname+" "+it.lname;
      return it;
})`,
      },

      {
            caption: "findSortLimit",
            snippet:
            `find({$2}).sort({ $3name: 1 }).limit(5)`,
            comment: 'uses the cursor method forEach() to iterate the cursor and access the documents.',
            example:
            `db.bios.find().sort({name:1}).limit(5)`,
      },

];

var mongoFindOneTemplates = [
      {
            caption: "findOne",
            snippet:
            `findOne({$2})`,
            comment: 'Returns one document that satisfies the specified query criteria. ',
            example:
            `db.bios.findOne({name:/name/})`,
      },

      {
            caption: "findOneProjection",
            snippet:
            `findOne({$2},{name:1})`,
            comment: 'The projection parameter specifies which fields to return. The parameter contains either include or exclude specifications, not both, unless the exclude is for the _id field.',
            example:
            `db.bios.findOne(
    { },
    { name: 1, contribs: 1 }
)`,
      },
]

var mongoUpdateTemplates = [
      
      //update$modifier
      {
            caption: "update",
            snippet:
            `update({$2},{\\$set:{$3}})`,
            comment: 'Modifies an existing document or documents in a collection. The $set operator replaces the value of a field with the specified value.',
            example:
            `db.products.update(
   { _id: 100 },
   { $set: { quantity: 500 } }
)`,
      },

      {
            caption: "update$set",
            snippet:
            `update({$2},{\\$set: {$3}})`,
            comment: 'Modifies an existing document or documents in a collection. The $set operator replaces the value of a field with the specified value.',
            example:
            `db.products.update(
   { _id: 100 },
   { $set: { quantity: 500 } }
)`,
            meta: "template",
      },


      {
            caption: "update$inc",
            snippet:
            `update({$2}, {\\$inc: {$3}})`,
            comment: 'Modifies an existing document or documents in a collection. The $inc operator increments a field by a specified value.',
            example:
            `db.products.update(
   { sku: "abc123" },
   { $inc: { quantity: -2, "metrics.orders": 1 } }
)`,
            meta: "template",
      },


      {
            caption: "update$push",
            snippet:
            `update({$2}, {\\$push: {$3}})`,
            comment: 'Modifies an existing document or documents in a collection. $push adds the array field with the value as its element.',
            example:
            `db.students.update(
   { _id: 1 },
   { $push: { scores: 89 } }
)`,
            meta: "template",
      },


      {
            caption: "update$addToSet",
            snippet:
            `update({$2},{\\$addToSet: {$3}})`,
            comment: 'Modifies an existing document or documents in a collection. The $addToSet operator adds a value to an array unless the value is already present, in which case $addToSet does nothing to that array.',
            example:
            `db.test.update(
   { _id: 1 },
   { $addToSet: {letters: [ "c", "d" ] } }
)`,
            meta: "template",
      },



      {
            caption: "upsert",
            snippet:
            `update({$2},{\\$set: {$3}}, {upsert: true})`,
            comment: ' An upsert updates the documentif found or inserts it if not. ',
            example:
            `db.products.update(
   { _id: 100 },
   { $set: { quantity: 500 } },
   { upsert: true}
)`,

            meta: "template",
      },

      {
            caption: "updateWithMultiOption",
            snippet:
            `update({$2},{\\$set: {$3}}, {multi: true})`,
            comment: 'update with multi option',
            example:
            `db.products.update(
   {_id: 100},
   {$set: {quantity: 500}},
   {multi: true}
)`,

            meta: "template",
      },

      {
            caption: "updateWithUpsertMulti",
            snippet:
            `update({$2},{\\$set: {$3}}, {upsert:true, multi:true})`,
            comment: 'Combine the upsert and multi Options',
            example:
            `db.books.update(
   { item: "EFG222" },
   { $set: { reorder: false, tags: [ "literature", "translated" ] } },
   { upsert: true, multi: true }
)`,

            meta: "template",
      },
];

var mongoFindAndModifyTemplates = [
      {
            caption: "findAndModify",
            snippet:
            `findAndModify({query: {$2},sort: {$3}, update: {$4}, new: true})`,
            comment: 'Modifies and returns a single document. By default, the returned document does not include the modifications made on the update. To return the document with the modifications made on the update, use the new option.',
            example:
            `db.people.findAndModify({
    query: { name: "Andy" },
    sort: { rating: 1 },
    update: { $inc: { score: 1 } },
    new: true
})`,
      },
      {
            caption: "findAndModifySortRemove",
            snippet:
            `findAndModify({query: {$2}, sort: {$3}, remove: true})`,
            comment: 'Modifies and returns a single document. By default, the returned document does not include the modifications made on the update. To return the document with the modifications made on the update, use the new option.',
            example:
            `db.people.findAndModify(
   {
     query: { state: "active" },
     sort: { rating: 1 },
     remove: true
   }
)`,
      },
]

var mongoDistinctTemplates = [
      {
            caption: "distinct",
            snippet:
            `distinct("$2")`,
            comment: 'Finds the distinct values for a specified field across a single collection and returns the results in an array.',
            example:
            `db.inventory.distinct( "item.sku", {dept: "A" })`,
      },

      {
            caption: "distinctWithQuerySort",
            snippet:
            `distinct("$2", {$3}).sort((a,b)=>compare(b,a))`,
            comment: 'distinct with query and sort.',
            example:
            `db.inventory.distinct( "item.sku", {dept: "A" })
    .sort((a,b)=>compare(b,a)) //desc`,
      }
]

var mongoMapReduceTemplates = [
      {
            caption: "mapReduce with Options",
            snippet:
            `mapReduce(
      function () {emit(this.$2cust_id, this.amount)}, //mapFunction
      (key, values)=>{return Array.sum(values)},//reduceFunction
      {
          query:{ status: "A" },
          out: { "inline":1 }
      })`,
            comment: 'The mapReduce command allows you to run map-reduce aggregation operations over a collection. ',
            example:
            `db.orders.mapReduce(
      function() {emit(this.cust_id, this.amount)}, //mapFunction
      (key, values)=>{return Array.sum(values)},//reduceFunction
      {
          query:{ status: "A" },
           out: { "inline":1 }
      })`,
      }
]

var mongoRemoveTemplates = [
      {
            caption: "remove",
            snippet:
            `remove({$2})`,
            comment: 'Removes documents from a collection.',
            example:
            `db.products.remove({qty:{$gt: 20}})`,
      },
      {
            caption: "removeOne",
            snippet:
            `remove({$2},{justOne: true})`,
            comment: 'Removes documents from a collection. The "justone" option to limit the deletion to just one document',
            example:
            `db.products.remove({qty:{$gt: 20}},{justOne: true}})`,
      }
]

var mongoCreateIndexTemplates = [
      {
            caption: "createIndex",
            snippet:
            `createIndex({$2: 1})`,
            comment: 'Creates indexes on collections.',
            example:
            `db.collection.createIndex( { orderDate: 1 } )`,
      },

      {
            caption: "createIndexWithTTL",
            snippet:
            `createIndex({$2: 1}, {expireAfterSeconds: \${3:60*60} })`,
            comment: 'To create a TTL index, use the db.collection.createIndex() method with the expireAfterSeconds option on a field whose value is either a date or an array that contains date values.',
            example:
            `db.eventlog.createIndex( { "lastModifiedDate": 1 }, { expireAfterSeconds: 3600 } )`,
      },

      {
            caption: "createIndexWithOptions",
            snippet:
            `createIndex(
             {$2: 1},
             {
              background:false,//Specify true to build in the background.
              unique:false, //Specify true to create a unique index. A unique index causes MongoDB to reject all documents that contain a duplicate value for the indexed field.
              sparse:false, //If true, the index only references documents with the specified field.
              //expireAfterSeconds:0, //Specifies a value, in seconds, as a TTL to control how long MongoDB retains documents in this collection.
              //storageEngine:{WiredTiger: <options> }
             }
)`,
            comment: `Creates indexes on collections. The options document contains a set of options that controls the creation of the index. Different index types can have additional options specific for that type.`,
            example:
            `db.eventlog.createIndex( { "lastModifiedDate": 1 }, { background:true, unique:false, sparse:true } )`,
      },
      
      
      {
            caption: "createIndexWithTextOptions",
            snippet:
            `createIndex({ 
    "\\$**" : "text", //$** to index all fields that contain string content
    "name" : "text",
    "content": "text"
}, { 
    "name" : "indexName", 
    "default_language" : "english", 
    //"language_override" : "lang", 
    "weights" : {
        "name" : 1,
        "content": 2
    }
})`,
            comment: `You can create a text index on the field or fields whose value is a string or an array of string elements. When creating a text index on multiple fields, you can specify the individual fields or you can use wildcard specifier ($**)`,
            example:
            `createIndex({ 
    "$**" : "text",  
    "name" : "text",
    "content": "text"
}, { 
    "weights" : {
        "name" : 1,
        "content": 2
    }
    //"name" : "indexName", 
    //"default_language" : "english", 
    //"language_override" : "lang", 
    //"textIndexVersion": 2  //In MongoDB 2.6, the default version is 2. MongoDB 2.4 can only support version 1.
})`,
      },
      
      {
            caption: "createIndexGeo2dsphere",
            snippet:
            `createIndex( 
      { "\${3:locationField}" : "2dsphere" },
      { "2dsphereIndexVersion" : 2 }//In MongoDB 2.6, the default version is 2. MongoDB 2.4 can only support version 1.             
)`,
            comment: 'To create a geospatial index for GeoJSON-formatted data.specify the location field as the index key and specify the string literal "2dsphere" as the value',
            example:
            `db.collection.createIndex( { "loc" : "2dsphere" } )`,
      },
      
      {
            caption: "createIndexGeo2dIndex",
            snippet:
            `createIndex( 
      { "\${3:locationField}" : "2d" },
      { bits: 26, min : -180 , max : 180 }
)`,
            comment: 'o build a geospatial 2d index',
            example:
            `db.collection.createIndex( { "loc" : "2d" } ,
                           { bits: 26, min : -180 , max : 180 } )`,
      },
      
      {
            caption: "createIndexGeoHaystack",
            snippet:
            `createIndex( 
      { "\${3:locationField}" : "geoHaystack" } ,
      { bucketSize : 1 } 
)`,
            comment: 'o build a geospatial 2d index',
            example:
            `db.collection.createIndex( 
      { pos : "geoHaystack", type : 1 } ,
      { bucketSize : 1 } 
)`,
      },
      
]

var mongoInsertTemplates = [
      {
            caption: "insert",
            snippet:
            `insert([{$2}])`,
            comment: 'Inserts a document or documents into a collection.',
            example:
            `db.products.insert( { item: "card", qty: 15 } )`,
      },

      {
            caption: "insertMultipleDocuments",
            snippet:
            `insert([{$2}])`,
            comment: 'insert Multiple Documents',
            example:
            `db.products.insert(
   [
     { _id: 11, item: "pencil", qty: 50, type: "no.2" },
     { item: "pen", qty: 20 },
     { item: "eraser", qty: 25 }
   ]
)`,
      }
]

var mongoSaveTemplates = [
      {
            caption: "save",
            snippet:
            `save({$2})`,
            comment: 'Updates an existing document or inserts a new document, depending on its document parameter.',
            example:
            `db.products.save( { item: "book", qty: 40 } )`,
      }]

var mongoAggregateTemplates = [
      {
            caption: "aggregate",
            snippet:
            `aggregate(
   [
     { \\$match: { $2 } },
     { \\$group: { _id: "\\$groupByField", total: { \\$sum: "$amount" } } },
     { \\$sort: { total: -1 } }
   ]
)`,
            comment: `Aggregation operation: Group by and Calculate a Sum.`,
            example:
            `db.orders.aggregate([
      { $match: { status: "A" } },
      { $group: { _id: "$cust_id", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } }
])`,
      },
      {
            caption: "aggregatePreformACount",
            snippet:
            `aggregate(
   [
      { \\$match: { $2 } },
      { \\$group: { _id: null, count: { \\$sum: 1 } } }
   ]
)`,
            comment: `compute a count of the documents.On a sharded cluster, db.collection.count() can result in an inaccurate count if orphaned documents exist or if a chunk migration is in progress.
To avoid these situations, on a sharded cluster, use the $group stage of the db.collection.aggregate() method to $sum the documents.`,
            example:
            `db.articles.aggregate([
      { $match : { score : { $gt : 70, $lte : 90 } } },
      { $group: { _id: null, count: { $sum: 1 } } }
]);`,
      },

      {
            caption: "SqlToAggregationCount",
            snippet:
            `aggregate([
   {
     \\$group: {
        _id: null,
        count: { \\$sum: 1 }
     }
   }
])`,
            comment: `SELECT COUNT(*) AS count FROM orders`,
            example:
            `db.orders.aggregate( [
   {
     $group: {
        _id: null,
        count: { $sum: 1 }
     }
   }
] )`,
            docUrl: "https://docs.mongodb.org/manual/reference/sql-aggregation-comparison/"
      },

      {
            caption: "SqlToAggregationSum",
            snippet:
            `aggregate([
   {
     \\$group: {
        _id: null,
        total: { \\$sum: "\\$price" }
     }
   }
])`,
            comment: `SELECT SUM(price) AS total FROM orders`,
            example:
            `db.orders.aggregate( [
   {
     $group: {
        _id: null,
        total: { $sum: "$price" }
     }
   }
] )`,
            docUrl: "https://docs.mongodb.org/manual/reference/sql-aggregation-comparison/"
      },

      {
            caption: "SqlToAggregationSumGroupBy",
            snippet:
            `aggregate([
   {
     \\$group: {
        _id: "\\$cust_id",
        total: { \\$sum: "\\$price" }
     }
   }
])`,
            comment: `SELECT cust_id,
       SUM(price) AS total
FROM orders
GROUP BY cust_id`,
            example:
            `db.orders.aggregate( [
   {
     $group: {
        _id: "$cust_id",
        total: { $sum: "$price" }
     }
   }
] )`,
            docUrl: "https://docs.mongodb.org/manual/reference/sql-aggregation-comparison/"
      },

      {
            caption: "SqlToAggregationSumGroupByOrderByTotal",
            snippet:
            `aggregate([
   {
     \\$group: {
        _id: "\\$cust_id",
        total: { \\$sum: "\\$price" }
     }
   },
   { \\$sort: { total: 1 } }
])`,
            comment: `SELECT cust_id,
       SUM(price) AS total
FROM orders
GROUP BY cust_id
ORDER BY total`,
            example:
            `db.orders.aggregate( [
   {
     $group: {
        _id: "$cust_id",
        total: { $sum: "$price" }
     }
   },
   { $sort: { total: 1 } }
] )`,
            docUrl: "https://docs.mongodb.org/manual/reference/sql-aggregation-comparison/"
      },

      {
            caption: "SqlToAggregationSumGroupByOrderByDate",
            snippet:
            `aggregate( [
   {
     \\$group: {
        _id: {
           cust_id: "\\$cust_id",
           ord_date: {
               month: { \\$month: "\\$ord_date" },
               day: { \\$dayOfMonth: "\\$ord_date" },
               year: { \\$year: "\\$ord_date"}
           }
        },
        total: { \\$sum: "\\$price" }
     }
   }
] )`,
            comment: `SELECT cust_id,
       ord_date,
       SUM(price) AS total
FROM orders
GROUP BY cust_id,
         ord_date`,
            example:
            `db.orders.aggregate( [
   {
     $group: {
        _id: {
           cust_id: "$cust_id",
           ord_date: {
               month: { $month: "$ord_date" },
               day: { $dayOfMonth: "$ord_date" },
               year: { $year: "$ord_date"}
           }
        },
        total: { $sum: "$price" }
     }
   }
] )`,
            docUrl: "https://docs.mongodb.org/manual/reference/sql-aggregation-comparison/"
      },


      {
            caption: "SqlToAggregationGroupByHaving",
            snippet:
            `aggregate([
   {
     \\$group: {
        _id: "\\$cust_id",
        count: { \\$sum: 1 }
     }
   },
   { \\$match: { count: { \\$gt: 1 } } }
])`,
            comment: `SELECT cust_id,
       count(*)
FROM orders
GROUP BY cust_id
HAVING count(*) > 1`,
            example:
            `db.orders.aggregate( [
   {
     $group: {
        _id: "$cust_id",
        count: { $sum: 1 }
     }
   },
   { $match: { count: { $gt: 1 } } }
] )`,
            docUrl: "https://docs.mongodb.org/manual/reference/sql-aggregation-comparison/"
      },

]

var mongoStatsTemplates = [
      {
            caption: "stats",
            snippet:
            `stats();`,
            comment: `Returns statistics about the collection. `,
            example:
            `db.orders.stats()`,
      },
]


let mongoCodeTemplates = [];



let addMongoCodeTemplates = (mongoMethod, templates: any[]) => {
      let theTmpls = templates.map((it) => {
            it.meta = "code template"
            it.isMongoTemplateCommand = true;
            it.methodDotName = "mongo.ICollection." + mongoMethod;  //for help url
            
            return it;
      })

      mongoCodeTemplates = mongoCodeTemplates.concat(templates)
}



let attachDateRangeToMongoFindTemlates = () => {
      let dateRangeTemplates = require("./mongoDateRangeSnippets");

      dateRangeTemplates.filter((it) => it.attachedToFindMethod).forEach((it) => {
            mongoFindTemplates.push({
                  caption: "find" + it.caption,
                  snippet: `find({ \${2:dateField}: ${it.snippet} })`,
                  comment: 'Selects documents in a collection and returns a cursor to the selected documents',
                  example:  `db.products.find( { at: ${it.example}} )`,
            });
      });     
}

attachDateRangeToMongoFindTemlates();

let initMongoCodeTemplates = () => {
      addMongoCodeTemplates("find", mongoFindTemplates);
      addMongoCodeTemplates("findOne", mongoFindOneTemplates);
      addMongoCodeTemplates("findAndModify", mongoFindAndModifyTemplates);
      addMongoCodeTemplates("insert", mongoInsertTemplates);
      addMongoCodeTemplates("save", mongoSaveTemplates);
      addMongoCodeTemplates("update", mongoUpdateTemplates);
      addMongoCodeTemplates("distinct", mongoDistinctTemplates);
      addMongoCodeTemplates("remove", mongoRemoveTemplates);
      addMongoCodeTemplates("mapReduce", mongoMapReduceTemplates);
      addMongoCodeTemplates("createIndex", mongoCreateIndexTemplates);
      addMongoCodeTemplates("aggregate", mongoAggregateTemplates);
      addMongoCodeTemplates("stats", mongoStatsTemplates);
}
initMongoCodeTemplates();

export = mongoCodeTemplates;
