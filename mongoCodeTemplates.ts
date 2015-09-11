///<reference path='typings/node/node.d.ts'/>

var mongoFindTemplates = [
      {
            caption: "find",
            snippet: 
`find({ $2 })`,
            comment: 'Selects documents in a collection and returns a cursor to the selected documents.',
            example:
`db.products.find( { qty: { $gte: 25, $lt: 35 } })`,
            score:1000
      },
      
      {
            caption: "find with a projection",
            snippet: 
`find( { $2 }, { _id: 0, $3: 1 } )`,
            comment: 'The projection parameter specifies which fields to return. corresponds to the SELECT statement in SQL. The parameter contains either include or exclude specifications, not both, unless the exclude is for the _id field.',
            example:
`db.products.find( { qty: { $gte: 25, $lt: 35 } }, { _id: 0, qty: 1 } )`,
            score:100
      },
      
      {
            caption: "find with forEach method",
            snippet: 
`find( { $2 }, { _id: 0, $3: 1 } )`,
            comment: 'uses the cursor method forEach() to iterate the cursor and access the documents.',
            example:
`db.products.find({$2},{name:1})
   .sort({name:1})
   .forEach((it)=>{ 
      $4
      return it;  
})`,
            score:90
      },
      
      {
            caption: "find sort and limit",
            snippet: 
`find({ $2 }).sort({ name: 1}).limit(5)`,
            comment: 'uses the cursor method forEach() to iterate the cursor and access the documents.',
            example:
`db.bios.find().sort({name:1}).limit(5)`,
            score:90
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
            score:100
      },
      
      {
            caption: "findOne with a projection",
            snippet: 
`findOne(
    { $2 },
    { name: 1}
)`,
            comment: 'The projection parameter specifies which fields to return. The parameter contains either include or exclude specifications, not both, unless the exclude is for the _id field.',
            example:
`db.bios.findOne(
    { },
    { name: 1, contribs: 1 }
)`,
            score:100
      },
]

var mongoUpdateTemplates = [
      
//update$modifier
      {
            caption: "update",
            snippet: 
`update(
   { $2 },
   { \\$set: { $3 } }
)`,
            comment: 'Modifies an existing document or documents in a collection. The $set operator replaces the value of a field with the specified value.',
            example:
`db.products.update(
   { _id: 100 },
   { \\$set: { quantity: 500 } }
)`,
            score:1000
      },
      
      {
            caption: "update$set",
            snippet: 
`update(
   { $2 },
   { \\$set: { $3 } }
)`,
            comment: 'Modifies an existing document or documents in a collection. The $set operator replaces the value of a field with the specified value.',
            example:
`db.products.update(
   { _id: 100 },
   { $set: { quantity: 500 } }
)`,
            meta: "template",
            score:100,
      },
      
      
      {
            caption: "update$inc",
            snippet: 
`update(
   { $2 },
   { \\$inc: { $3 } }
)`,
            comment: 'Modifies an existing document or documents in a collection. The $inc operator increments a field by a specified value.',
            example:
`db.products.update(
   { sku: "abc123" },
   { \\$inc: { quantity: -2, "metrics.orders": 1 } }
)`,
            meta: "template",
            score:90,
      },
      
      
      {
            caption: "update$push",
            snippet:
`update(
   { $2 },
   { \\$push: { $3 } }
)`,
            comment: 'Modifies an existing document or documents in a collection. $push adds the array field with the value as its element.',
            example:
`db.students.update(
   { _id: 1 },
   { \\$push: { scores: 89 } }
)`,
            meta: "template",
            score:90,
      },
      
      
      {
            caption: "update$addToSet",
            snippet:
`update(
   { $2 },
   { \\$addToSet: { $3 } }
)`,
            comment: 'Modifies an existing document or documents in a collection. The $addToSet operator adds a value to an array unless the value is already present, in which case $addToSet does nothing to that array.',
            example:
`db.test.update(
   { _id: 1 },
   { $addToSet: {letters: [ "c", "d" ] } }
)`,
            meta: "template",
            score:90,
      },
      
      
      
      {
            caption: "upsert",
            snippet:
`update(
   { $2 },
   { \\$set: { $3 } },
   { upsert: true}
)`,
            comment: ' An upsert updates the documentif found or inserts it if not. ',
            example:
`db.products.update(
   { _id: 100 },
   { $set: { quantity: 500 } },
   { upsert: true}
)`,

            meta: "template",
            score:90,
      },
            
      {
            caption: "update with multi option",
            snippet:
`update(
   { $2 },
   { \\$set: { $3 } },
   { multi: true }
)`,
            comment: 'update with multi option',
            example:
`db.products.update(
   { _id: 100 },
   { $set: { quantity: 500 } },
   { multi: true }
)`,

            meta: "template",
            score:90,
      },
      
      {
            caption: "update with upsert and multi options",
            snippet:
`update(
   { $2 },
   { \\$set: { $3 } },
   { upsert:true, multi: true }
)`,
            comment: 'Combine the upsert and multi Options',
            example:
`db.books.update(
   { item: "EFG222" },
   { $set: { reorder: false, tags: [ "literature", "translated" ] } },
   { upsert: true, multi: true }
)`,

            meta: "template",
            score:90,
      },      
];

var mongoFindAndModifyTemplates = [      
      {
            caption: "findAndModify",
            snippet: 
`findAndModify({
    query: { $2 },
    sort: { $3 },
    update: { $4 },
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
            score:100
      },
      {
            caption: "findAndModify sort and remove",
            snippet: 
`findAndModify({
     query: { $2 },
     sort: { $3 },
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
            score:90
      },
]

var mongoDistinctTemplates = [      
      {
            caption: "distinct with query and sort",
            snippet: 
`db.inventory.distinct("$2", { $3 })
    .sort((a,b)=>compare(b,a))`,
            comment: 'distinct with query and sort.',
            example:
`db.inventory.distinct( "item.sku", {dept: "A" })
    .sort((a,b)=>compare(b,a)) //desc`,
            score:100
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
          query:{ status: "A" }
          out: { "order_totals" }
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
      score:100
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
      score:100
   },
      {
            caption: "remove with justone",
            snippet: 
`remove({$2},{justOne: true}} )`,
            comment: 'Removes documents from a collection. The "justone" option to limit the deletion to just one document',
            example:
`db.products.remove({qty:{$gt: 20}},{justOne: true}})`,
      score:100
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
      score:100
   },
   
      {
            caption: "insert Multiple Documents",
            snippet: 
`insert(
    [
      { $2 },
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
      score:100
   }
]


let mongoCodeTemplates=[];



let addMongoCodeTemplates=(mongoMethod,templates:any[])=>{
    let theTmpls=templates.map((it)=>{
          it.meta="code template"
          it.isMongoTemplateCommand=true;
          it.methodDotName="mongo.ICollection."+mongoMethod;  //for help url
          
          return it;
    })  
    
    mongoCodeTemplates=mongoCodeTemplates.concat(templates)
}

let initMongoCodeTemplates=()=>{
      addMongoCodeTemplates("find",mongoFindTemplates);
      addMongoCodeTemplates("findOne",mongoFindOneTemplates);
      addMongoCodeTemplates("findAndModify",mongoFindAndModifyTemplates);
      addMongoCodeTemplates("insert",mongoInsertTemplates);
      addMongoCodeTemplates("update",mongoUpdateTemplates);
      addMongoCodeTemplates("distinct",mongoDistinctTemplates);
      addMongoCodeTemplates("remove",mongoRemoveTemplates);
      addMongoCodeTemplates("mapReduce",mongoMapReduceTemplates);
}
initMongoCodeTemplates();

export = mongoCodeTemplates;
