


function addOp(name: string, comment: string, example:string,snippet?: string) {
}

//Query and Projection Operators
// $gt -> $gt: 
let queryAndProjectionOperators = [
	//Query Selectors
    //Comparison
	['$eq', ' values that are equal to a specified value. The $eq expression is equivalent to { field: <value> }.', 'db.inventory.find( { qty: { $eq: 20 } } )'],
    ['$gt', ' values that are greater than a specified value.','db.inventory.find( { qty: { $gt: 20 } } )'],
	['$gte', ' values that are greater than or equal to a specified value.','db.inventory.find( { qty: { $gte: 20 } } )'],
	['$lt', ' values that are less than a specified value.','db.inventory.find( { qty: { $lt: 20 } } )'],
	['$lte', ' values that are less than or equal to a specified value.','db.inventory.find( { qty: { $lte: 20 } } )'],
	['$ne', ' all values that are not equal to a specified value.','db.inventory.find( { qty: { $ne: 20 } } )'],
	['$in', ' any of the values specified in an array.', 'db.inventory.find( { qty: { $in: [ 5, 15 ] } } )', '[$0]'],
	['$nin', ' none of the values specified in an array.','db.inventory.find( { qty: { $nin: [ 5, 15 ] } } )', '[$0]'],
	
	//Logical
	['$or', 'Joins query clauses with a logical OR returns all documents that match the conditions of either clause.'
		 ,'db.inventory.find( { $or: [ { quantity: { $lt: 20 } }, { price: 10 } ] } )', '[{$0}]'],
	['$and', 'Joins query clauses with a logical AND returns all documents that match the conditions of both clauses.'
		 ,'db.inventory.find( { $and: [ { price: { $ne: 1.99 } }, { price: { $exists: true } } ] } )', '[{$0}]'],
	['$not', 'Inverts the effect of a query expression and returns documents that do not match the query expression.'
		,'db.inventory.find( { price: { $not: { $gt: 1.99 } } } )', '{$0}'],
	['$nor', 'Joins query clauses with a logical NOR returns all documents that fail to match both clauses.'
		,'db.inventory.find( { $nor: [ { price: 1.99 }, { sale: true } ]  } )','[{$0}]'],
	
	//Element
	['$exists', 'Matches documents that have the specified field.','db.inventory.find( { qty: { $exists: true, $nin: [ 5, 15 ] } } )'],
	['$type', 'Selects documents if a field is of the specified type.','db.inventory.find( { tags: { $type : 2 } } ); //type 2 is String'],
	
	//Evaluation
	['$mod', 'Performs a modulo operation on the value of a field and selects documents with a specified result.','db.inventory.find( { qty: { $mod: [ 4, 0 ] } } )','[$0, $1]'],
	['$regex', 'Selects documents where values match a specified regular expression.','db.products.find( { sku: { $regex: /^ABC/i } } )','/$0/'],
	['$text', 'Performs text search.','{ $text: { $search: "leche", $language: "es" } }','{ $search: $0 }'],
	
	['$where', 'Matches documents that satisfy a JavaScript expression.'
		,`db.myCollection.find( { active: true, $where: "this.credits - this.debits < 0" } );
db.myCollection.find( { active: true, $where: function() { return obj.credits - obj.debits < 0; } } );`
		],
	
	//Geospatial
	['$geoWithin', 'Selects geometries within a bounding GeoJSON geometry. The 2dsphere and 2d indexes support $geoWithin.'
,`db.places.find(
   {
     loc: {
       $geoWithin: {
          $geometry: {
             type : "Polygon" ,
             coordinates: [ [ [ 0, 0 ], [ 3, 6 ], [ 6, 1 ], [ 0, 0 ] ] ]
          }
       }
     }
   }
)`,'{$0}'],
	['$geoIntersects', 'Selects geometries that intersect with a GeoJSON geometry. The 2dsphere index supports $geoIntersects.',
`db.places.find(
   {
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
   }
)`,'{$0}'],
	['$near', 'Returns geospatial objects in proximity to a point. Requires a geospatial index. The 2dsphere and 2d indexes support $near.',
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
)`,'{$0}'],
	['$nearSphere', 'Returns geospatial objects in proximity to a point on a sphere. Requires a geospatial index. The 2dsphere and 2d indexes support $nearSphere.',
`db.places.find(
   {
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
   }
)`,'{$0}'],
   ['$geometry','The $geometry operator specifies a GeoJSON geometry for use with the following geospatial query operators: $geoWithin, $geoIntersects, $near, and $nearSphere. $geometry uses EPSG:4326 as the default coordinate reference system (CRS).',
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
)`,`$geometry: {
   type: "$0",
   coordinates: []
}` ],

   ['$minDistance','Filters the results of a geospatial $near or $nearSphere query to those documents that are at least the specified distance from the center point.',
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
)`],

    ['$maxDistance','The $maxDistance operator constrains the results of a geospatial $near or $nearSphere query to the specified distance. The measuring units for the maximum distance are determined by the coordinate system in use. For GeoJSON point object, specify the distance in meters, not tradians.',
`db.places.find( {
   loc: { $near: [ 100 , 100 ],  $maxDistance: 10 }
} )`],

    ['$center','The $center operator specifies a circle for a $geoWithin query. The query returns legacy coordinate pairs that are within the bounds of the circle. The operator does not return GeoJSON objects.',
`db.places.find(
   { loc: { $geoWithin: { $center: [ [-74, 40.74], 10 ] } } }
)`,'[ [ $0, $1 ] , $2 ]'],

    ['$centerSphere','Defines a circle for a geospatial query that uses spherical geometry. The query returns documents that are within the bounds of the circle. You can use the $centerSphere operator on both GeoJSON objects and legacy coordinate pairs.',
`db.places.find( {
  loc: { $geoWithin: { $centerSphere: [ [ -88, 30 ], 10/3963.2 ] } }
} )`,	'[ [ $0, $1 ] , $2 ]'],

	['$box','Specifies a rectangle for a geospatial $geoWithin query to return documents that are within the bounds of the rectangle, according to their point-based location data. When used with the $box operator, $geoWithin returns documents based on grid coordinates and does not query for GeoJSON shapes.',
``,'[ [ $0, $1 ], [ $2, $3 ] ]'],

    ['$polygon','Specifies a polygon for a geospatial $geoWithin query on legacy coordinate pairs. The query returns pairs that are within the bounds of the polygon. The operator does not query for GeoJSON objects.',
`db.places.find(
  {
     loc: {
       $geoWithin: { $polygon: [ [ 0 , 0 ], [ 3 , 6 ], [ 6 , 0 ] ] }
     }
  }
)`,'[ [ $0 , $1 ] ]'],
    
	//$uniqueDocs Deprecated since version 2.6: Geospatial queries no longer return duplicate results. The $uniqueDocs operator has no impact on results.
	
	//Array
	['$all', 'Matches arrays that contain all elements specified in the query.','db.inventory.find( { tags: { $all: [ "appliance", "school", "book" ] } } )','[$0]'],
	['$elemMatch', 'Selects documents if element in the array field matches all the specified $elemMatch conditions.',
`db.scores.find(
   { results: { $elemMatch: { $gte: 80, $lt: 85 } } }
)`,'{$0}'],
	['$size', 'Selects documents if the array field is a specified size.','db.collection.find( { field: { $size: 2 } } );'],
	
	//Comments
	['$comment', 'Adds a comment to a query predicate.',
`db.records.find(
   {
     x: { $mod: [ 2, 0 ] },
     $comment: "Find even values."
   }
)`],
	
	//Projection Operators
	
	//['$',	'Projects the first element in an array that matches the query condition.'],
	//['$elemMatch', 'Projects the first element in an array that matches the specified $elemMatch condition.'],
	['$meta', 'Projects the document’s score assigned during $text operation.',`db.collection.find(
   <query>,
   { score: { $meta: "textScore" } }
).sort( { score: { $meta: "textScore" } } )`],
	['$slice', 'Limits the number of elements projected from an array. Supports skip and limit slices.',
`db.posts.find( {}, { comments: { $slice: 5 } } );
db.posts.find( {}, { comments: { $slice: -5 } } );
db.posts.find( {}, { comments: { $slice: [ 20, 10 ] } } )`]
]


//Update Operators
//The following modifiers are available for use in update operations; e.g. in db.collection.update() and db.collection.findAndModify().

let updateOperators = [
	//Fields
	['$inc', 'Increments the value of the field by the specified amount.',
`db.products.update(
   { sku: "abc123" },
   { $inc: { quantity: -2, "metrics.orders": 1 } }
)`,'{$0}'],

	['$mul', 'Multiplies the value of the field by the specified amount.',
`db.products.update(
   { _id: 1 },
   { $mul: { price: 1.25 } }
)`,'{$0}'],
		
		
	['$rename', 'Renames a field.',
`db.students.update( { _id: 1 }, { $rename: { "name.first": "name.fname" } } )`, '{0}'],
	
	
	['$setOnInsert', 'Sets the value of a field if an update results in an insert of a document. Has no effect on update operations that modify existing documents.',
`db.products.update(
  { _id: 1 },
  {
     $set: { item: "apple" },
     $setOnInsert: { defaultQty: 100 }
  },
  { upsert: true }
)`,'{$0}'],


	['$set', 'Sets the value of a field in a document.',
`db.products.update(
   { _id: 100 },
   { $set: { "details.make": "zzz" } }
)`,'{$0}'],
	
	['$unset', 'Removes the specified field from a document.',
`db.products.update(
   { sku: "unknown" },
   { $unset: { quantity: "", instock: "" } }
)`, '{$0:""}'],

	['$min', 'Only updates the field if the specified value is less than the existing field value.','db.scores.update( { _id: 1 }, { $min: { lowScore: 150 } } )', '{$0}'],
	['$max', 'Only updates the field if the specified value is greater than the existing field value.','db.scores.update( { _id: 1 }, { $max: { highScore: 870 } } )', '{$0}'],
	['$currentDate', 'Sets the value of a field to current date, either as a Date or a Timestamp.',
`db.users.update(
   { _id: 1 },
   {
     $currentDate: {
        lastModified: true,
        "cancellation.date": { $type: "timestamp" }
     },
     $set: {
        status: "D",
        "cancellation.reason": "user request"
     }
   }
)`],

	//Array
	//['$', 'Acts as a placeholder to update the first element that matches the query condition in an update.'],
	['$addToSet', 'Adds elements to an array only if they do not already exist in the set.',
`db.inventory.update(
   { _id: 2 },
   { $addToSet: { tags: { $each: [ "camera", "electronics", "accessories" ] } } }
 )`],
 
	['$pop', 'Removes the first or last item of an array.','db.students.update( { _id: 1 }, { $pop: { scores: 1 } } )'],
	
	
	['$pullAll', 'Removes all matching values from an array.','db.survey.update( { _id: 1 }, { $pullAll: { scores: [ 0, 5 ] } } )'],
	['$pull', 'Removes all array elements that match a specified query.','db.profiles.update( { _id: 1 }, { $pull: { votes: { $gte: 6 } } } )'],
	['$pushAll', 'Deprecated since version 2.4: Use the $push operator with $each instead.'],
	['$push', 'Adds an item to an array.',
`db.students.update(
   { name: "joe" },
   { $push: { scores: { $each: [ 90, 92, 85 ] } } }
)`],

	//Modifiers
	['$each', 'Modifies the $push and $addToSet operators to append multiple items for array updates.',
`db.students.update(
   { name: "joe" },
   { $push: { scores: { $each: [ 90, 92, 85 ] } } }
)`],

	['$slice', 'Modifies the $push operator to limit the size of updated arrays.',
`db.students.update(
   { _id: 1 },
   {
     $push: {
       scores: {
         $each: [ 80, 78, 86 ],
         $slice: -5
       }
     }
   }
)`],

	['$sort', 'Modifies the $push operator to reorder documents stored in an array.',
`db.students.update(
   { _id: 2 },
   { $push: { tests: { $each: [ 40, 60 ], $sort: 1 } } }
)`],
	
	['$position', 'Modifies the $push operator to specify the position in the array to add elements.',
`db.students.update(
   { _id: 1 },
   {
     $push: {
        scores: {
           $each: [ 50, 60, 70 ],
           $position: 0
        }
     }
   }
)`],

	//Bitwise
	['$bit', 'Performs bitwise AND, OR, and XOR updates of integer values.',
`db.switches.update(
   { _id: 1 },
   { $bit: { expdata: { and: NumberInt(10) } } }
)`],

	//Isolation
	['$isolated', 'Modifies the behavior of a write operation to increase the isolation of the operation.',
`db.foo.update(
    { status : "A" , $isolated : 1 },
    { $inc : { count : 1 } },
    { multi: true }
)`],

]

//Aggregation Pipeline Operators
//Pipeline stages appear in an array. Documents pass through the stages in sequence.
let aggregationPipelineOperators = [
	['$project', 'Reshapes each document in the stream, such as by adding new fields or removing existing fields. For each input document, outputs one document.'],
	['$match', 'Filters the document stream to allow only matching documents to pass unmodified into the next pipeline stage. $match uses standard MongoDB queries. For each input document, outputs either one document (a match) or zero documents (no match).'],
	['$redact', 'Reshapes each document in the stream by restricting the content for each document based on information stored in the documents themselves. Incorporates the functionality of $project and $match. Can be used to implement field level redaction. For each input document, outputs either one or zero document.'],
	['$limit', 'Passes the first n documents unmodified to the pipeline where n is the specified limit. For each input document, outputs either one document (for the first n documents) or zero documents (after the first n documents).'],
	['$skip', 'Skips the first n documents where n is the specified skip number and passes the remaining documents unmodified to the pipeline. For each input document, outputs either zero documents (for the first n documents) or one document (if after the first n documents).'],
	['$unwind', 'Deconstructs an array field from the input documents to output a document for each element. Each output document replaces the array with an element value. For each input document, outputs n documents where n is the number of array elements and can be zero for an empty array.'],
	['$group', 'Groups input documents by a specified identifier expression and applies the accumulator expression(s), if specified, to each group. Consumes all input documents and outputs one document per each distinct group. The output documents only contain the identifier field and, if specified, accumulated fields.'],
	['$sort', 'Reorders the document stream by a specified sort key. Only the order changes; the documents remain unmodified. For each input document, outputs one document.'],
	['$geoNear', 'Returns an ordered stream of documents based on the proximity to a geospatial point. Incorporates the functionality of $match, $sort, and $limit for geospatial data. The output documents include an additional distance field and can include a location identifier field.'],
	['$out', 'Writes the resulting documents of the aggregation pipeline to a collection. To use the $out stage, it must be the last stage in the pipeline.'],

	//Expression Operators
	//Boolean Operators
	//Boolean expressions evaluate their argument expressions as booleans and return a boolean as the result.'],

	['$and', 'Returns true only when all its expressions evaluate to true. Accepts any number of argument expressions.'],
	['$or', 'Returns true when any of its expressions evaluates to true. Accepts any number of argument expressions.'],
	['$not', 'Returns the boolean value that is the opposite of its argument expression. Accepts a single argument expression.'],

	// Set Operators
	// Set expressions performs set operation on arrays, treating arrays as sets. Set expressions ignores the duplicate entries in each input array and the order of the elements.'],

	['$setEquals', 'Returns true if the input sets have the same distinct elements. Accepts two or more argument expressions.'],
	['$setIntersection', 'Returns a set with elements that appear in all of the input sets. Accepts any number of argument expressions.'],
	['$setUnion', 'Returns a set with elements that appear in any of the input sets. Accepts any number of argument expressions.'],
	['$setDifference', 'Returns a set with elements that appear in the first set but not in the second set; i.e. performs a relative complement of the second set relative to the first. Accepts exactly two argument expressions.'],
	['$setIsSubset', 'Returns true if all elements of the first set appear in the second set, including when the first set equals the second set; i.e. not a strict subset. Accepts exactly two argument expressions.'],
	['$anyElementTrue', 'Returns true if any elements of a set evaluate to true; otherwise, returns false. Accepts a single argument expression.'],
	['$allElementsTrue', 'Returns true if no element of a set evaluates to false, otherwise, returns false. Accepts a single argument expression.'],

	// Comparison Operators
	// Comparison expressions return a boolean except for $cmp which returns a number.'],
	// The comparison expressions take two argument expressions and compare both value and type, using the specified BSON comparison order for values of different types.'],

	['$cmp', 'Returns: 0 if the two values are equivalent, 1 if the first value is greater than the second, and -1 if the first value is less than the second.'],
	['$eq', 'Returns true if the values are equivalent.'],
	['$gt', 'Returns true if the first value is greater than the second.'],
	['$gte', 'Returns true if the first value is greater than or equal to the second.'],
	['$lt', 'Returns true if the first value is less than the second.'],
	['$lte', 'Returns true if the first value is less than or equal to the second.'],
	['$ne', 'Returns true if the values are not equivalent.'],

	// Arithmetic Operators
	// Arithmetic expressions perform mathematic operations on numbers. Some arithmetic expressions can also support date arithmetic.'],
	['$add', 'Adds numbers to return the sum, or adds numbers and a date to return a new date. If adding numbers and a date, treats the numbers as milliseconds. Accepts any number of argument expressions, but at most, one expression can resolve to a date.'],
	['$subtract', 'Returns the result of subtracting the second value from the first. If the two values are numbers, return the difference. If the two values are dates, return the difference in milliseconds. If the two values are a date and a number in milliseconds, return the resulting date. Accepts two argument expressions. If the two values are a date and a number, specify the date argument first as it is not meaningful to subtract a date from a number.'],
	['$multiply', 'Multiplies numbers to return the product. Accepts any number of argument expressions.'],
	['$divide', 'Returns the result of dividing the first number by the second. Accepts two argument expressions.'],
	['$mod', 'Returns the remainder of the first number divided by the second. Accepts two argument expressions.'],

	// String Operators
	// String expressions, with the exception of $concat, only have a well-defined behavior for strings of ASCII characters.'],
	//$concat behavior is well-defined regardless of the characters used.'],

	['$concat', 'Concatenates any number of strings.'],
	['$substr', 'Returns a substring of a string, starting at a specified index position up to a specified length. Accepts three expressions as arguments: the first argument must resolve to a string, and the second and third arguments must resolve to integers.'],
	['$toLower', 'Converts a string to lowercase. Accepts a single argument expression.'],
	['$toUpper', 'Converts a string to uppercase. Accepts a single argument expression.'],
	['$strcasecmp', 'Performs case-insensitive string comparison and returns: 0 if two strings are equivalent, 1 if the first string is greater than the second, and -1 if the first string is less than the second.'],

	//Text Search Operators
	['$meta', 'Access text search metadata.'],

	//Array Operators
	['$size', 'Returns the number of elements in the array. Accepts a single expression as argument.'],

	//Variable Operators
	['$map', 'Applies a subexpression to each element of an array and returns the array of resulting values in order. Accepts named parameters.'],
	['$let', 'Defines variables for use within the scope of a subexpression and returns the result of the subexpression. Accepts named parameters.'],

	//Literal Operators
	['$literal', 'Return a value without parsing. Use for values that the aggregation pipeline may interpret as an expression. For example, use a $literal expression to a string that starts with a $ to avoid parsing as a field path.'],

	//Date Operators
	['$dayOfYear', 'Returns the day of the year for a date as a number between 1 and 366 (leap year).'],
	['$dayOfMonth', 'Returns the day of the month for a date as a number between 1 and 31.'],
	['$dayOfWeek', 'Returns the day of the week for a date as a number between 1 (Sunday) and 7 (Saturday).'],
	['$year', 'Returns the year for a date as a number (e.g. 2014).'],
	['$month', 'Returns the month for a date as a number between 1 (January) and 12 (December).'],
	['$week', 'Returns the week number for a date as a number between 0 (the partial week that precedes the first Sunday of the year) and 53 (leap year).'],
	['$hour', 'Returns the hour for a date as a number between 0 and 23.'],
	['$minute', 'Returns the minute for a date as a number between 0 and 59.'],
	['$second', 'Returns the seconds for a date as a number between 0 and 60 (leap seconds).'],
	['$millisecond', 'Returns the milliseconds of a date as a number between 0 and 999.'],
	['$dateToString', 'Returns the date as a formatted string.'],

	//Conditional Expressions
	['$cond', 'A ternary operator that evaluates one expression, and depending on the result, returns the value of one of the other two expressions. Accepts either three expressions in an ordered list or three named parameters.'],
	['$ifNull', 'Returns either the non-null result of the first expression or the result of the second expression if the first expression results in a null result. Null result encompasses instances of undefined values or missing fields. Accepts two expressions as arguments. The result of the second expression can be null.'],

	//Accumulators
	//Accumulators, available only for the $group stage, compute values by combining documents that share the same group key. Accumulators take as input a single expression, evaluating the expression once for each input document, and maintain their state for the group of documents.'],
	['$sum', 'Returns a sum for each group. Ignores non-numeric values.'],
	['$avg', 'Returns an average for each group. Ignores non-numeric values.'],
	['$first', 'Returns a value from the first document for each group. Order is only defined if the documents are in a defined order.'],
	['$last', 'Returns a value from the last document for each group. Order is only defined if the documents are in a defined order.'],
	['$max', 'Returns the highest expression value for each group.'],
	['$min', 'Returns the lowest expression value for each group.'],
	['$push', 'Returns an array of expression values for each group.'],
	['$addToSet', 'Returns an array of unique expression values for each group. Order of the array elements is undefined.']
]

//Query Modifiers
let queryModifierOperators = [
	//Modifiers
	//Many of these operators have corresponding methods in the shell. These methods provide a straightforward and user-friendly interface and are the preferred way to add these options.

	['$comment', 'Adds a comment to the query to identify queries in the database profiler output.'],
	['$explain', 'Forces MongoDB to report on query execution plans. '],
	['$hint', 'Forces MongoDB to use a specific index. '],
	['$maxScan', 'Limits the number of documents scanned.'],
	['$maxTimeMS', 'Specifies a cumulative time limit in milliseconds for processing operations on a cursor. '],
	['$max', 'Specifies an exclusive upper limit for the index to use in a query. '],
	['$min', 'Specifies an inclusive lower limit for the index to use in a query. '],
	['$orderby', 'Returns a cursor with documents sorted according to a sort specification. '],
	['$returnKey', 'Forces the cursor to only return fields included in the index.'],
	['$showDiskLoc', 'Modifies the documents returned to include references to the on-disk location of each document.'],
	['$snapshot', 'Forces the query to use the index on the _id field. '],
	['$query', 'Wraps a query document.'],

	//Sort Order
	['$natural', 'A special sort order that orders documents using the order of documents on disk.']

]