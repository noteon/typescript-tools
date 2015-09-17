///<reference path='typings/node/node.d.ts'/>

var mongoFindTemplates = [
      {
            caption: "find",
            snippet:
            `find({$2})`,
            comment: 'Selects documents in a collection and returns a cursor to the selected documents.',
            example:
            `db.products.find( { qty: { $gte: 25, $lt: 35 } })`,
            score: 1000
      },

      {
            caption: "find with a projection",
            snippet:
            `find({$2}, {_id: 0, name: 1})`,
            comment: 'The projection parameter specifies which fields to return. corresponds to the SELECT statement in SQL. The parameter contains either include or exclude specifications, not both, unless the exclude is for the _id field.',
            example:
            `db.products.find( { qty: { $gte: 25, $lt: 35 } }, { _id: 0, qty: 1 } )`,
            score: 100
      },

      {
            caption: "find with forEach method",
            snippet:
            `find({$2},{name:1})
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
            score: 90
      },

      {
            caption: "find sort and limit",
            snippet:
            `find({$2}).sort({name: 1}).limit(5)`,
            comment: 'uses the cursor method forEach() to iterate the cursor and access the documents.',
            example:
            `db.bios.find().sort({name:1}).limit(5)`,
            score: 90
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
            score: 100
      },

      {
            caption: "findOne with a projection",
            snippet:
            `findOne(
    {$2},
    {name:1}
)`,
            comment: 'The projection parameter specifies which fields to return. The parameter contains either include or exclude specifications, not both, unless the exclude is for the _id field.',
            example:
            `db.bios.findOne(
    { },
    { name: 1, contribs: 1 }
)`,
            score: 10
      },
]

var mongoUpdateTemplates = [
      
      //update$modifier
      {
            caption: "update",
            snippet:
            `update(
   {$2},
   {\\$set: {$3}}
)`,
            comment: 'Modifies an existing document or documents in a collection. The $set operator replaces the value of a field with the specified value.',
            example:
            `db.products.update(
   { _id: 100 },
   { \\$set: { quantity: 500 } }
)`,
            score: 1000
      },

      {
            caption: "update$set",
            snippet:
            `update(
   {$2},
   {\\$set: {$3}}
)`,
            comment: 'Modifies an existing document or documents in a collection. The $set operator replaces the value of a field with the specified value.',
            example:
            `db.products.update(
   { _id: 100 },
   { $set: { quantity: 500 } }
)`,
            meta: "template",
            score: 100,
      },


      {
            caption: "update$inc",
            snippet:
            `update(
   {$2},
   {\\$inc: {$3}}
)`,
            comment: 'Modifies an existing document or documents in a collection. The $inc operator increments a field by a specified value.',
            example:
            `db.products.update(
   { sku: "abc123" },
   { \\$inc: { quantity: -2, "metrics.orders": 1 } }
)`,
            meta: "template",
            score: 90,
      },


      {
            caption: "update$push",
            snippet:
            `update(
   {$2},
   {\\$push: {$3}}
)`,
            comment: 'Modifies an existing document or documents in a collection. $push adds the array field with the value as its element.',
            example:
            `db.students.update(
   { _id: 1 },
   { \\$push: { scores: 89 } }
)`,
            meta: "template",
            score: 90,
      },


      {
            caption: "update$addToSet",
            snippet:
            `update(
   {$2},
   {\\$addToSet: {$3}}
)`,
            comment: 'Modifies an existing document or documents in a collection. The $addToSet operator adds a value to an array unless the value is already present, in which case $addToSet does nothing to that array.',
            example:
            `db.test.update(
   { _id: 1 },
   { $addToSet: {letters: [ "c", "d" ] } }
)`,
            meta: "template",
            score: 90,
      },



      {
            caption: "upsert",
            snippet:
            `update(
   {$2},
   {\\$set: {$3}},
   {upsert: true}
)`,
            comment: ' An upsert updates the documentif found or inserts it if not. ',
            example:
            `db.products.update(
   { _id: 100 },
   { $set: { quantity: 500 } },
   { upsert: true}
)`,

            meta: "template",
            score: 90,
      },

      {
            caption: "update with multi option",
            snippet:
            `update(
   {$2},
   {\\$set: {$3}},
   {multi: true}
)`,
            comment: 'update with multi option',
            example:
            `db.products.update(
   {_id: 100},
   {$set: {quantity: 500}},
   {multi: true}
)`,

            meta: "template",
            score: 90,
      },

      {
            caption: "update with upsert and multi options",
            snippet:
            `update(
   {$2},
   {\\$set: {$3}},
   {upsert:true, multi:true}
)`,
            comment: 'Combine the upsert and multi Options',
            example:
            `db.books.update(
   { item: "EFG222" },
   { $set: { reorder: false, tags: [ "literature", "translated" ] } },
   { upsert: true, multi: true }
)`,

            meta: "template",
            score: 90,
      },
];

var mongoFindAndModifyTemplates = [
      {
            caption: "findAndModify",
            snippet:
            `findAndModify({
    query: {$2},
    sort: {$3},
    update: {$4},
    new: true
})`,
            comment: 'Modifies and returns a single document. By default, the returned document does not include the modifications made on the update. To return the document with the modifications made on the update, use the new option.',
            example:
            `db.people.findAndModify({
    query: { name: "Andy" },
    sort: { rating: 1 },
    update: { $inc: { score: 1 } },
    new: true
})`,
            score: 100
      },
      {
            caption: "findAndModify sort and remove",
            snippet:
            `findAndModify({
     query: {$2},
     sort: {$3},
     remove: true
})`,
            comment: 'Modifies and returns a single document. By default, the returned document does not include the modifications made on the update. To return the document with the modifications made on the update, use the new option.',
            example:
            `db.people.findAndModify(
   {
     query: { state: "active" },
     sort: { rating: 1 },
     remove: true
   }
)`,
            score: 90
      },
]

var mongoDistinctTemplates = [
      {
            caption: "distinct",
            snippet:
            `distinct("\${2:field}")`,
            comment: 'Finds the distinct values for a specified field across a single collection and returns the results in an array.',
            example:
            `db.inventory.distinct( "item.sku", {dept: "A" })`,
            score: 100
      },

      {
            caption: "distinct with query and sort",
            snippet:
            `distinct("\${2:field}", {$3})
    .sort((a,b)=>compare(b,a))`,
            comment: 'distinct with query and sort.',
            example:
            `db.inventory.distinct( "item.sku", {dept: "A" })
    .sort((a,b)=>compare(b,a)) //desc`,
            score: 10
      }
]

var mongoMapReduceTemplates = [
      {
            caption: "mapReduce with Options",
            snippet:
            `mapReduce(
      ()=>{emit(this.$2cust_id, this.amount)}, //mapFunction
      (key, values)=>{return Array.sum(values)},//reduceFunction
      {
          query:{status: "A"}
          out: {"order_totals"}
      })`,
            comment: 'The mapReduce command allows you to run map-reduce aggregation operations over a collection. ',
            example:
            `db.orders.mapReduce(
      ()=>{emit(this.cust_id, this.amount)}, //mapFunction
      (key, values)=>{return Array.sum(values)},//reduceFunction
      {
          query:{ status: "A" }
           out: { "order_totals" }
      })`,
            score: 100
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
            score: 100
      },
      {
            caption: "remove with justone",
            snippet:
            `remove({$2},{justOne: true}} )`,
            comment: 'Removes documents from a collection. The "justone" option to limit the deletion to just one document',
            example:
            `db.products.remove({qty:{$gt: 20}},{justOne: true}})`,
            score: 100
      }
]

var mongoCreateIndexTemplates = [
      {
            caption: "createIndex",
            snippet:
            `createIndex({\${2:fieldName}:1})`,
            comment: 'Creates indexes on collections.',
            example:
            `db.collection.createIndex( { orderDate: 1 } )`,
            score: 100
      },

      {
            caption: "createIndexWithTTL",
            snippet:
            `createIndex({\${2:dateField}:1}, {expireAfterSeconds: \${3:60*60}})`,
            comment: 'To create a TTL index, use the db.collection.createIndex() method with the expireAfterSeconds option on a field whose value is either a date or an array that contains date values.',
            example:
            `db.eventlog.createIndex( { "lastModifiedDate": 1 }, { expireAfterSeconds: 3600 } )`,
            score: 10
      },

      {
            caption: "createIndexWithOptions",
            snippet:
            `createIndex(
             {\${2:fieldName}:1},
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
            score: 10
      }
]

var mongoInsertTemplates = [
      {
            caption: "insert",
            snippet:
            `insert({$2})`,
            comment: 'Inserts a document or documents into a collection.',
            example:
            `db.products.insert( { item: "card", qty: 15 } )`,
            score: 100
      },

      {
            caption: "insert Multiple Documents",
            snippet:
            `insert(
    [
      {$2},
     ]
)`,
            comment: 'insert Multiple Documents',
            example:
            `db.products.insert(
   [
     { _id: 11, item: "pencil", qty: 50, type: "no.2" },
     { item: "pen", qty: 20 },
     { item: "eraser", qty: 25 }
   ]
)`,
            score: 100
      }
]

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
            score: 100
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
            `db.articles.aggregate( [
                        { $match : { score : { $gt : 70, $lte : 90 } } },
                        { $group: { _id: null, count: { $sum: 1 } } }
                       ] );`,
            score: 10
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
            score: 10,
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
            score: 10,
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
            score: 10,
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
            score: 10,
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
            score: 10,
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
            score: 10,
            docUrl: "https://docs.mongodb.org/manual/reference/sql-aggregation-comparison/"
      },

]

var mongoStatsTemplates = [
      {
            caption: "stats",
            snippet:
            `stats(1024)`,
            comment: `Returns statistics about the collection. Specify a scale value of 1024 to display kilobytes rather than bytes.`,
            example:
            `db.orders.stats(1024)`,
            score: 100
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
            console.log("attachedToFindMethod",it);
            mongoFindTemplates.push({
                  caption: "find" + it.caption,
                  snippet: `find({ \${2:dateField}: ${it.snippet} })`,
                  comment: 'Selects documents in a collection and returns a cursor to the selected documents',
                  example:  `db.products.find( { at: ${it.example}} )`,
                  score: 100
            });
      });     
}

attachDateRangeToMongoFindTemlates();

let initMongoCodeTemplates = () => {
      addMongoCodeTemplates("find", mongoFindTemplates);
      addMongoCodeTemplates("findOne", mongoFindOneTemplates);
      addMongoCodeTemplates("findAndModify", mongoFindAndModifyTemplates);
      addMongoCodeTemplates("insert", mongoInsertTemplates);
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
