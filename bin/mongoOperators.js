///<reference path='typings/node/node.d.ts'/>
function getDocUrl(category, opName) {
    var op = opName.slice(1);
    return "http://docs.mongodb.org/manual/reference/operator/" + category + "/" + op + "/";
}
var mongoOperators = [];
var maxScore = -10000;
var captionScoreMap = {};
function addMongoOperators(category, operators) {
    operators.forEach(function (it) {
        var opName = it[0];
        if (opName.indexOf('(') > -1)
            opName = opName.slice(0, opName.indexOf('('));
        var snippetPart = it[3] || "";
        var op = {
            caption: it[0],
            //value:`${opName}: ${snippetPart}`,
            snippet: "\\" + opName + ": " + snippetPart,
            comment: it[1],
            example: it[2],
            docUrl: getDocUrl(category, opName),
            meta: category,
            score: captionScoreMap[it[0]] || maxScore--
        };
        captionScoreMap[op.caption] = op.score;
        //console.log('op',op);    
        mongoOperators.push(op);
    });
}
//category: query
//Query and Projection Operators
// $gt -> $gt: 
var queryOperators = [
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
    ['$or', 'Joins query clauses with a logical OR returns all documents that match the conditions of either clause.',
        'db.inventory.find( { $or: [ { quantity: { $lt: 20 } }, { price: 10 } ] } )', '[{$0}]'],
    ['$and', '(New in version 2.0) Joins query clauses with a logical AND returns all documents that match the conditions of both clauses.',
        'db.inventory.find( { $and: [ { price: { $ne: 1.99 } }, { price: { $exists: true } } ] } )', '[{$0}]'],
    ['$not', 'Inverts the effect of a query expression and returns documents that do not match the query expression.',
        'db.inventory.find( { price: { $not: { $gt: 1.99 } } } )', '{$0}'],
    ['$nor', 'Joins query clauses with a logical NOR returns all documents that fail to match both clauses.',
        'db.inventory.find( { $nor: [ { price: 1.99 }, { sale: true } ]  } )', '[{$0}]'],
    //Element
    ['$exists', 'Matches documents that have the specified field.', 'db.inventory.find( { qty: { $exists: true, $nin: [ 5, 15 ] } } )', "${1:true}"],
    ['$type', "Selects documents if a field is of the specified type.\nDouble\t1\t \nString\t2\t \nObject\t3\t \nArray\t4\t \nObject id\t7\t \nBoolean\t8\t \nDate\t9\t \nNull\t10\t \n32-bit integer\t16\t \nTimestamp\t17\t \n64-bit integer\t18\nMin key\t255\tQuery with -1.\nMax key\t127",
        'db.inventory.find( { tags: { $type : 2 } } ); //type 2 is String'],
    //Evaluation
    ['$mod', 'Performs a modulo operation on the value of a field and selects documents with a specified result.', 'db.inventory.find( { qty: { $mod: [ 4, 0 ] } } )', '[$1, $2]'],
    ['$regex', 'Selects documents where values match a specified regular expression.', 'db.products.find( { sku: { $regex: /^ABC/i } } )', '/$0/'],
    ['$text', '(New in version 2.6) Performs text search.', '{ $text: { $search: "leche", $language: "es" } }', '{ \\$search: $0 }'],
    ['$where', 'Matches documents that satisfy a JavaScript expression.',
        "db.myCollection.find( { active: true, $where: \"this.credits - this.debits < 0\" } );\ndb.myCollection.find( { active: true, $where: function() { return obj.credits - obj.debits < 0; } } );"
    ],
    //Geospatial
    ['$geoWithin', '(New in version 2.4) Selects geometries within a bounding GeoJSON geometry. The 2dsphere and 2d indexes support $geoWithin.',
        "db.places.find({\n     loc: {\n       $geoWithin: {\n          $geometry: {\n             type : \"Polygon\" ,\n             coordinates: [ [ [ 0, 0 ], [ 3, 6 ], [ 6, 1 ], [ 0, 0 ] ] ]\n          }\n       }\n     }\n   })", '{$0}'],
    ['$geoIntersects', '(New in version 2.4) Selects geometries that intersect with a GeoJSON geometry. The 2dsphere index supports $geoIntersects.',
        "db.places.find({\n     loc: {\n       $geoIntersects: {\n          $geometry: {\n             type: \"Polygon\" ,\n             coordinates: [\n               [ [ 0, 0 ], [ 3, 6 ], [ 6, 1 ], [ 0, 0 ] ]\n             ]\n          }\n       }\n     }\n   })", '{$0}'],
    ['$near', 'Returns geospatial objects in proximity to a point. Requires a geospatial index. The 2dsphere and 2d indexes support $near.',
        "db.places.find({\n     location:\n       { $near :\n          {\n            $geometry: { type: \"Point\",  coordinates: [ -73.9667, 40.78 ] },\n            $minDistance: 1000,\n            $maxDistance: 5000\n          }\n       }\n   })", '{$0}'],
    ['$nearSphere', 'Returns geospatial objects in proximity to a point on a sphere. Requires a geospatial index. The 2dsphere and 2d indexes support $nearSphere.',
        "db.places.find({\n     location: {\n        $nearSphere: {\n           $geometry: {\n              type : \"Point\",\n              coordinates : [ -73.9667, 40.78 ]\n           },\n           $minDistance: 1000,\n           $maxDistance: 5000\n        }\n     }\n   })", '{$0}'],
    ['$geometry', '(New in version 2.4) The $geometry operator specifies a GeoJSON geometry for use with the following geospatial query operators: $geoWithin, $geoIntersects, $near, and $nearSphere. $geometry uses EPSG:4326 as the default coordinate reference system (CRS).',
        "db.places.find(\n   {\n     location:\n       { $near :\n          {\n            $geometry: { type: \"Point\",  coordinates: [ -73.9667, 40.78 ] },\n            $minDistance: 1000,\n            $maxDistance: 5000\n          }\n       }\n   }\n)", "{ type: \"$0\", coordinates: [] }"],
    ['$minDistance', '(New in version 2.6) Filters the results of a geospatial $near or $nearSphere query to those documents that are at least the specified distance from the center point.',
        "db.places.find({\n     location:\n       { $near :\n          {\n            $geometry: { type: \"Point\",  coordinates: [ -73.9667, 40.78 ] },\n            $minDistance: 1000,\n            $maxDistance: 5000\n          }\n       }\n   })"],
    ['$maxDistance', 'The $maxDistance operator constrains the results of a geospatial $near or $nearSphere query to the specified distance. The measuring units for the maximum distance are determined by the coordinate system in use. For GeoJSON point object, specify the distance in meters, not tradians.',
        "db.places.find( {\n   loc: { $near: [ 100 , 100 ],  $maxDistance: 10 }\n} )"],
    ['$center', '(New in version 1.4) The $center operator specifies a circle for a $geoWithin query. The query returns legacy coordinate pairs that are within the bounds of the circle. The operator does not return GeoJSON objects.',
        "db.places.find(\n   { loc: { $geoWithin: { $center: [ [-74, 40.74], 10 ] } } }\n)", '[ [ $1, $2 ] , $3 ]'],
    ['$centerSphere', '(New in version 1.8) Defines a circle for a geospatial query that uses spherical geometry. The query returns documents that are within the bounds of the circle. You can use the $centerSphere operator on both GeoJSON objects and legacy coordinate pairs.',
        "db.places.find( {\n  loc: { $geoWithin: { $centerSphere: [ [ -88, 30 ], 10/3963.2 ] } }\n} )", '[ [ $1, $2 ] , $3 ]'],
    ['$box', 'Specifies a rectangle for a geospatial $geoWithin query to return documents that are within the bounds of the rectangle, according to their point-based location data. When used with the $box operator, $geoWithin returns documents based on grid coordinates and does not query for GeoJSON shapes.',
        "", '[ [ $1, $2 ], [ $3, $4 ] ]'],
    ['$polygon', '(New in version 1.9) Specifies a polygon for a geospatial $geoWithin query on legacy coordinate pairs. The query returns pairs that are within the bounds of the polygon. The operator does not query for GeoJSON objects.',
        "db.places.find(\n  {\n     loc: {\n       $geoWithin: { $polygon: [ [ 0 , 0 ], [ 3 , 6 ], [ 6 , 0 ] ] }\n     }\n  }\n)", '[ [ $1 , $2 ] ]'],
    //$uniqueDocs Deprecated since version 2.6: Geospatial queries no longer return duplicate results. The $uniqueDocs operator has no impact on results.
    ['$uniqueDocs', 'Deprecated since version 2.6: Geospatial queries no longer return duplicate results. The $uniqueDocs operator has no impact on results', ''],
    //Array
    ['$all', 'Matches arrays that contain all elements specified in the query.', 'db.inventory.find( { tags: { $all: [ "appliance", "school", "book" ] } } )', '[$0]'],
    ['$elemMatch', 'Selects documents if element in the array field matches all the specified $elemMatch conditions.',
        "db.scores.find(\n   { results: { $elemMatch: { $gte: 80, $lt: 85 } } }\n)", '{$0}'],
    ['$size', 'Selects documents if the array field is a specified size.', 'db.collection.find( { field: { $size: 2 } } );'],
    //Comments
    ['$comment', 'Adds a comment to a query predicate.',
        "db.records.find(\n   {\n     x: { $mod: [ 2, 0 ] },\n     $comment: \"Find even values.\"\n   }\n)", '"$1"'],
];
//category projection
var projectionOperator = [
    //Projection Operators
    //['$',	'Projects the first element in an array that matches the query condition.'],
    ['$slice', 'Limits the number of elements projected from an array. Supports skip and limit slices.',
        "db.posts.find( {}, { comments: { $slice: 5 } } );\ndb.posts.find( {}, { comments: { $slice: -5 } } );\ndb.posts.find( {}, { comments: { $slice: [ 20, 10 ] } } )", ''],
    ['$elemMatch', '(New in version 2.2) Projects the first element in an array that matches the specified $elemMatch condition.',
        "db.schools.find( { zipcode: \"63109\" },\n                 { students: { $elemMatch: { school: 102 } } } )", '{$1}'],
    ['$meta', '(New in version 2.6) Projects the document’s score assigned during $text operation.',
        "db.collection.find(\n   <query>,\n   { score: { $meta: \"textScore\" } }\n).sort( { score: { $meta: \"textScore\" } } )", '"${1:textScore}"'],
];
//category : update
//Update Operators
//The following modifiers are available for use in update operations; e.g. in db.collection.update() and db.collection.findAndModify().
var updateOperators = [
    //Fields
    ['$inc', 'Increments the value of the field by the specified amount.',
        "db.products.update(\n   { sku: \"abc123\" },\n   { $inc: { quantity: -2, \"metrics.orders\": 1 } }\n)", '{$0}'],
    ['$mul', '(New in version 2.6) Multiplies the value of the field by the specified amount.',
        "db.products.update(\n   { _id: 1 },\n   { $mul: { price: 1.25 } }\n)", '{$0}'],
    ['$rename', 'Renames a field.',
        "db.students.update( { _id: 1 }, { $rename: { \"name.first\": \"name.fname\" } } )", '{$1}'],
    ['$set', 'Sets the value of a field in a document.',
        "db.products.update(\n   { _id: 100 },\n   { $set: { \"details.make\": \"zzz\" } }\n)", '{$0}'],
    ['$setOnInsert', '(New in version 2.4) Sets the value of a field if an update results in an insert of a document. Has no effect on update operations that modify existing documents.',
        "db.products.update(\n  { _id: 1 },\n  {\n     $set: { item: \"apple\" },\n     $setOnInsert: { defaultQty: 100 }\n  },\n  { upsert: true }\n)", '{$0}'],
    ['$unset', 'Removes the specified field from a document.',
        "db.products.update(\n   { sku: \"unknown\" },\n   { $unset: { quantity: \"\", instock: \"\" } }\n)", '{$0: "" }'],
    ['$min', 'Only updates the field if the specified value is less than the existing field value.', 'db.scores.update( { _id: 1 }, { $min: { lowScore: 150 } } )', '{$0}'],
    ['$max', 'Only updates the field if the specified value is greater than the existing field value.', 'db.scores.update( { _id: 1 }, { $max: { highScore: 870 } } )', '{$0}'],
    ['$currentDate', 'Sets the value of a field to current date, either as a Date or a Timestamp.',
        "db.users.update({ _id: 1 },\n   {\n     $currentDate: {\n        lastModified: true,\n        \"cancellation.date\": { $type: \"timestamp\" }\n     },\n     $set: {\n        status: \"D\",\n        \"cancellation.reason\": \"user request\"\n     }\n   })", '{$1}'],
    //Array
    //['$', 'Acts as a placeholder to update the first element that matches the query condition in an update.'],
    ['$addToSet', 'Adds elements to an array only if they do not already exist in the set.',
        "db.inventory.update(\n   { _id: 2 },\n   { $addToSet: { tags: { $each: [ \"camera\", \"electronics\", \"accessories\" ] } } }\n )", '{$1}'],
    ['$pop', 'Removes the first or last item of an array.', 'db.students.update( { _id: 1 }, { $pop: { scores: 1 } } )', '{$1}'],
    ['$pull', 'Removes all array elements that match a specified query.', 'db.profiles.update( { _id: 1 }, { $pull: { votes: { $gte: 6 } } } )', '{$1}'],
    ['$pullAll', 'Removes all matching values from an array.', 'db.survey.update( { _id: 1 }, { $pullAll: { scores: [ 0, 5 ] } } )', '{$1}'],
    ['$push', 'Adds an item to an array.',
        "db.students.update(\n   { name: \"joe\" },\n   { $push: { scores: { $each: [ 90, 92, 85 ] } } }\n)", '{$1}'],
    ['$pushAll', 'Deprecated since version 2.4: Use the $push operator with $each instead.'],
    //Modifiers
    ['$each', 'Modifies the $push and $addToSet operators to append multiple items for array updates.',
        "db.students.update(\n   { name: \"joe\" },\n   { $push: { scores: { $each: [ 90, 92, 85 ] } } }\n)", '[$1]'],
    ['$slice', '(New in version 2.4) Modifies the $push operator to limit the size of updated arrays.',
        "db.students.update({ _id: 1 },\n   {\n     $push: {\n       scores: {\n         $each: [ 80, 78, 86 ],\n         $slice: -5\n       }\n     }\n   })", ' '],
    ['$sort', '(New in version 2.4) Modifies the $push operator to reorder documents stored in an array.',
        "db.students.update(\n   { _id: 2 },\n   { $push: { tests: { $each: [ 40, 60 ], $sort: 1 } } }\n)", '1'],
    ['$position', '(New in version 2.6) Modifies the $push operator to specify the position in the array to add elements.',
        "db.students.update({ _id: 1 },\n   {\n     $push: {\n        scores: {\n           $each: [ 50, 60, 70 ],\n           $position: 0\n        }\n     }\n   })"],
    //Bitwise
    ['$bit', 'Performs bitwise AND, OR, and XOR updates of integer values.',
        "db.switches.update(\n   { _id: 1 },\n   { $bit: { expdata: { and: NumberInt(10) } } }\n)", '{$1}'],
    //Isolation
    ['$isolated', 'Modifies the behavior of a write operation to increase the isolation of the operation.',
        "db.foo.update(\n    { status : \"A\" , $isolated : 1 },\n    { $inc : { count : 1 } },\n    { multi: true }\n)", '1'],
];
//category: aggregation
//Aggregation Pipeline Operators
//Pipeline stages appear in an array. Documents pass through the stages in sequence.
var aggregationOperators = [
    ['$project', 'Reshapes each document in the stream, such as by adding new fields or removing existing fields. For each input document, outputs one document.', 'db.books.aggregate( [ { $project : { _id: 0, title : 1 , author : 1 } } ] )', '{$1}'],
    ['$match', 'Filters the document stream to allow only matching documents to pass unmodified into the next pipeline stage. $match uses standard MongoDB queries. For each input document, outputs either one document (a match) or zero documents (no match).',
        "db.articles.aggregate( [\n                        { $match : { score : { $gt : 70, $lte : 90 } } },\n                        { $group: { _id: null, count: { $sum: 1 } } }\n                       ] );", '{$1}'],
    ['$redact', '(New in version 2.6) Reshapes each document in the stream by restricting the content for each document based on information stored in the documents themselves. Incorporates the functionality of $project and $match. Can be used to implement field level redaction. For each input document, outputs either one or zero document.',
        "var userAccess = [ \"STLW\", \"G\" ];\ndb.forecasts.aggregate([\n     { $match: { year: 2014 } },\n     { $redact: {\n        $cond: {\n           if: { $gt: [ { $size: { $setIntersection: [ \"$tags\", userAccess ] } }, 0 ] },\n           then: \"$$DESCEND\",\n           else: \"$$PRUNE\"\n         }\n       }\n     }]);", '{$1}'],
    ['$limit', 'Passes the first n documents unmodified to the pipeline where n is the specified limit. For each input document, outputs either one document (for the first n documents) or zero documents (after the first n documents).',
        "db.article.aggregate(\n    { $limit : 5 }\n);"],
    ['$skip', 'Skips the first n documents where n is the specified skip number and passes the remaining documents unmodified to the pipeline. For each input document, outputs either zero documents (for the first n documents) or one document (if after the first n documents).',
        "db.article.aggregate(\n    { $skip : 5 }\n);"],
    ['$unwind', 'Deconstructs an array field from the input documents to output a document for each element. Each output document replaces the array with an element value. For each input document, outputs n documents where n is the number of array elements and can be zero for an empty array.',
        "db.inventory.aggregate( [ { $unwind : \"$sizes\" } ] )"],
    ['$group', 'Groups input documents by a specified identifier expression and applies the accumulator expression(s), if specified, to each group. Consumes all input documents and outputs one document per each distinct group. The output documents only contain the identifier field and, if specified, accumulated fields.',
        "db.sales.aggregate([\n      {\n        $group : {\n           _id : { month: { $month: \"$date\" }, day: { $dayOfMonth: \"$date\" }, year: { $year: \"$date\" } },\n           totalPrice: { $sum: { $multiply: [ \"$price\", \"$quantity\" ] } },\n           averageQuantity: { $avg: \"$quantity\" },\n           count: { $sum: 1 }\n        }\n      }])", '{$1}'],
    ['$sort', 'Reorders the document stream by a specified sort key. Only the order changes; the documents remain unmodified. For each input document, outputs one document.',
        "db.users.aggregate(\n   [\n     { $sort : { age : -1, posts: 1 } }\n   ]\n)", '{$1}'],
    ['$geoNear', '(New in version 2.4) Returns an ordered stream of documents based on the proximity to a geospatial point. Incorporates the functionality of $match, $sort, and $limit for geospatial data. The output documents include an additional distance field and can include a location identifier field.',
        "db.places.aggregate([{\n     $geoNear: {\n        near: { type: \"Point\", coordinates: [ -73.99279 , 40.719296 ] },\n        distanceField: \"dist.calculated\",\n        maxDistance: 2,\n        query: { type: \"public\" },\n        includeLocs: \"dist.location\",\n        num: 5,\n        spherical: true\n     }\n}])", '{$1}'],
    ['$out', '(New in version 2.6) Writes the resulting documents of the aggregation pipeline to a collection. To use the $out stage, it must be the last stage in the pipeline.',
        "db.books.aggregate( [\n                      { $group : { _id : \"$author\", books: { $push: \"$title\" } } },\n                      { $out : \"authors\" }\n                  ] )"],
    //Expression Operators
    //Boolean Operators
    //Boolean expressions evaluate their argument expressions as booleans and return a boolean as the result.'],
    ['$and', 'Returns true only when all its expressions evaluate to true. Accepts any number of argument expressions.',
        "db.inventory.aggregate(\n   [\n     {\n       $project:\n          {\n            item: 1,\n            qty: 1,\n            result: { $and: [ { $gt: [ \"$qty\", 100 ] }, { $lt: [ \"$qty\", 250 ] } ] }\n          }\n     }\n   ]\n)", '[$1]'],
    ['$or', 'Returns true when any of its expressions evaluates to true. Accepts any number of argument expressions.',
        "db.inventory.aggregate(\n   [\n     {\n       $project:\n          {\n            item: 1,\n            result: { $or: [ { $gt: [ \"$qty\", 250 ] }, { $lt: [ \"$qty\", 200 ] } ] }\n          }\n     }\n   ]\n)", '[$1]'],
    ['$not', 'Returns the boolean value that is the opposite of its argument expression. Accepts a single argument expression.',
        "db.inventory.aggregate(\n   [\n     {\n       $project:\n          {\n            item: 1,\n            result: { $not: [ { $gt: [ \"$qty\", 250 ] } ] }\n          }\n     }\n   ]\n)", '[$1]'],
    // Set Operators
    // Set expressions performs set operation on arrays, treating arrays as sets. Set expressions ignores the duplicate entries in each input array and the order of the elements.'],
    ['$setEquals', '(New in version 2.6) Returns true if the input sets have the same distinct elements. Accepts two or more argument expressions.',
        "db.experiments.aggregate(\n   [\n     { $project: { A: 1, B: 1, sameElements: { $setEquals: [ \"$A\", \"$B\" ] }, _id: 0 } }\n   ]\n)", '["$1","$2"]'],
    ['$setIntersection', '(New in version 2.6) Returns a set with elements that appear in all of the input sets. Accepts any number of argument expressions.',
        "db.experiments.aggregate(\n   [\n     { $project: { A: 1, B: 1, commonToBoth: { $setIntersection: [ \"$A\", \"$B\" ] }, _id: 0 } }\n   ]\n)", '[$1]'],
    ['$setUnion', '(New in version 2.6) Returns a set with elements that appear in any of the input sets. Accepts any number of argument expressions.',
        "db.experiments.aggregate(\n   [\n     { $project: { A:1, B: 1, allValues: { $setUnion: [ \"$A\", \"$B\" ] }, _id: 0 } }\n   ]\n)", '[$1]'],
    ['$setDifference', '(New in version 2.6) Returns a set with elements that appear in the first set but not in the second set; i.e. performs a relative complement of the second set relative to the first. Accepts exactly two argument expressions.',
        "db.experiments.aggregate(\n   [\n     { $project: { A: 1, B: 1, inBOnly: { $setDifference: [ \"$B\", \"$A\" ] }, _id: 0 } }\n   ]\n)", '[$1]'],
    ['$setIsSubset', '(New in version 2.6) Returns true if all elements of the first set appear in the second set, including when the first set equals the second set; i.e. not a strict subset. Accepts exactly two argument expressions.',
        "db.experiments.aggregate(\n   [\n     { $project: { A:1, B: 1, AisSubset: { $setIsSubset: [ \"$A\", \"$B\" ] }, _id:0 } }\n   ]\n)", '[$1]'],
    ['$anyElementTrue', '(New in version 2.6) Returns true if any elements of a set evaluate to true; otherwise, returns false. Accepts a single argument expression.',
        "db.survey.aggregate(\n   [\n     { $project: { responses: 1, isAnyTrue: { $anyElementTrue: [ \"$responses\" ] }, _id: 0 } }\n   ]\n)", '[$1]'],
    ['$allElementsTrue', '(New in version 2.6) Returns true if no element of a set evaluates to false, otherwise, returns false. Accepts a single argument expression.',
        "db.survey.aggregate(\n   [\n     { $project: { responses: 1, isAllTrue: { $allElementsTrue: [ \"$responses\" ] }, _id: 0 } }\n   ]\n)", '[$1]'],
    // Comparison Operators
    // Comparison expressions return a boolean except for $cmp which returns a number.'],
    // The comparison expressions take two argument expressions and compare both value and type, using the specified BSON comparison order for values of different types.'],
    ['$cmp', 'Returns: 0 if the two values are equivalent, 1 if the first value is greater than the second, and -1 if the first value is less than the second.',
        "db.inventory.aggregate(\n   [\n     {\n       $project:\n          {\n            item: 1,\n            qty: 1,\n            cmpTo250: { $cmp: [ \"$qty\", 250 ] },\n            _id: 0\n          }\n     }\n   ]\n)", '["$1",$2]'],
    ['$eq', 'Returns true if the values are equivalent.',
        "db.inventory.aggregate(\n   [\n     {\n       $project:\n          {\n            item: 1,\n            qty: 1,\n            qtyEq250: { $eq: [ \"$qty\", 250 ] },\n            _id: 0\n          }\n     }\n   ]\n)", '["$1",$2]'],
    ['$gt', 'Returns true if the first value is greater than the second.',
        "db.inventory.aggregate(\n   [\n     {\n       $project:\n          {\n            item: 1,\n            qty: 1,\n            qtyGt250: { $gt: [ \"$qty\", 250 ] },\n            _id: 0\n          }\n     }\n   ]\n)", '["$1",$2]'],
    ['$gte', 'Returns true if the first value is greater than or equal to the second.',
        "db.inventory.aggregate(\n   [\n     {\n       $project:\n          {\n            item: 1,\n            qty: 1,\n            qtyGte250: { $gte: [ \"$qty\", 250 ] },\n            _id: 0\n          }\n     }\n   ]\n)", '["$1",$2]'],
    ['$lt', 'Returns true if the first value is less than the second.',
        "db.inventory.aggregate(\n   [\n     {\n       $project:\n          {\n            item: 1,\n            qty: 1,\n            qtyLt250: { $lt: [ \"$qty\", 250 ] },\n            _id: 0\n          }\n     }\n   ]\n)", '["$1",$2]'],
    ['$lte', 'Returns true if the first value is less than or equal to the second.',
        "db.inventory.aggregate(\n   [\n     {\n       $project:\n          {\n            item: 1,\n            qty: 1,\n            qtyLte250: { $lte: [ \"$qty\", 250 ] },\n            _id: 0\n          }\n     }\n   ]\n)", '["$1",$2]'],
    ['$ne', 'Returns true if the values are not equivalent.',
        "db.inventory.aggregate(\n   [\n     {\n       $project:\n          {\n            item: 1,\n            qty: 1,\n            qtyNe250: { $ne: [ \"$qty\", 250 ] },\n            _id: 0\n          }\n     }\n   ]\n)", '["$1",$2]'],
    // Arithmetic Operators
    // Arithmetic expressions perform mathematic operations on numbers. Some arithmetic expressions can also support date arithmetic.'],
    ['$add', 'Adds numbers to return the sum, or adds numbers and a date to return a new date. If adding numbers and a date, treats the numbers as milliseconds. Accepts any number of argument expressions, but at most, one expression can resolve to a date.',
        "db.sales.aggregate(\n   [\n     { $project: { item: 1, billing_date: { $add: [ \"$date\", 3*24*60*60000 ] } } }\n   ]\n)", '["$1",$2]'],
    ['$subtract', 'Returns the result of subtracting the second value from the first. If the two values are numbers, return the difference. If the two values are dates, return the difference in milliseconds. If the two values are a date and a number in milliseconds, return the resulting date. Accepts two argument expressions. If the two values are a date and a number, specify the date argument first as it is not meaningful to subtract a date from a number.',
        "db.sales.aggregate( [ { $project: { item: 1, dateDifference: { $subtract: [ new Date(), \"$date\" ] } } } ] )", '["$1",$2]'],
    ['$multiply', 'Multiplies numbers to return the product. Accepts any number of argument expressions.',
        "db.sales.aggregate(\n   [\n     { $project: { date: 1, item: 1, total: { $multiply: [ \"$price\", \"$quantity\" ] } } }\n   ]\n)", '["$1", $2]'],
    ['$divide', 'Returns the result of dividing the first number by the second. Accepts two argument expressions.',
        "db.planning.aggregate(\n   [\n     { $project: { name: 1, workdays: { $divide: [ \"$hours\", 8 ] } } }\n   ]\n)", '["$1", $2]'],
    ['$mod', 'Returns the remainder of the first number divided by the second. Accepts two argument expressions.',
        "db.planning.aggregate(\n   [\n     { $project: { remainder: { $mod: [ \"$hours\", \"$tasks\" ] } } }\n   ]\n)", '["$1", $2]'],
    // String Operators
    // String expressions, with the exception of $concat, only have a well-defined behavior for strings of ASCII characters.'],
    //$concat behavior is well-defined regardless of the characters used.'],
    ['$concat', 'New in version 2.4. Concatenates any number of strings.',
        "db.inventory.aggregate(\n   [\n      { $project: { itemDescription: { $concat: [ \"$item\", \" - \", \"$description\" ] } } }\n   ]\n)", '["$1", $2]'],
    ['$substr', 'Returns a substring of a string, starting at a specified index position up to a specified length. Accepts three expressions as arguments: the first argument must resolve to a string, and the second and third arguments must resolve to integers.',
        "db.inventory.aggregate(\n   [\n     {\n       $project:\n          {\n            item: 1,\n            yearSubstring: { $substr: [ \"$quarter\", 0, 2 ] },\n            quarterSubtring: { $substr: [ \"$quarter\", 2, -1 ] }\n          }\n      }\n   ]\n)", '["$1", $2, $3]'],
    ['$toLower', 'Converts a string to lowercase. Accepts a single argument expression.',
        "db.inventory.aggregate(\n   [\n     {\n       $project:\n         {\n           item: { $toLower: \"$item\" },\n           description: { $toLower: \"$description\" }\n         }\n     }\n   ]\n)", '"$1"'],
    ['$toUpper', 'Converts a string to uppercase. Accepts a single argument expression.',
        "db.inventory.aggregate(\n   [\n     {\n       $project:\n         {\n           item: { $toUpper: \"$item\" },\n           description: { $toUpper: \"$description\" }\n         }\n     }\n   ]\n)", "$1"],
    ['$strcasecmp', 'Performs case-insensitive string comparison and returns: 0 if two strings are equivalent, 1 if the first string is greater than the second, and -1 if the first string is less than the second.',
        "db.inventory.aggregate(\n   [\n     {\n       $project:\n          {\n            item: 1,\n            comparisonResult: { $strcasecmp: [ \"$quarter\", \"13q4\" ] }\n          }\n      }\n   ]\n)", '["$1",$2]'],
    //Text Search Operators
    ['$meta', 'New in version 2.6. Access text search metadata.',
        "db.articles.aggregate(\n   [\n     { $match: { $text: { $search: \"cake\" } } },\n     { $group: { _id: { $meta: \"textScore\" }, count: { $sum: 1 } } }\n   ]\n)", '"$1"'],
    //Array Operators
    ['$size', 'New in version 2.6. Returns the number of elements in the array. Accepts a single expression as argument.',
        "db.inventory.aggregate(\n   [\n      {\n         $project: {\n            item: 1,\n            numberOfColors: { $size: \"$colors\" }\n         }\n      }\n   ]\n)", '"$1"'],
    //Variable Operators
    ['$map', 'Applies a subexpression to each element of an array and returns the array of resulting values in order. Accepts named parameters.',
        "db.grades.aggregate(\n   [\n      { $project:\n         { adjustedGrades:\n            {\n              $map:\n                 {\n                   input: \"$quizzes\",\n                   as: \"grade\",\n                   in: { $add: [ \"$$grade\", 2 ] }\n                 }\n            }\n         }\n      }\n   ]\n)", '{$1}'],
    ['$let', 'Defines variables for use within the scope of a subexpression and returns the result of the subexpression. Accepts named parameters.',
        "db.sales.aggregate( [\n   {\n      $project: {\n         finalTotal: {\n            $let: {\n               vars: {\n                  total: { $add: [ '$price', '$tax' ] },\n                  discounted: { $cond: { if: '$applyDiscount', then: 0.9, else: 1 } }\n               },\n               in: { $multiply: [ \"$$total\", \"$$discounted\" ] }\n            }\n         }\n      }\n   }\n] )", '{$1}'],
    //Literal Operators
    ['$literal', 'Return a value without parsing. Use for values that the aggregation pipeline may interpret as an expression. For example, use a $literal expression to a string that starts with a $ to avoid parsing as a field path.',
        "db.records.aggregate( [\n   { $project: { costsOneDollar: { $eq: [ \"$price\", { $literal: \"$1\" } ] } } }\n] )"],
    //Date Operators
    ['$dayOfYear', 'Returns the day of the year for a date as a number between 1 and 366 (leap year).',
        "db.sales.aggregate([{\n       $project:\n         {\n           year: { $year: \"$date\" },\n           month: { $month: \"$date\" },\n           day: { $dayOfMonth: \"$date\" },\n           hour: { $hour: \"$date\" },\n           minutes: { $minute: \"$date\" },\n           seconds: { $second: \"$date\" },\n           milliseconds: { $millisecond: \"$date\" },\n           dayOfYear: { $dayOfYear: \"$date\" },\n           dayOfWeek: { $dayOfWeek: \"$date\" },\n           week: { $week: \"$date\" }\n         }\n     }])", '"$1"'],
    ['$dayOfMonth', 'Returns the day of the month for a date as a number between 1 and 31.',
        "db.sales.aggregate([{\n       $project:\n         {\n           year: { $year: \"$date\" },\n           month: { $month: \"$date\" },\n           day: { $dayOfMonth: \"$date\" },\n           hour: { $hour: \"$date\" },\n           minutes: { $minute: \"$date\" },\n           seconds: { $second: \"$date\" },\n           milliseconds: { $millisecond: \"$date\" },\n           dayOfYear: { $dayOfYear: \"$date\" },\n           dayOfWeek: { $dayOfWeek: \"$date\" },\n           week: { $week: \"$date\" }\n         }\n     }])", '"$1"'],
    ['$dayOfWeek', 'Returns the day of the week for a date as a number between 1 (Sunday) and 7 (Saturday).',
        "db.sales.aggregate([{\n       $project:\n         {\n           year: { $year: \"$date\" },\n           month: { $month: \"$date\" },\n           day: { $dayOfMonth: \"$date\" },\n           hour: { $hour: \"$date\" },\n           minutes: { $minute: \"$date\" },\n           seconds: { $second: \"$date\" },\n           milliseconds: { $millisecond: \"$date\" },\n           dayOfYear: { $dayOfYear: \"$date\" },\n           dayOfWeek: { $dayOfWeek: \"$date\" },\n           week: { $week: \"$date\" }\n         }\n     }])", '"$1"'],
    ['$year', 'Returns the year for a date as a number (e.g. 2014).',
        "db.sales.aggregate([{\n       $project:\n         {\n           year: { $year: \"$date\" },\n           month: { $month: \"$date\" },\n           day: { $dayOfMonth: \"$date\" },\n           hour: { $hour: \"$date\" },\n           minutes: { $minute: \"$date\" },\n           seconds: { $second: \"$date\" },\n           milliseconds: { $millisecond: \"$date\" },\n           dayOfYear: { $dayOfYear: \"$date\" },\n           dayOfWeek: { $dayOfWeek: \"$date\" },\n           week: { $week: \"$date\" }\n         }\n     }])", '"$1"'],
    ['$month', 'Returns the month for a date as a number between 1 (January) and 12 (December).',
        "db.sales.aggregate([{\n       $project:\n         {\n           year: { $year: \"$date\" },\n           month: { $month: \"$date\" },\n           day: { $dayOfMonth: \"$date\" },\n           hour: { $hour: \"$date\" },\n           minutes: { $minute: \"$date\" },\n           seconds: { $second: \"$date\" },\n           milliseconds: { $millisecond: \"$date\" },\n           dayOfYear: { $dayOfYear: \"$date\" },\n           dayOfWeek: { $dayOfWeek: \"$date\" },\n           week: { $week: \"$date\" }\n         }\n     }])", '"$1"'],
    ['$week', 'Returns the week number for a date as a number between 0 (the partial week that precedes the first Sunday of the year) and 53 (leap year).',
        "db.sales.aggregate([{\n       $project:\n         {\n           year: { $year: \"$date\" },\n           month: { $month: \"$date\" },\n           day: { $dayOfMonth: \"$date\" },\n           hour: { $hour: \"$date\" },\n           minutes: { $minute: \"$date\" },\n           seconds: { $second: \"$date\" },\n           milliseconds: { $millisecond: \"$date\" },\n           dayOfYear: { $dayOfYear: \"$date\" },\n           dayOfWeek: { $dayOfWeek: \"$date\" },\n           week: { $week: \"$date\" }\n         }\n     }])", '"$1"'],
    ['$hour', 'Returns the hour for a date as a number between 0 and 23.',
        "db.sales.aggregate([{\n       $project:\n         {\n           year: { $year: \"$date\" },\n           month: { $month: \"$date\" },\n           day: { $dayOfMonth: \"$date\" },\n           hour: { $hour: \"$date\" },\n           minutes: { $minute: \"$date\" },\n           seconds: { $second: \"$date\" },\n           milliseconds: { $millisecond: \"$date\" },\n           dayOfYear: { $dayOfYear: \"$date\" },\n           dayOfWeek: { $dayOfWeek: \"$date\" },\n           week: { $week: \"$date\" }\n         }\n     }])", '"$1"'],
    ['$minute', 'Returns the minute for a date as a number between 0 and 59.',
        "db.sales.aggregate([{\n       $project:\n         {\n           year: { $year: \"$date\" },\n           month: { $month: \"$date\" },\n           day: { $dayOfMonth: \"$date\" },\n           hour: { $hour: \"$date\" },\n           minutes: { $minute: \"$date\" },\n           seconds: { $second: \"$date\" },\n           milliseconds: { $millisecond: \"$date\" },\n           dayOfYear: { $dayOfYear: \"$date\" },\n           dayOfWeek: { $dayOfWeek: \"$date\" },\n           week: { $week: \"$date\" }\n         }\n     }])", '"$1"'],
    ['$second', 'Returns the seconds for a date as a number between 0 and 60 (leap seconds).',
        "db.sales.aggregate([{\n       $project:\n         {\n           year: { $year: \"$date\" },\n           month: { $month: \"$date\" },\n           day: { $dayOfMonth: \"$date\" },\n           hour: { $hour: \"$date\" },\n           minutes: { $minute: \"$date\" },\n           seconds: { $second: \"$date\" },\n           milliseconds: { $millisecond: \"$date\" },\n           dayOfYear: { $dayOfYear: \"$date\" },\n           dayOfWeek: { $dayOfWeek: \"$date\" },\n           week: { $week: \"$date\" }\n         }\n     }])", '"$1"'],
    ['$millisecond', 'Returns the milliseconds of a date as a number between 0 and 999.',
        "db.sales.aggregate([{\n       $project:\n         {\n           year: { $year: \"$date\" },\n           month: { $month: \"$date\" },\n           day: { $dayOfMonth: \"$date\" },\n           hour: { $hour: \"$date\" },\n           minutes: { $minute: \"$date\" },\n           seconds: { $second: \"$date\" },\n           milliseconds: { $millisecond: \"$date\" },\n           dayOfYear: { $dayOfYear: \"$date\" },\n           dayOfWeek: { $dayOfWeek: \"$date\" },\n           week: { $week: \"$date\" }\n         }\n     }])", '"$1"'],
    ['$dateToString', 'New in version 3.0. Returns the date as a formatted string.',
        "db.sales.aggregate([\n     {\n       $project: {\n          yearMonthDay: { $dateToString: { format: \"%Y-%m-%d\", date: \"$date\" } },\n          time: { $dateToString: { format: \"%H:%M:%S:%L\", date: \"$date\" } }\n       }\n     }\n   ])", '{ format: "$1%Y-%m-%d", date: "\\$date" }'],
    //Conditional Expressions
    ['$cond', 'New in version 2.6. A ternary operator that evaluates one expression, and depending on the result, returns the value of one of the other two expressions. Accepts either three expressions in an ordered list or three named parameters.',
        "db.inventory.aggregate([{\n         $project:\n           {\n             item: 1,\n             discount:\n               {\n                 $cond: { if: { $gte: [ \"$qty\", 250 ] }, then: 30, else: 20 }\n               }\n           }\n      }])", '{ if: { $1 }, then: $2, else: $3 }'],
    ['$ifNull', 'Returns either the non-null result of the first expression or the result of the second expression if the first expression results in a null result. Null result encompasses instances of undefined values or missing fields. Accepts two expressions as arguments. The result of the second expression can be null.',
        "db.inventory.aggregate(\n   [\n      {\n         $project: {\n            item: 1,\n            description: { $ifNull: [ \"$description\", \"Unspecified\" ] }\n         }\n      }\n   ]\n)", '[ "$1", "$2" ]'],
    //Accumulators
    //Accumulators, available only for the $group stage, compute values by combining documents that share the same group key. Accumulators take as input a single expression, evaluating the expression once for each input document, and maintain their state for the group of documents.'],
    ['$sum', 'Returns a sum for each group. Ignores non-numeric values.',
        "db.sales.aggregate([\n     {\n       $group:\n         {\n           _id: { day: { $dayOfYear: \"$date\"}, year: { $year: \"$date\" } },\n           totalAmount: { $sum: { $multiply: [ \"$price\", \"$quantity\" ] } },\n           count: { $sum: 1 }\n         }\n     }\n   ])", '{$1}'],
    ['$avg', 'Returns an average for each group. Ignores non-numeric values.',
        "db.sales.aggregate([\n     {\n       $group:\n         {\n           _id: \"$item\",\n           avgAmount: { $avg: { $multiply: [ \"$price\", \"$quantity\" ] } },\n           avgQuantity: { $avg: \"$quantity\" }\n         }\n     }\n   ])", '{$1}'],
    ['$first', 'Returns a value from the first document for each group. Order is only defined if the documents are in a defined order.',
        "db.sales.aggregate([\n     { $sort: { item: 1, date: 1 } },\n     {\n       $group:\n         {\n           _id: \"$item\",\n           firstSalesDate: { $first: \"$date\" }\n         }\n     }\n   ])", '"$1"'],
    ['$last', 'Returns a value from the last document for each group. Order is only defined if the documents are in a defined order.',
        "db.sales.aggregate([\n     { $sort: { item: 1, date: 1 } },\n     {\n       $group:\n         {\n           _id: \"$item\",\n           lastSalesDate: { $last: \"$date\" }\n         }\n     }\n   ])", '"$1"'],
    ['$max', 'Returns the highest expression value for each group.',
        "db.sales.aggregate([\n     {\n       $group:\n         {\n           _id: \"$item\",\n           maxTotalAmount: { $max: { $multiply: [ \"$price\", \"$quantity\" ] } },\n           maxQuantity: { $max: \"$quantity\" }\n         }\n     }\n   ])", '{$1}'],
    ['$min', 'Returns the lowest expression value for each group.',
        "db.sales.aggregate([\n     {\n       $group:\n         {\n           _id: \"$item\",\n           minQuantity: { $min: \"$quantity\" }\n         }\n     }\n   ])", '{$1}'],
    ['$push', 'Returns an array of expression values for each group.',
        "db.sales.aggregate([\n     {\n       $group:\n         {\n           _id: { day: { $dayOfYear: \"$date\"}, year: { $year: \"$date\" } },\n           itemsSold: { $push:  { item: \"$item\", quantity: \"$quantity\" } }\n         }\n     }\n   ])", '{$1}'],
    ['$addToSet', 'Returns an array of unique expression values for each group. Order of the array elements is undefined.',
        "db.sales.aggregate([\n     {\n       $group:\n         {\n           _id: { day: { $dayOfYear: \"$date\"}, year: { $year: \"$date\" } },\n           itemsSold: { $addToSet: \"$item\" }\n         }\n     }\n   ])", '{$1}']
];
//Query Modifiers
//category, meta
var metaOperators = [
    //Modifiers
    //Many of these operators have corresponding methods in the shell. These methods provide a straightforward and user-friendly interface and are the preferred way to add these options.
    ['$comment', 'Adds a comment to the query to identify queries in the database profiler output.',
        "db.collection.find( { <query> } )._addSpecial( \"$comment\", <comment> )\ndb.collection.find( { <query> } ).comment( <comment> )\ndb.collection.find( { $query: { <query> }, $comment: <comment> } )", , '"$1"'],
    ['$explain', 'Deprecated since version 3.0: Use db.collection.explain() or cursor.explain() instead. Forces MongoDB to report on query execution plans. ', 'db.collection.find( { $query: {}, $explain: 1 } )',
        "db.collection.find()._addSpecial( \"$explain\", 1 )\ndb.collection.find( { $query: {}, $explain: 1 } )\n//you also can retrieve query plan information through the explain() method:\ndb.collection.find().explain()", "1"],
    ['$hint', 'Forces MongoDB to use a specific index. ',
        "db.users.find().hint( { age: 1 } )\n//This operation returns all documents in the collection named users using the index on the age field.\n\n//You can also specify a hint using either of the following forms:\ndb.users.find()._addSpecial( \"$hint\", { age : 1 } )\ndb.users.find( { $query: {}, $hint: { age : 1 } } )", '{$1}'],
    ['$maxScan', 'Limits the number of documents scanned.',
        "db.collection.find( { <query> } )._addSpecial( \"$maxScan\" , <number> )\ndb.collection.find( { $query: { <query> }, $maxScan: <number> } )"],
    ['$maxTimeMS', 'New in version 2.6. Specifies a cumulative time limit in milliseconds for processing operations on a cursor. ',
        "db.collection.find().maxTimeMS(100)\n//You can also specify the option in either of the following forms:\ndb.collection.find( { $query: { }, $maxTimeMS: 100 } )\ndb.collection.find( { } )._addSpecial(\"$maxTimeMS\", 100)"],
    ['$max', 'Specifies an exclusive upper limit for the index to use in a query. ',
        "db.collection.find( { <query> } ).max( { field1: <max value>, ... fieldN: <max valueN> } )\n//You can also specify $max with either of the two forms:\ndb.collection.find( { <query> } )._addSpecial( \"$max\", { field1: <max value1>, ... fieldN: <max valueN> } )\ndb.collection.find( { $query: { <query> }, $max: { field1: <max value1>, ... fieldN: <max valueN> } } )", '{$1}'],
    ['$min', 'Specifies an inclusive lower limit for the index to use in a query. ',
        "db.collection.find( { <query> } ).min( { field1: <min value>, ... fieldN: <min valueN>} )\n//You can also specify the option with either of the two forms:\ndb.collection.find( { <query> } )._addSpecial( \"$min\", { field1: <min value1>, ... fieldN: <min valueN> } )\ndb.collection.find( { $query: { <query> }, $min: { field1: <min value1>, ... fieldN: <min valueN> } } )", '{$1}'],
    ['$orderby', 'Returns a cursor with documents sorted according to a sort specification. ',
        "db.collection.find().sort( { age: -1 } )\n//You can also specify the option in either of the following forms:\ndb.collection.find()._addSpecial( \"$orderby\", { age : -1 } )\ndb.collection.find( { $query: {}, $orderby: { age : -1 } } )", '{$1}'],
    ['$returnKey', 'Forces the cursor to only return fields included in the index.',
        "db.collection.find( { <query> } )._addSpecial( \"$returnKey\", true )\ndb.collection.find( { $query: { <query> }, $returnKey: true } )", 'true'],
    ['$showDiskLoc', 'Modifies the documents returned to include references to the on-disk location of each document.',
        "db.collection.find().showDiskLoc()\n//You can also specify the $showDiskLoc option in either of the following forms:\ndb.collection.find( { <query> } )._addSpecial(\"$showDiskLoc\" , true)\ndb.collection.find( { $query: { <query> }, $showDiskLoc: true } )", 'true'],
    ['$snapshot', 'Forces the query to use the index on the _id field. ',
        "db.collection.find().snapshot()\n//You can also specify the option in either of the following forms:\ndb.collection.find()._addSpecial( \"$snapshot\", true )\ndb.collection.find( { $query: {}, $snapshot: true } )", 'true'],
    ['$query', 'Wraps a query document.',
        "//The following mongo operations are equivalent, and return only those documents in the collection named collection where the age field equals 25.\ndb.collection.find( { $query: { age : 25 } } )\ndb.collection.find( { age : 25 } )", '{$1}'],
    //Sort Order
    ['$natural', 'A special sort order that orders documents using the order of documents on disk.',
        "//The $natural operator uses the following syntax to return documents in the order they exist on disk:\ndb.collection.find().sort( { $natural: 1 } )", '1']
];
var initMongoOperators = function () {
    addMongoOperators('query', queryOperators);
    addMongoOperators('projection', projectionOperator);
    addMongoOperators('update', updateOperators);
    addMongoOperators('aggregation', aggregationOperators);
    addMongoOperators('meta', metaOperators);
    captionScoreMap = {};
};
initMongoOperators();
module.exports = mongoOperators;
