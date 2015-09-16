///<reference path='typings/node/node.d.ts'/>

interface MongoOp {
  caption: string;
  // category:string;
  snippet: string;
  comment: string;
  example: string;
  docUrl: string;
  meta: string;
  score: number;
}

function getDocUrl(category, opName) {
  let op = opName.slice(1)
  return `http://docs.mongodb.org/manual/reference/operator/${category}/${op}/`;
}

var mongoOperators: MongoOp[] = [];


let maxScore = -10000;

let captionScoreMap = {

}

function addMongoOperators(category: string, operators: any[]) {
  operators.forEach((it) => {

    let opName = it[0];
    if (opName.indexOf('(') > -1)
      opName = opName.slice(0, opName.indexOf('('));

    let snippetPart = it[3] || "";

    let op: MongoOp = {
      caption: it[0],
      //value:`${opName}: ${snippetPart}`,
      snippet: `\\${opName}: ${snippetPart}`,
      comment: it[1],
      example: it[2],
      docUrl: getDocUrl(category, opName),
      meta: category,
      score: captionScoreMap[it[0]] || maxScore--
    }

    captionScoreMap[op.caption] = op.score;
    
    //console.log('op',op);    
    
    mongoOperators.push(op);
  })


}


//category: query
//Query and Projection Operators
// $gt -> $gt: 
let queryOperators = [
  //Query Selectors
  //Comparison
  ['$gt', ' values that are greater than a specified value.', 'db.inventory.find( { qty: { $gt: 20 } } )'],
  ['$gte', ' values that are greater than or equal to a specified value.', 'db.inventory.find( { qty: { $gte: 20 } } )'],
  ['$lt', ' values that are less than a specified value.', 'db.inventory.find( { qty: { $lt: 20 } } )'],
  ['$lte', ' values that are less than or equal to a specified value.', 'db.inventory.find( { qty: { $lte: 20 } } )'],
  ['$ne', ' all values that are not equal to a specified value.', 'db.inventory.find( { qty: { $ne: 20 } } )'],
  ['$in', ' any of the values specified in an array.', 'db.inventory.find( { qty: { $in: [ 5, 15 ] } } )', '[$0]'],
  ['$nin', ' none of the values specified in an array.', 'db.inventory.find( { qty: { $nin: [ 5, 15 ] } } )', '[$0]'],
  ['$eq', '(New in version 3.0) values that are equal to a specified value. The $eq expression is equivalent to { field: <value> }.', 'db.inventory.find( { qty: { $eq: 20 } } )'],
	
  //Logical
  ['$or', 'Joins query clauses with a logical OR returns all documents that match the conditions of either clause.'
    , 'db.inventory.find( { $or: [ { quantity: { $lt: 20 } }, { price: 10 } ] } )', '[{$0}]'],
  ['$and', '(New in version 2.0) Joins query clauses with a logical AND returns all documents that match the conditions of both clauses.'
    , 'db.inventory.find( { $and: [ { price: { $ne: 1.99 } }, { price: { $exists: true } } ] } )', '[{$0}]'],
  ['$not', 'Inverts the effect of a query expression and returns documents that do not match the query expression.'
    , 'db.inventory.find( { price: { $not: { $gt: 1.99 } } } )', '{$0}'],
  ['$nor', 'Joins query clauses with a logical NOR returns all documents that fail to match both clauses.'
    , 'db.inventory.find( { $nor: [ { price: 1.99 }, { sale: true } ]  } )', '[{$0}]'],
	
  //Element
  ['$exists', 'Matches documents that have the specified field.', 'db.inventory.find( { qty: { $exists: true, $nin: [ 5, 15 ] } } )', "${1:true}"],
  ['$type', `Selects documents if a field is of the specified type.
Double	1	 
String	2	 
Object	3	 
Array	4	 
Object id	7	 
Boolean	8	 
Date	9	 
Null	10	 
32-bit integer	16	 
Timestamp	17	 
64-bit integer	18
Min key	255	Query with -1.
Max key	127`, 
    'db.inventory.find( { tags: { $type : 2 } } ); //type 2 is String'],
	
  //Evaluation
  ['$mod', 'Performs a modulo operation on the value of a field and selects documents with a specified result.', 'db.inventory.find( { qty: { $mod: [ 4, 0 ] } } )', '[$1, $2]'],
  ['$regex', 'Selects documents where values match a specified regular expression.', 'db.products.find( { sku: { $regex: /^ABC/i } } )', '/$0/'],
  ['$text', '(New in version 2.6) Performs text search.', '{ $text: { $search: "leche", $language: "es" } }', '{ \\$search: $0 }'],

  ['$where', 'Matches documents that satisfy a JavaScript expression.'
    , `db.myCollection.find( { active: true, $where: "this.credits - this.debits < 0" } );
db.myCollection.find( { active: true, $where: function() { return obj.credits - obj.debits < 0; } } );`
		],
	
  //Geospatial
  ['$geoWithin', '(New in version 2.4) Selects geometries within a bounding GeoJSON geometry. The 2dsphere and 2d indexes support $geoWithin.'
    , `db.places.find({
     loc: {
       $geoWithin: {
          $geometry: {
             type : "Polygon" ,
             coordinates: [ [ [ 0, 0 ], [ 3, 6 ], [ 6, 1 ], [ 0, 0 ] ] ]
          }
       }
     }
   })`, '{$0}'],

  ['$geoIntersects', '(New in version 2.4) Selects geometries that intersect with a GeoJSON geometry. The 2dsphere index supports $geoIntersects.',
    `db.places.find({
     loc: {
       $geoIntersects: {
          $geometry: {
             type: "Polygon" ,
             coordinates: [
               [ [ 0, 0 ], [ 3, 6 ], [ 6, 1 ], [ 0, 0 ] ]
             ]
          }
       }
     }
   })`, '{$0}'],

  ['$near', 'Returns geospatial objects in proximity to a point. Requires a geospatial index. The 2dsphere and 2d indexes support $near.',
    `db.places.find({
     location:
       { $near :
          {
            $geometry: { type: "Point",  coordinates: [ -73.9667, 40.78 ] },
            $minDistance: 1000,
            $maxDistance: 5000
          }
       }
   })`, '{$0}'],

  ['$nearSphere', 'Returns geospatial objects in proximity to a point on a sphere. Requires a geospatial index. The 2dsphere and 2d indexes support $nearSphere.',
    `db.places.find({
     location: {
        $nearSphere: {
           $geometry: {
              type : "Point",
              coordinates : [ -73.9667, 40.78 ]
           },
           $minDistance: 1000,
           $maxDistance: 5000
        }
     }
   })`, '{$0}'],

  ['$geometry', '(New in version 2.4) The $geometry operator specifies a GeoJSON geometry for use with the following geospatial query operators: $geoWithin, $geoIntersects, $near, and $nearSphere. $geometry uses EPSG:4326 as the default coordinate reference system (CRS).',
    `db.places.find(
   {
     location:
       { $near :
          {
            $geometry: { type: "Point",  coordinates: [ -73.9667, 40.78 ] },
            $minDistance: 1000,
            $maxDistance: 5000
          }
       }
   }
)`, `{ type: "$0", coordinates: [] }`],

  ['$minDistance', '(New in version 2.6) Filters the results of a geospatial $near or $nearSphere query to those documents that are at least the specified distance from the center point.',
    `db.places.find({
     location:
       { $near :
          {
            $geometry: { type: "Point",  coordinates: [ -73.9667, 40.78 ] },
            $minDistance: 1000,
            $maxDistance: 5000
          }
       }
   })`],

  ['$maxDistance', 'The $maxDistance operator constrains the results of a geospatial $near or $nearSphere query to the specified distance. The measuring units for the maximum distance are determined by the coordinate system in use. For GeoJSON point object, specify the distance in meters, not tradians.',
    `db.places.find( {
   loc: { $near: [ 100 , 100 ],  $maxDistance: 10 }
} )`],

  ['$center', '(New in version 1.4) The $center operator specifies a circle for a $geoWithin query. The query returns legacy coordinate pairs that are within the bounds of the circle. The operator does not return GeoJSON objects.',
    `db.places.find(
   { loc: { $geoWithin: { $center: [ [-74, 40.74], 10 ] } } }
)`, '[ [ $1, $2 ] , $3 ]'],

  ['$centerSphere', '(New in version 1.8) Defines a circle for a geospatial query that uses spherical geometry. The query returns documents that are within the bounds of the circle. You can use the $centerSphere operator on both GeoJSON objects and legacy coordinate pairs.',
    `db.places.find( {
  loc: { $geoWithin: { $centerSphere: [ [ -88, 30 ], 10/3963.2 ] } }
} )`, '[ [ $1, $2 ] , $3 ]'],

  ['$box', 'Specifies a rectangle for a geospatial $geoWithin query to return documents that are within the bounds of the rectangle, according to their point-based location data. When used with the $box operator, $geoWithin returns documents based on grid coordinates and does not query for GeoJSON shapes.',
    ``, '[ [ $1, $2 ], [ $3, $4 ] ]'],

  ['$polygon', '(New in version 1.9) Specifies a polygon for a geospatial $geoWithin query on legacy coordinate pairs. The query returns pairs that are within the bounds of the polygon. The operator does not query for GeoJSON objects.',
    `db.places.find(
  {
     loc: {
       $geoWithin: { $polygon: [ [ 0 , 0 ], [ 3 , 6 ], [ 6 , 0 ] ] }
     }
  }
)`, '[ [ $1 , $2 ] ]'],
    
  //$uniqueDocs Deprecated since version 2.6: Geospatial queries no longer return duplicate results. The $uniqueDocs operator has no impact on results.
  ['$uniqueDocs', 'Deprecated since version 2.6: Geospatial queries no longer return duplicate results. The $uniqueDocs operator has no impact on results', ''],
	
  //Array
  ['$all', 'Matches arrays that contain all elements specified in the query.', 'db.inventory.find( { tags: { $all: [ "appliance", "school", "book" ] } } )', '[$0]'],

  ['$elemMatch', 'Selects documents if element in the array field matches all the specified $elemMatch conditions.',
    `db.scores.find(
   { results: { $elemMatch: { $gte: 80, $lt: 85 } } }
)`, '{$0}'],

  ['$size', 'Selects documents if the array field is a specified size.', 'db.collection.find( { field: { $size: 2 } } );'],
	
  //Comments
  ['$comment', 'Adds a comment to a query predicate.',
    `db.records.find(
   {
     x: { $mod: [ 2, 0 ] },
     $comment: "Find even values."
   }
)`, '"$1"'],
]

//category projection
let projectionOperator = [
  //Projection Operators
  //['$',	'Projects the first element in an array that matches the query condition.'],
  ['$slice', 'Limits the number of elements projected from an array. Supports skip and limit slices.',
    `db.posts.find( {}, { comments: { $slice: 5 } } );
db.posts.find( {}, { comments: { $slice: -5 } } );
db.posts.find( {}, { comments: { $slice: [ 20, 10 ] } } )`, ''], 


  ['$elemMatch', '(New in version 2.2) Projects the first element in an array that matches the specified $elemMatch condition.',
    `db.schools.find( { zipcode: "63109" },
                 { students: { $elemMatch: { school: 102 } } } )`, '{$1}'],

  ['$meta', '(New in version 2.6) Projects the document’s score assigned during $text operation.',
    `db.collection.find(
   <query>,
   { score: { $meta: "textScore" } }
).sort( { score: { $meta: "textScore" } } )`, '"${1:textScore}"'],

];


//category : update
//Update Operators
//The following modifiers are available for use in update operations; e.g. in db.collection.update() and db.collection.findAndModify().
let updateOperators = [
  //Fields
  ['$inc', 'Increments the value of the field by the specified amount.',
    `db.products.update(
   { sku: "abc123" },
   { $inc: { quantity: -2, "metrics.orders": 1 } }
)`, '{$0}'],

  ['$mul', '(New in version 2.6) Multiplies the value of the field by the specified amount.',
    `db.products.update(
   { _id: 1 },
   { $mul: { price: 1.25 } }
)`, '{$0}'],


  ['$rename', 'Renames a field.',
    `db.students.update( { _id: 1 }, { $rename: { "name.first": "name.fname" } } )`, '{$1}'],

  ['$set', 'Sets the value of a field in a document.',
    `db.products.update(
   { _id: 100 },
   { $set: { "details.make": "zzz" } }
)`, '{$0}'],

  ['$setOnInsert', '(New in version 2.4) Sets the value of a field if an update results in an insert of a document. Has no effect on update operations that modify existing documents.',
    `db.products.update(
  { _id: 1 },
  {
     $set: { item: "apple" },
     $setOnInsert: { defaultQty: 100 }
  },
  { upsert: true }
)`, '{$0}'],



  ['$unset', 'Removes the specified field from a document.',
    `db.products.update(
   { sku: "unknown" },
   { $unset: { quantity: "", instock: "" } }
)`, '{$0: "" }'],

  ['$min', 'Only updates the field if the specified value is less than the existing field value.', 'db.scores.update( { _id: 1 }, { $min: { lowScore: 150 } } )', '{$0}'],
  ['$max', 'Only updates the field if the specified value is greater than the existing field value.', 'db.scores.update( { _id: 1 }, { $max: { highScore: 870 } } )', '{$0}'],
  ['$currentDate', 'Sets the value of a field to current date, either as a Date or a Timestamp.',
    `db.users.update({ _id: 1 },
   {
     $currentDate: {
        lastModified: true,
        "cancellation.date": { $type: "timestamp" }
     },
     $set: {
        status: "D",
        "cancellation.reason": "user request"
     }
   })`, '{$1}'],

  //Array
  //['$', 'Acts as a placeholder to update the first element that matches the query condition in an update.'],
  ['$addToSet', 'Adds elements to an array only if they do not already exist in the set.',
    `db.inventory.update(
   { _id: 2 },
   { $addToSet: { tags: { $each: [ "camera", "electronics", "accessories" ] } } }
 )`, '{$1}'],

  ['$pop', 'Removes the first or last item of an array.', 'db.students.update( { _id: 1 }, { $pop: { scores: 1 } } )', '{$1}'],

  ['$pull', 'Removes all array elements that match a specified query.', 'db.profiles.update( { _id: 1 }, { $pull: { votes: { $gte: 6 } } } )', '{$1}'],


  ['$pullAll', 'Removes all matching values from an array.', 'db.survey.update( { _id: 1 }, { $pullAll: { scores: [ 0, 5 ] } } )', '{$1}'],

  ['$push', 'Adds an item to an array.',
    `db.students.update(
   { name: "joe" },
   { $push: { scores: { $each: [ 90, 92, 85 ] } } }
)`, '{$1}'],

  ['$pushAll', 'Deprecated since version 2.4: Use the $push operator with $each instead.'],
	

  //Modifiers
  ['$each', 'Modifies the $push and $addToSet operators to append multiple items for array updates.',
    `db.students.update(
   { name: "joe" },
   { $push: { scores: { $each: [ 90, 92, 85 ] } } }
)`, '[$1]'],

  ['$slice', '(New in version 2.4) Modifies the $push operator to limit the size of updated arrays.',
    `db.students.update({ _id: 1 },
   {
     $push: {
       scores: {
         $each: [ 80, 78, 86 ],
         $slice: -5
       }
     }
   })`, ' '],

  ['$sort', '(New in version 2.4) Modifies the $push operator to reorder documents stored in an array.',
    `db.students.update(
   { _id: 2 },
   { $push: { tests: { $each: [ 40, 60 ], $sort: 1 } } }
)`, '1'],

  ['$position', '(New in version 2.6) Modifies the $push operator to specify the position in the array to add elements.',
    `db.students.update({ _id: 1 },
   {
     $push: {
        scores: {
           $each: [ 50, 60, 70 ],
           $position: 0
        }
     }
   })`],

  //Bitwise
  ['$bit', 'Performs bitwise AND, OR, and XOR updates of integer values.',
    `db.switches.update(
   { _id: 1 },
   { $bit: { expdata: { and: NumberInt(10) } } }
)`, '{$1}'],

  //Isolation
  ['$isolated', 'Modifies the behavior of a write operation to increase the isolation of the operation.',
    `db.foo.update(
    { status : "A" , $isolated : 1 },
    { $inc : { count : 1 } },
    { multi: true }
)`, '1'],

]

//category: aggregation
//Aggregation Pipeline Operators
//Pipeline stages appear in an array. Documents pass through the stages in sequence.
let aggregationOperators = [
  ['$project', 'Reshapes each document in the stream, such as by adding new fields or removing existing fields. For each input document, outputs one document.', 'db.books.aggregate( [ { $project : { _id: 0, title : 1 , author : 1 } } ] )', '{$1}'],

  ['$match', 'Filters the document stream to allow only matching documents to pass unmodified into the next pipeline stage. $match uses standard MongoDB queries. For each input document, outputs either one document (a match) or zero documents (no match).',
    `db.articles.aggregate( [
                        { $match : { score : { $gt : 70, $lte : 90 } } },
                        { $group: { _id: null, count: { $sum: 1 } } }
                       ] );`, '{$1}'],

  ['$redact', '(New in version 2.6) Reshapes each document in the stream by restricting the content for each document based on information stored in the documents themselves. Incorporates the functionality of $project and $match. Can be used to implement field level redaction. For each input document, outputs either one or zero document.',
    `var userAccess = [ "STLW", "G" ];
db.forecasts.aggregate([
     { $match: { year: 2014 } },
     { $redact: {
        $cond: {
           if: { $gt: [ { $size: { $setIntersection: [ "$tags", userAccess ] } }, 0 ] },
           then: "$$DESCEND",
           else: "$$PRUNE"
         }
       }
     }]);`, '{$1}'],

  ['$limit', 'Passes the first n documents unmodified to the pipeline where n is the specified limit. For each input document, outputs either one document (for the first n documents) or zero documents (after the first n documents).',
    `db.article.aggregate(
    { $limit : 5 }
);`],

  ['$skip', 'Skips the first n documents where n is the specified skip number and passes the remaining documents unmodified to the pipeline. For each input document, outputs either zero documents (for the first n documents) or one document (if after the first n documents).',
    `db.article.aggregate(
    { $skip : 5 }
);`	],

  ['$unwind', 'Deconstructs an array field from the input documents to output a document for each element. Each output document replaces the array with an element value. For each input document, outputs n documents where n is the number of array elements and can be zero for an empty array.',
    `db.inventory.aggregate( [ { $unwind : "$sizes" } ] )`],

  ['$group', 'Groups input documents by a specified identifier expression and applies the accumulator expression(s), if specified, to each group. Consumes all input documents and outputs one document per each distinct group. The output documents only contain the identifier field and, if specified, accumulated fields.',
    `db.sales.aggregate([
      {
        $group : {
           _id : { month: { $month: "$date" }, day: { $dayOfMonth: "$date" }, year: { $year: "$date" } },
           totalPrice: { $sum: { $multiply: [ "$price", "$quantity" ] } },
           averageQuantity: { $avg: "$quantity" },
           count: { $sum: 1 }
        }
      }])`, '{$1}'],

  ['$sort', 'Reorders the document stream by a specified sort key. Only the order changes; the documents remain unmodified. For each input document, outputs one document.',
    `db.users.aggregate(
   [
     { $sort : { age : -1, posts: 1 } }
   ]
)`, '{$1}'],

  ['$geoNear', '(New in version 2.4) Returns an ordered stream of documents based on the proximity to a geospatial point. Incorporates the functionality of $match, $sort, and $limit for geospatial data. The output documents include an additional distance field and can include a location identifier field.',
    `db.places.aggregate([{
     $geoNear: {
        near: { type: "Point", coordinates: [ -73.99279 , 40.719296 ] },
        distanceField: "dist.calculated",
        maxDistance: 2,
        query: { type: "public" },
        includeLocs: "dist.location",
        num: 5,
        spherical: true
     }
}])`, '{$1}'],

  ['$out', '(New in version 2.6) Writes the resulting documents of the aggregation pipeline to a collection. To use the $out stage, it must be the last stage in the pipeline.',
    `db.books.aggregate( [
                      { $group : { _id : "$author", books: { $push: "$title" } } },
                      { $out : "authors" }
                  ] )`],

  //Expression Operators
  //Boolean Operators
  //Boolean expressions evaluate their argument expressions as booleans and return a boolean as the result.'],

  ['$and', 'Returns true only when all its expressions evaluate to true. Accepts any number of argument expressions.',
    `db.inventory.aggregate(
   [
     {
       $project:
          {
            item: 1,
            qty: 1,
            result: { $and: [ { $gt: [ "$qty", 100 ] }, { $lt: [ "$qty", 250 ] } ] }
          }
     }
   ]
)`, '[$1]'],

  ['$or', 'Returns true when any of its expressions evaluates to true. Accepts any number of argument expressions.',
    `db.inventory.aggregate(
   [
     {
       $project:
          {
            item: 1,
            result: { $or: [ { $gt: [ "$qty", 250 ] }, { $lt: [ "$qty", 200 ] } ] }
          }
     }
   ]
)`, '[$1]'],

  ['$not', 'Returns the boolean value that is the opposite of its argument expression. Accepts a single argument expression.',
    `db.inventory.aggregate(
   [
     {
       $project:
          {
            item: 1,
            result: { $not: [ { $gt: [ "$qty", 250 ] } ] }
          }
     }
   ]
)`, '[$1]'],

  // Set Operators
  // Set expressions performs set operation on arrays, treating arrays as sets. Set expressions ignores the duplicate entries in each input array and the order of the elements.'],

  ['$setEquals', '(New in version 2.6) Returns true if the input sets have the same distinct elements. Accepts two or more argument expressions.',
    `db.experiments.aggregate(
   [
     { $project: { A: 1, B: 1, sameElements: { $setEquals: [ "$A", "$B" ] }, _id: 0 } }
   ]
)`, '["$1","$2"]'],

  ['$setIntersection', '(New in version 2.6) Returns a set with elements that appear in all of the input sets. Accepts any number of argument expressions.',
    `db.experiments.aggregate(
   [
     { $project: { A: 1, B: 1, commonToBoth: { $setIntersection: [ "$A", "$B" ] }, _id: 0 } }
   ]
)`, '[$1]'],

  ['$setUnion', '(New in version 2.6) Returns a set with elements that appear in any of the input sets. Accepts any number of argument expressions.',
    `db.experiments.aggregate(
   [
     { $project: { A:1, B: 1, allValues: { $setUnion: [ "$A", "$B" ] }, _id: 0 } }
   ]
)`, '[$1]'],

  ['$setDifference', '(New in version 2.6) Returns a set with elements that appear in the first set but not in the second set; i.e. performs a relative complement of the second set relative to the first. Accepts exactly two argument expressions.',
    `db.experiments.aggregate(
   [
     { $project: { A: 1, B: 1, inBOnly: { $setDifference: [ "$B", "$A" ] }, _id: 0 } }
   ]
)`, '[$1]'],

  ['$setIsSubset', '(New in version 2.6) Returns true if all elements of the first set appear in the second set, including when the first set equals the second set; i.e. not a strict subset. Accepts exactly two argument expressions.',
    `db.experiments.aggregate(
   [
     { $project: { A:1, B: 1, AisSubset: { $setIsSubset: [ "$A", "$B" ] }, _id:0 } }
   ]
)`, '[$1]'],

  ['$anyElementTrue', '(New in version 2.6) Returns true if any elements of a set evaluate to true; otherwise, returns false. Accepts a single argument expression.',
    `db.survey.aggregate(
   [
     { $project: { responses: 1, isAnyTrue: { $anyElementTrue: [ "$responses" ] }, _id: 0 } }
   ]
)`, '[$1]'],

  ['$allElementsTrue', '(New in version 2.6) Returns true if no element of a set evaluates to false, otherwise, returns false. Accepts a single argument expression.',
    `db.survey.aggregate(
   [
     { $project: { responses: 1, isAllTrue: { $allElementsTrue: [ "$responses" ] }, _id: 0 } }
   ]
)`, '[$1]'],

  // Comparison Operators
  // Comparison expressions return a boolean except for $cmp which returns a number.'],
  // The comparison expressions take two argument expressions and compare both value and type, using the specified BSON comparison order for values of different types.'],

  ['$cmp', 'Returns: 0 if the two values are equivalent, 1 if the first value is greater than the second, and -1 if the first value is less than the second.',
    `db.inventory.aggregate(
   [
     {
       $project:
          {
            item: 1,
            qty: 1,
            cmpTo250: { $cmp: [ "$qty", 250 ] },
            _id: 0
          }
     }
   ]
)`, '["$1",$2]'],

  ['$eq', 'Returns true if the values are equivalent.',
    `db.inventory.aggregate(
   [
     {
       $project:
          {
            item: 1,
            qty: 1,
            qtyEq250: { $eq: [ "$qty", 250 ] },
            _id: 0
          }
     }
   ]
)`, '["$1",$2]'],

  ['$gt', 'Returns true if the first value is greater than the second.',
    `db.inventory.aggregate(
   [
     {
       $project:
          {
            item: 1,
            qty: 1,
            qtyGt250: { $gt: [ "$qty", 250 ] },
            _id: 0
          }
     }
   ]
)`, '["$1",$2]'],

  ['$gte', 'Returns true if the first value is greater than or equal to the second.',
    `db.inventory.aggregate(
   [
     {
       $project:
          {
            item: 1,
            qty: 1,
            qtyGte250: { $gte: [ "$qty", 250 ] },
            _id: 0
          }
     }
   ]
)`, '["$1",$2]'],

  ['$lt', 'Returns true if the first value is less than the second.',
    `db.inventory.aggregate(
   [
     {
       $project:
          {
            item: 1,
            qty: 1,
            qtyLt250: { $lt: [ "$qty", 250 ] },
            _id: 0
          }
     }
   ]
)`, '["$1",$2]'],

  ['$lte', 'Returns true if the first value is less than or equal to the second.',
    `db.inventory.aggregate(
   [
     {
       $project:
          {
            item: 1,
            qty: 1,
            qtyLte250: { $lte: [ "$qty", 250 ] },
            _id: 0
          }
     }
   ]
)`, '["$1",$2]'],

  ['$ne', 'Returns true if the values are not equivalent.',
    `db.inventory.aggregate(
   [
     {
       $project:
          {
            item: 1,
            qty: 1,
            qtyNe250: { $ne: [ "$qty", 250 ] },
            _id: 0
          }
     }
   ]
)`, '["$1",$2]'],

  // Arithmetic Operators
  // Arithmetic expressions perform mathematic operations on numbers. Some arithmetic expressions can also support date arithmetic.'],
  ['$add', 'Adds numbers to return the sum, or adds numbers and a date to return a new date. If adding numbers and a date, treats the numbers as milliseconds. Accepts any number of argument expressions, but at most, one expression can resolve to a date.',
    `db.sales.aggregate(
   [
     { $project: { item: 1, billing_date: { $add: [ "$date", 3*24*60*60000 ] } } }
   ]
)`, '["$1",$2]'],

  ['$subtract', 'Returns the result of subtracting the second value from the first. If the two values are numbers, return the difference. If the two values are dates, return the difference in milliseconds. If the two values are a date and a number in milliseconds, return the resulting date. Accepts two argument expressions. If the two values are a date and a number, specify the date argument first as it is not meaningful to subtract a date from a number.',
    `db.sales.aggregate( [ { $project: { item: 1, dateDifference: { $subtract: [ new Date(), "$date" ] } } } ] )`, '["$1",$2]'],

  ['$multiply', 'Multiplies numbers to return the product. Accepts any number of argument expressions.',
    `db.sales.aggregate(
   [
     { $project: { date: 1, item: 1, total: { $multiply: [ "$price", "$quantity" ] } } }
   ]
)`, '["$1", $2]'],

  ['$divide', 'Returns the result of dividing the first number by the second. Accepts two argument expressions.',
    `db.planning.aggregate(
   [
     { $project: { name: 1, workdays: { $divide: [ "$hours", 8 ] } } }
   ]
)`, '["$1", $2]'],

  ['$mod', 'Returns the remainder of the first number divided by the second. Accepts two argument expressions.',
    `db.planning.aggregate(
   [
     { $project: { remainder: { $mod: [ "$hours", "$tasks" ] } } }
   ]
)`, '["$1", $2]'],

  // String Operators
  // String expressions, with the exception of $concat, only have a well-defined behavior for strings of ASCII characters.'],
  //$concat behavior is well-defined regardless of the characters used.'],

  ['$concat', 'New in version 2.4. Concatenates any number of strings.',
    `db.inventory.aggregate(
   [
      { $project: { itemDescription: { $concat: [ "$item", " - ", "$description" ] } } }
   ]
)`, '["$1", $2]'],

  ['$substr', 'Returns a substring of a string, starting at a specified index position up to a specified length. Accepts three expressions as arguments: the first argument must resolve to a string, and the second and third arguments must resolve to integers.',
    `db.inventory.aggregate(
   [
     {
       $project:
          {
            item: 1,
            yearSubstring: { $substr: [ "$quarter", 0, 2 ] },
            quarterSubtring: { $substr: [ "$quarter", 2, -1 ] }
          }
      }
   ]
)`, '["$1", $2, $3]'],

  ['$toLower', 'Converts a string to lowercase. Accepts a single argument expression.',
    `db.inventory.aggregate(
   [
     {
       $project:
         {
           item: { $toLower: "$item" },
           description: { $toLower: "$description" }
         }
     }
   ]
)`, '"$1"'],

  ['$toUpper', 'Converts a string to uppercase. Accepts a single argument expression.',
    `db.inventory.aggregate(
   [
     {
       $project:
         {
           item: { $toUpper: "$item" },
           description: { $toUpper: "$description" }
         }
     }
   ]
)`, "$1"],

  ['$strcasecmp', 'Performs case-insensitive string comparison and returns: 0 if two strings are equivalent, 1 if the first string is greater than the second, and -1 if the first string is less than the second.',
    `db.inventory.aggregate(
   [
     {
       $project:
          {
            item: 1,
            comparisonResult: { $strcasecmp: [ "$quarter", "13q4" ] }
          }
      }
   ]
)`, '["$1",$2]'],

  //Text Search Operators
  ['$meta', 'New in version 2.6. Access text search metadata.',
    `db.articles.aggregate(
   [
     { $match: { $text: { $search: "cake" } } },
     { $group: { _id: { $meta: "textScore" }, count: { $sum: 1 } } }
   ]
)`, '"$1"'],

  //Array Operators
  ['$size', 'New in version 2.6. Returns the number of elements in the array. Accepts a single expression as argument.',
    `db.inventory.aggregate(
   [
      {
         $project: {
            item: 1,
            numberOfColors: { $size: "$colors" }
         }
      }
   ]
)`, '"$1"'],

  //Variable Operators
  ['$map', 'Applies a subexpression to each element of an array and returns the array of resulting values in order. Accepts named parameters.',
    `db.grades.aggregate(
   [
      { $project:
         { adjustedGrades:
            {
              $map:
                 {
                   input: "$quizzes",
                   as: "grade",
                   in: { $add: [ "$$grade", 2 ] }
                 }
            }
         }
      }
   ]
)`, '{$1}'],

  ['$let', 'Defines variables for use within the scope of a subexpression and returns the result of the subexpression. Accepts named parameters.',
    `db.sales.aggregate( [
   {
      $project: {
         finalTotal: {
            $let: {
               vars: {
                  total: { $add: [ '$price', '$tax' ] },
                  discounted: { $cond: { if: '$applyDiscount', then: 0.9, else: 1 } }
               },
               in: { $multiply: [ "$$total", "$$discounted" ] }
            }
         }
      }
   }
] )`, '{$1}'],

  //Literal Operators
  ['$literal', 'Return a value without parsing. Use for values that the aggregation pipeline may interpret as an expression. For example, use a $literal expression to a string that starts with a $ to avoid parsing as a field path.',
    `db.records.aggregate( [
   { $project: { costsOneDollar: { $eq: [ "$price", { $literal: "$1" } ] } } }
] )`],

  //Date Operators
  ['$dayOfYear', 'Returns the day of the year for a date as a number between 1 and 366 (leap year).',
    `db.sales.aggregate([{
       $project:
         {
           year: { $year: "$date" },
           month: { $month: "$date" },
           day: { $dayOfMonth: "$date" },
           hour: { $hour: "$date" },
           minutes: { $minute: "$date" },
           seconds: { $second: "$date" },
           milliseconds: { $millisecond: "$date" },
           dayOfYear: { $dayOfYear: "$date" },
           dayOfWeek: { $dayOfWeek: "$date" },
           week: { $week: "$date" }
         }
     }])`, '"$1"'],

  ['$dayOfMonth', 'Returns the day of the month for a date as a number between 1 and 31.',
   `db.sales.aggregate([{
       $project:
         {
           year: { $year: "$date" },
           month: { $month: "$date" },
           day: { $dayOfMonth: "$date" },
           hour: { $hour: "$date" },
           minutes: { $minute: "$date" },
           seconds: { $second: "$date" },
           milliseconds: { $millisecond: "$date" },
           dayOfYear: { $dayOfYear: "$date" },
           dayOfWeek: { $dayOfWeek: "$date" },
           week: { $week: "$date" }
         }
     }])`, '"$1"'],

  ['$dayOfWeek', 'Returns the day of the week for a date as a number between 1 (Sunday) and 7 (Saturday).',
    `db.sales.aggregate([{
       $project:
         {
           year: { $year: "$date" },
           month: { $month: "$date" },
           day: { $dayOfMonth: "$date" },
           hour: { $hour: "$date" },
           minutes: { $minute: "$date" },
           seconds: { $second: "$date" },
           milliseconds: { $millisecond: "$date" },
           dayOfYear: { $dayOfYear: "$date" },
           dayOfWeek: { $dayOfWeek: "$date" },
           week: { $week: "$date" }
         }
     }])`, '"$1"'],

  ['$year', 'Returns the year for a date as a number (e.g. 2014).',
    `db.sales.aggregate([{
       $project:
         {
           year: { $year: "$date" },
           month: { $month: "$date" },
           day: { $dayOfMonth: "$date" },
           hour: { $hour: "$date" },
           minutes: { $minute: "$date" },
           seconds: { $second: "$date" },
           milliseconds: { $millisecond: "$date" },
           dayOfYear: { $dayOfYear: "$date" },
           dayOfWeek: { $dayOfWeek: "$date" },
           week: { $week: "$date" }
         }
     }])`, '"$1"'],

  ['$month', 'Returns the month for a date as a number between 1 (January) and 12 (December).',
    `db.sales.aggregate([{
       $project:
         {
           year: { $year: "$date" },
           month: { $month: "$date" },
           day: { $dayOfMonth: "$date" },
           hour: { $hour: "$date" },
           minutes: { $minute: "$date" },
           seconds: { $second: "$date" },
           milliseconds: { $millisecond: "$date" },
           dayOfYear: { $dayOfYear: "$date" },
           dayOfWeek: { $dayOfWeek: "$date" },
           week: { $week: "$date" }
         }
     }])`, '"$1"'],

  ['$week', 'Returns the week number for a date as a number between 0 (the partial week that precedes the first Sunday of the year) and 53 (leap year).',
    `db.sales.aggregate([{
       $project:
         {
           year: { $year: "$date" },
           month: { $month: "$date" },
           day: { $dayOfMonth: "$date" },
           hour: { $hour: "$date" },
           minutes: { $minute: "$date" },
           seconds: { $second: "$date" },
           milliseconds: { $millisecond: "$date" },
           dayOfYear: { $dayOfYear: "$date" },
           dayOfWeek: { $dayOfWeek: "$date" },
           week: { $week: "$date" }
         }
     }])`, '"$1"'],

  ['$hour', 'Returns the hour for a date as a number between 0 and 23.',
    `db.sales.aggregate([{
       $project:
         {
           year: { $year: "$date" },
           month: { $month: "$date" },
           day: { $dayOfMonth: "$date" },
           hour: { $hour: "$date" },
           minutes: { $minute: "$date" },
           seconds: { $second: "$date" },
           milliseconds: { $millisecond: "$date" },
           dayOfYear: { $dayOfYear: "$date" },
           dayOfWeek: { $dayOfWeek: "$date" },
           week: { $week: "$date" }
         }
     }])`, '"$1"'],

  ['$minute', 'Returns the minute for a date as a number between 0 and 59.',
   `db.sales.aggregate([{
       $project:
         {
           year: { $year: "$date" },
           month: { $month: "$date" },
           day: { $dayOfMonth: "$date" },
           hour: { $hour: "$date" },
           minutes: { $minute: "$date" },
           seconds: { $second: "$date" },
           milliseconds: { $millisecond: "$date" },
           dayOfYear: { $dayOfYear: "$date" },
           dayOfWeek: { $dayOfWeek: "$date" },
           week: { $week: "$date" }
         }
     }])`, '"$1"'],

  ['$second', 'Returns the seconds for a date as a number between 0 and 60 (leap seconds).',
    `db.sales.aggregate([{
       $project:
         {
           year: { $year: "$date" },
           month: { $month: "$date" },
           day: { $dayOfMonth: "$date" },
           hour: { $hour: "$date" },
           minutes: { $minute: "$date" },
           seconds: { $second: "$date" },
           milliseconds: { $millisecond: "$date" },
           dayOfYear: { $dayOfYear: "$date" },
           dayOfWeek: { $dayOfWeek: "$date" },
           week: { $week: "$date" }
         }
     }])`, '"$1"'],

  ['$millisecond', 'Returns the milliseconds of a date as a number between 0 and 999.',
    `db.sales.aggregate([{
       $project:
         {
           year: { $year: "$date" },
           month: { $month: "$date" },
           day: { $dayOfMonth: "$date" },
           hour: { $hour: "$date" },
           minutes: { $minute: "$date" },
           seconds: { $second: "$date" },
           milliseconds: { $millisecond: "$date" },
           dayOfYear: { $dayOfYear: "$date" },
           dayOfWeek: { $dayOfWeek: "$date" },
           week: { $week: "$date" }
         }
     }])`, '"$1"'],

  ['$dateToString', 'New in version 3.0. Returns the date as a formatted string.',
    `db.sales.aggregate([
     {
       $project: {
          yearMonthDay: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          time: { $dateToString: { format: "%H:%M:%S:%L", date: "$date" } }
       }
     }
   ])`, '{ format: "$1%Y-%m-%d", date: "\\$date" }'],

  //Conditional Expressions
  ['$cond', 'New in version 2.6. A ternary operator that evaluates one expression, and depending on the result, returns the value of one of the other two expressions. Accepts either three expressions in an ordered list or three named parameters.',
    `db.inventory.aggregate([{
         $project:
           {
             item: 1,
             discount:
               {
                 $cond: { if: { $gte: [ "$qty", 250 ] }, then: 30, else: 20 }
               }
           }
      }])`, '{ if: { $1 }, then: $2, else: $3 }'],

  ['$ifNull', 'Returns either the non-null result of the first expression or the result of the second expression if the first expression results in a null result. Null result encompasses instances of undefined values or missing fields. Accepts two expressions as arguments. The result of the second expression can be null.',
    `db.inventory.aggregate(
   [
      {
         $project: {
            item: 1,
            description: { $ifNull: [ "$description", "Unspecified" ] }
         }
      }
   ]
)`, '[ "$1", "$2" ]'],

  //Accumulators
  //Accumulators, available only for the $group stage, compute values by combining documents that share the same group key. Accumulators take as input a single expression, evaluating the expression once for each input document, and maintain their state for the group of documents.'],
  ['$sum', 'Returns a sum for each group. Ignores non-numeric values.',
    `db.sales.aggregate([
     {
       $group:
         {
           _id: { day: { $dayOfYear: "$date"}, year: { $year: "$date" } },
           totalAmount: { $sum: { $multiply: [ "$price", "$quantity" ] } },
           count: { $sum: 1 }
         }
     }
   ])`, '{$1}'],

  ['$avg', 'Returns an average for each group. Ignores non-numeric values.',
    `db.sales.aggregate([
     {
       $group:
         {
           _id: "$item",
           avgAmount: { $avg: { $multiply: [ "$price", "$quantity" ] } },
           avgQuantity: { $avg: "$quantity" }
         }
     }
   ])`, '{$1}'],

  ['$first', 'Returns a value from the first document for each group. Order is only defined if the documents are in a defined order.',
    `db.sales.aggregate([
     { $sort: { item: 1, date: 1 } },
     {
       $group:
         {
           _id: "$item",
           firstSalesDate: { $first: "$date" }
         }
     }
   ])`, '"$1"'],

  ['$last', 'Returns a value from the last document for each group. Order is only defined if the documents are in a defined order.',
    `db.sales.aggregate([
     { $sort: { item: 1, date: 1 } },
     {
       $group:
         {
           _id: "$item",
           lastSalesDate: { $last: "$date" }
         }
     }
   ])`, '"$1"'],

  ['$max', 'Returns the highest expression value for each group.',
    `db.sales.aggregate([
     {
       $group:
         {
           _id: "$item",
           maxTotalAmount: { $max: { $multiply: [ "$price", "$quantity" ] } },
           maxQuantity: { $max: "$quantity" }
         }
     }
   ])`, '{$1}'],

  ['$min', 'Returns the lowest expression value for each group.',
    `db.sales.aggregate([
     {
       $group:
         {
           _id: "$item",
           minQuantity: { $min: "$quantity" }
         }
     }
   ])`, '{$1}'],

  ['$push', 'Returns an array of expression values for each group.',
    `db.sales.aggregate([
     {
       $group:
         {
           _id: { day: { $dayOfYear: "$date"}, year: { $year: "$date" } },
           itemsSold: { $push:  { item: "$item", quantity: "$quantity" } }
         }
     }
   ])`, '{$1}'],

  ['$addToSet', 'Returns an array of unique expression values for each group. Order of the array elements is undefined.',
    `db.sales.aggregate([
     {
       $group:
         {
           _id: { day: { $dayOfYear: "$date"}, year: { $year: "$date" } },
           itemsSold: { $addToSet: "$item" }
         }
     }
   ])`, '{$1}']
]

//Query Modifiers
//category, meta
let metaOperators = [
  //Modifiers
  //Many of these operators have corresponding methods in the shell. These methods provide a straightforward and user-friendly interface and are the preferred way to add these options.

  ['$comment', 'Adds a comment to the query to identify queries in the database profiler output.',
    `db.collection.find( { <query> } )._addSpecial( "$comment", <comment> )
db.collection.find( { <query> } ).comment( <comment> )
db.collection.find( { $query: { <query> }, $comment: <comment> } )`, , '"$1"'],

  ['$explain', 'Deprecated since version 3.0: Use db.collection.explain() or cursor.explain() instead. Forces MongoDB to report on query execution plans. ', 'db.collection.find( { $query: {}, $explain: 1 } )',
    `db.collection.find()._addSpecial( "$explain", 1 )
db.collection.find( { $query: {}, $explain: 1 } )
//you also can retrieve query plan information through the explain() method:
db.collection.find().explain()`, "1"],

  ['$hint', 'Forces MongoDB to use a specific index. ',
    `db.users.find().hint( { age: 1 } )
//This operation returns all documents in the collection named users using the index on the age field.

//You can also specify a hint using either of the following forms:
db.users.find()._addSpecial( "$hint", { age : 1 } )
db.users.find( { $query: {}, $hint: { age : 1 } } )`, '{$1}'],

  ['$maxScan', 'Limits the number of documents scanned.',
    `db.collection.find( { <query> } )._addSpecial( "$maxScan" , <number> )
db.collection.find( { $query: { <query> }, $maxScan: <number> } )`],

  ['$maxTimeMS', 'New in version 2.6. Specifies a cumulative time limit in milliseconds for processing operations on a cursor. ',
    `db.collection.find().maxTimeMS(100)
//You can also specify the option in either of the following forms:
db.collection.find( { $query: { }, $maxTimeMS: 100 } )
db.collection.find( { } )._addSpecial("$maxTimeMS", 100)`],

  ['$max', 'Specifies an exclusive upper limit for the index to use in a query. ',
    `db.collection.find( { <query> } ).max( { field1: <max value>, ... fieldN: <max valueN> } )
//You can also specify $max with either of the two forms:
db.collection.find( { <query> } )._addSpecial( "$max", { field1: <max value1>, ... fieldN: <max valueN> } )
db.collection.find( { $query: { <query> }, $max: { field1: <max value1>, ... fieldN: <max valueN> } } )`, '{$1}'],

  ['$min', 'Specifies an inclusive lower limit for the index to use in a query. ',
    `db.collection.find( { <query> } ).min( { field1: <min value>, ... fieldN: <min valueN>} )
//You can also specify the option with either of the two forms:
db.collection.find( { <query> } )._addSpecial( "$min", { field1: <min value1>, ... fieldN: <min valueN> } )
db.collection.find( { $query: { <query> }, $min: { field1: <min value1>, ... fieldN: <min valueN> } } )`, '{$1}'],

  ['$orderby', 'Returns a cursor with documents sorted according to a sort specification. ',
    `db.collection.find().sort( { age: -1 } )
//You can also specify the option in either of the following forms:
db.collection.find()._addSpecial( "$orderby", { age : -1 } )
db.collection.find( { $query: {}, $orderby: { age : -1 } } )`, '{$1}'],

  ['$returnKey', 'Forces the cursor to only return fields included in the index.',
    `db.collection.find( { <query> } )._addSpecial( "$returnKey", true )
db.collection.find( { $query: { <query> }, $returnKey: true } )`, 'true'],

  ['$showDiskLoc', 'Modifies the documents returned to include references to the on-disk location of each document.',
    `db.collection.find().showDiskLoc()
//You can also specify the $showDiskLoc option in either of the following forms:
db.collection.find( { <query> } )._addSpecial("$showDiskLoc" , true)
db.collection.find( { $query: { <query> }, $showDiskLoc: true } )`, 'true'],

  ['$snapshot', 'Forces the query to use the index on the _id field. ',
    `db.collection.find().snapshot()
//You can also specify the option in either of the following forms:
db.collection.find()._addSpecial( "$snapshot", true )
db.collection.find( { $query: {}, $snapshot: true } )`, 'true'],

  ['$query', 'Wraps a query document.',
    `//The following mongo operations are equivalent, and return only those documents in the collection named collection where the age field equals 25.
db.collection.find( { $query: { age : 25 } } )
db.collection.find( { age : 25 } )`, '{$1}'],

  //Sort Order
  ['$natural', 'A special sort order that orders documents using the order of documents on disk.',
    `//The $natural operator uses the following syntax to return documents in the order they exist on disk:
db.collection.find().sort( { $natural: 1 } )`, '1']

]


var initMongoOperators = () => {
  addMongoOperators('query', queryOperators);
  addMongoOperators('projection', projectionOperator);
  addMongoOperators('update', updateOperators);
  addMongoOperators('aggregation', aggregationOperators)
  addMongoOperators('meta', metaOperators);

  captionScoreMap = {};
}

initMongoOperators();

export = mongoOperators;

