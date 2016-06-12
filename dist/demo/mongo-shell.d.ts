declare module mongo {
	interface ICollection {
		/**
        * Calculates aggregate values for the data in a collection.
		* Returns:	A cursor to the documents produced by the final stage of the aggregation pipeline operation, or if you include the explain option, the document that provides details on the processing of the aggregation operation.
		* If the pipeline includes the $out operator, aggregate() returns an empty cursor. See $out for more information.
		* e.g. db.orders.aggregate([
		*                      { $match: { status: "A" } },
		*                      { $group: { _id: "$cust_id", total: { $sum: "$amount" } } },
		*                      { $sort: { total: -1 } }
		*                    ])
        **/
		aggregate(pipeline: Object[], options?: IAggregateOption): IAggregateCursor;
		aggregate(...pipeline: Object[]): IAggregateCursor;

		/**
		* Returns the count of documents that would match a find() query. The db.collection.count() method does not perform the find() operation but instead counts and returns the number of results that match a query.
		**/
		count(query?): number;

		/**
		* Copies all documents from collection into newCollection using server-side JavaScript. If newCollection does not exist, MongoDB creates it.
		**/
		copyTo(newCollection: string): number;

		/**
		* Creates indexes on collections.
		* The options param contains a set of options that controls the creation of the index. Different index types can have additional options specific for that type.
		**/
		createIndex(keys: IField, options?: IIndexOption): void;

		/**
		* The size of the collection. This method provides a wrapper around the size output of the collStats (i.e. db.collection.stats()) command.
		**/
		dataSize(): number;

		/**
		* Finds the distinct values for a specified field across a single collection and returns the results in an array.
		**/
		distinct(field: string, query?): any[];

		/**
		* Removes a collection from the database. The method also removes any indexes associated with the dropped collection. The method provides a wrapper around the drop command.
		**/
		drop(): void;

		/**
		* Drops or removes the specified index from a collection. The db.collection.dropIndex() method provides a wrapper around the dropIndexes command.
		* To get the index name or the index specification document for the db.collection.dropIndex() method, use the db.collection.getIndexes() method.
		* To drop a text index, specify the index name.		
		**/
		dropIndex(indexName: string): void;
		/**
		* @param index e.g. dropIndex({field:1})
		**/
		dropIndex(index: IField): void;

		/**
		* Drops all indexes other than the required index on the _id field. Only call dropIndexes() as a method on a collection object.
		**/
		dropIndexes(): void;

		/**
		* Deprecated since version 3.0.0: db.collection.ensureIndex() is now an alias for db.collection.createIndex().
		* Creates an index on the specified field if the index does not already exist.
		**/
		ensureIndex(keys: IField, options?: IIndexOption): void;

		/**
		* Returns information on the query plan for the following operations: aggregate(); count(); find(); group(); remove(); and update() methods.
		* e.g. db.products.explain().remove( { category: "apparel" }, { justOne: true } )
		* @param verbosity @param verbosity The possible modes are: "queryPlanner", "executionStats", and "allPlansExecution". Also can be a boolean, true for "allPlansExecution", false for "queryPlanner", default is "queryPlanner"
		**/
		explain(verbosity?: string | mongoBoolean): ICollectionExplain;

		/**
		* Selects documents in a collection and returns a cursor to the selected documents.
		* e.g.
		* db.products.find( { qty: { $gte: 25, $lt: 35 } })
		* @param query Optional. Specifies selection criteria using query operators. To return all documents in a collection, omit this parameter or pass an empty document ({}).
		* @param projection Optional. Specifies the fields to return using projection operators. To return all fields in the matching document, omit this parameter.{ field1: boolean|number, field2: boolean|number ... }
		**/
		find(query?, projection?: IField): ICursor;

		/**
		* Modifies and returns a single document. By default, the returned document does not include the modifications made on the update. To return the document with the modifications made on the update, use the new option. The findAndModify() method is a shell helper around the findAndModify command.
		**/
		findAndModify(document: IFindAndModifyArg): any;

		/**
		* Returns one document that satisfies the specified query criteria. If multiple documents satisfy the query, this method returns the first document according to the natural order which reflects the order of documents on the disk. In capped collections, natural order is the same as insertion order. If no document satisfies the query, the method returns null.
		* @param query Optional. Specifies selection criteria using query operators. To return all documents in a collection, omit this parameter or pass an empty document ({}).
		* @param projection Optional. Specifies the fields to return using projection operators. To return all fields in the matching document, omit this parameter.{ field1: boolean|number, field2: boolean|number ... }
		**/
		findOne(query?, projection?: IField): any;

		/**
		* New in version 3.2
		* return the deleted document, otherwise null
		**/
		findOneAndDelete(query: Object, options?: { projection?: Object, sort?: IField, maxTimeMS?: number }): any;

		/**
		* New in version 3.2
		* Returns either the original document or, if returnNewDocument: true, the replacement document.
		* If returnNewDocument was false, the operation would return null as there is no original document to return.
		**/
		findOneAndReplace(query: Object, replacement: Object, options?: { projection?: Object, sort?: IField, maxTimeMS?: number, upsert?: mongoBoolean, returnNewDocument?: mongoBoolean })

		/**
		* New in version 3.2
		* Returns either the original document or, if returnNewDocument: true, the replacement document.
		* If returnNewDocument was false, the operation would return null as there is no original document to return.
		**/
		findOneAndUpdate(query: Object, update: Object, options?: { projection?: Object, sort?: IField, maxTimeMS?: number, upsert?: mongoBoolean, returnNewDocument?: mongoBoolean })

		/**
		* Returns an array that holds a list of documents that identify and describe the existing indexes on the collection. You must call db.collection.getIndexes() on a collection.
		**/
		getIndexes(): IIndex[];

		/**
		* Prints the data distribution statistics for a sharded collection. You must call the getShardDistribution() method on a sharded collection.
		**/
		getShardDistribution(): void;

		/**
		* This method returns information regarding the state of data in a sharded cluster that is useful when diagnosing underlying issues with a sharded cluster.
		* For internal and diagnostic use only.
		**/
		getShardVersion(): Object;

		/**
		* Groups documents in a collection by the specified keys and performs simple aggregation functions such as computing counts and sums. The method is analogous to a SELECT ... GROUP BY statement in SQL. The group() method returns an array.
		* RECOMMENDED ALTERNATIVES
		* Because db.collection.group() uses JavaScript, it is subject to a number of performance limitations. For most cases the $group operator in the aggregation pipeline provides a suitable alternative with fewer restrictions.
		* Limits and Restrictions
		* The db.collection.group() method does not work with sharded clusters. Use the aggregation framework or map-reduce in sharded environments.
		* e.g. db.orders.group(
		*    {
		*      key: { ord_dt: 1, 'item.sku': 1 },
		*      cond: { ord_dt: { $gt: new Date( '01/01/2012' ) } },
		*      reduce: function ( curr, result ) { },
		*      initial: { }
		*    }
		* )
		**/
		group(arg: IGroupArg): any[];

		/**
		* Inserts a document or documents into a collection.
		* @param docs A document or array of documents to insert into the collection.
		* @param options writeConcern Optional. A document expressing the write concern. Omit to use the default write concern
		* @param options ordered Optional. If true, perform an ordered insert of the documents in the array, and if an error occurs with one of documents, MongoDB will return without processing the remaining documents in the array.If false, perform an unordered insert, and if an error occurs with one of documents, continue processing the remaining documents in the array.Defaults to true.
		**/
		insert(docs: Object | Object[], options?: { writeConcern?: IWriteConcern, ordered?: mongoBoolean }): IInsertResult;

		/**
		* New in version 3.2
		**/
		insertMany(docs: Object[], options?: { writeConcern?: IWriteConcern, ordered?: mongoBoolean } | IWriteConcern): IInsertResult;

		/**
		* New in version 3.2
		**/
		insertOne(doc: Object, options?: { writeConcern?: IWriteConcern } | IWriteConcern): IInsertResult;

		/**
		* Returns true if the collection is a capped collection, otherwise returns false.
		**/
		isCapped(): boolean;

		/**
		* The db.collection.mapReduce() method provides a wrapper around the mapReduce command.
		* @param map ()=>void, this ref to doc, emit to send key value pair, e.g. function() {
		*                        emit(this.cust_id, this.price);
		*                    };
		* @param reduce e.g. function(keyCustId, valuesPrices) {
		*                           return Array.sum(valuesPrices);
		*                       };
		* @param options out: collectionName or out:{action:collectionName [, db: dbName] [, sharded: boolean ] [, nonAtomic: boolean ]} or out:{inline:1}
		**/
		mapReduce(map: () => void, reduce: (key, values) => any, options: IMapReduceOption): ICollection | any;

		/**
		* The db.collection.reIndex() drops all indexes on a collection and recreates them. This operation may be expensive for collections that have a large amount of data and/or a large number of indexes.
		* For replica sets, db.collection.reIndex() will not propagate from the primary to secondaries. db.collection.reIndex() will only affect a single mongod instance.
		**/
		reIndex(): void;

		/**
		* Removes documents from a collection.
		* @param query Specifies deletion criteria using query operators. To delete all documents in a collection, pass an empty document ({}).
		* @param options justOne Optional. To limit the deletion to just one document, set to true. Omit to use the default value of false and delete all documents matching the deletion criteria.
		* @param options writeConcern Optional. A document expressing the write concern. Omit to use the default write concern
		**/
		remove(query, options?: { justOne?: mongoBoolean, writeConcern?: IWriteConcern }): IRemoveResult;
		/**
		* @param justOne Optional. To limit the deletion to just one document, set to true. Omit to use the default value of false and delete all documents matching the deletion criteria.
		**/
		remove(query, justOne?: mongoBoolean): IRemoveResult;

		/**
		* New in version 3.2
		**/
		deleteOne(query, options?: { writeConcern?: IWriteConcern } | IWriteConcern): IRemoveResult;
		/**
		* New in version 3.2
		**/
		deleteMany(query, options?: { writeConcern?: IWriteConcern } | IWriteConcern): IRemoveResult;

		/**
		* Renames a collection. Provides a wrapper for the renameCollection database command.
		* @param target The new name of the collection. Enclose the string in quotes.
		* @param dropTarget Optional. If true, mongod drops the target of renameCollection prior to renaming the collection. The default value is false.
		**/
		renameCollection(target: string, dropTarget?: mongoBoolean): void;

		/**
		* Updates an existing document or inserts a new document, depending on its document parameter.
		* @param doc A document to save to the collection.
		* @param options writeConcern Optional. A document expressing the write concern. Omit to use the default write concern.
		**/
		save(doc, options?: { writeConcern?: IWriteConcern }): ISaveResult;

		/**
		* Returns statistics about the collection. 
		* @param scale Optional. The scale used in the output to display the sizes of items. By default, output displays sizes in bytes. To display kilobytes rather than bytes, specify a scale value of 1024.
		**/
		stats(scale?: number): ICollStats;
		/**
		* @param options Optional. Alternate option format. Mutually exclusive with scale as a scalar parameter. The use of this format optionally allows suppression or filtering of index details.
		**/
		stats(options?: IStatsOption): ICollStats;

		/**
		* The total amount of storage allocated to this collection for document storage. Provides a wrapper around the storageSize field of the collStats (i.e. db.collection.stats()) output.
		**/
		storageSize(): number;

		/**
		* The total size in bytes of the data in the collection plus the size of every indexes on the collection.
		**/
		totalSize(): number;

		/**
		* The total size of all indexes for the collection. This method provides a wrapper around the totalIndexSize output of the collStats (i.e. db.collection.stats()) operation.
		**/
		totalIndexSize(): number;

		/**
		* Modifies an existing document or documents in a collection. The method can modify specific fields of an existing document or documents or replace an existing document entirely, depending on the update parameter.
		* e.g. db.books.update(
		*    { _id: 1 },
		*    {
		*      $inc: { stock: 5 },
		*      $set: {
		*        item: "ABC123",
		*        "info.publisher": "2222",
		*        tags: [ "software" ],
		*        "ratings.1": { by: "xyz", rating: 3 }
		*      }
		*    }
		* )
		* @param query The selection criteria for the update. The same query selectors as in the find() method are available
		* @param update The modifications to apply.
		* @param options upsert Optional. If set to true, creates a new document when no document matches the query criteria. The default value is false, which does not insert a new document when no match is found.
		* @param options multi Optional. If set to true, updates multiple documents that meet the query criteria. If set to false, updates one document. The default value is false. 
		* @param options writeConcern Optional. A document expressing the write concern. Omit to use the default write concern.
		**/
		update(query, updater: Object, options?: { upsert?: mongoBoolean, multi?: mongoBoolean, writeConcern?: IWriteConcern }): IUpdateResult;
		update(query, updater: Object, upsert?: mongoBoolean, multi?: mongoBoolean): IUpdateResult;
		/**
		* New in version 3.2
		**/
		replaceOne(query, replacement: Object, options?: { upsert?: mongoBoolean, writeConcern?: IWriteConcern } | IWriteConcern): IUpdateResult;

		/**
		* New in version 3.2
		**/
		updateOne(query, update: Object, options?: { upsert?: mongoBoolean, writeConcern?: IWriteConcern } | IWriteConcern): IUpdateResult;

		/**
		* New in version 3.2
		**/
		updateMany(query, update: Object, options?: { upsert?: mongoBoolean, writeConcern?: IWriteConcern } | IWriteConcern): IUpdateResult;

		/**
		* Validates a collection. The method scans a collection’s data structures for correctness and returns a single document that describes the relationship between the logical collection and the physical representation of the data.
		* The validate() method output provides an in-depth view of how the collection uses storage. Be aware that this command is potentially resource intensive and may impact the performance of your MongoDB instance.
		* @param full Optional. Specify true to enable a full validation and to return full statistics. MongoDB disables full validation by default because it is a potentially resource-intensive operation.
		**/
		validate(full?: mongoBoolean): Object;
		/**
		* Returns an interface to access the query plan cache for a collection. The interface provides methods to view and clear the query plan cache.
		**/
		getPlanCache(): IPlanCache;
		/**
		* Initializes and returns a new Bulk() operations builder for a collection. The builder constructs an ordered list of write operations that MongoDB executes in bulk.
		**/
		initializeOrderedBulkOp(): IBulk;
		/**
		* Initializes and returns a new Bulk() operations builder for a collection. The builder constructs an unordered list of write operations that MongoDB executes in bulk.
		**/
		initializeUnorderedBulkOp(): IBulk;

		exists(): { name: string, options: any };

		help(): void;
		
		/**
		* Specifies a path for use with chaining
		*
		* e.g. 
		*    // instead of writing:
        *    db.collection.find({age: {$gte: 21, $lte: 65}});
		*    // // we can instead write:
        *    db.collection.where('age').gte(21).lte(65);
		*
		*    // passing query conditions is permitted too
		*    db.collection.find().where({ name: 'vonderful' })
        *
		*    // chaining
		*    db.collection
		*     .where('age').gte(21).lte(65)
		*     .where({ 'name': /^vonderful/i })
		*     .where('friends').slice(10)
		*/        
		where(path?: string, val?: any): ICursor;
		where(path?: Object, val?: any): ICursor;
		
		/**
		* Specifies which document fields to include or exclude
		*
		* e.g. 
		*   // 1 means include, 0 means exclude
        *   db.collection.select({ name: 1, address: 1, _id: 0 })
        *   // or prefixing a path with - will flag that path as excluded.
		*   db.collection.select('name address -_id')
		*/
		select(arg: string|Object): ICursor;
	}

	interface ICollectionExplain {
		/**
        * @see db.collection.aggregate
        **/
		aggregate(pipeline: any[], options?: IAggregateOption): any;
		/**
		* @see db.collection.count
		**/
		count(query?): any;
		/**
		* New in version 3.2
		* @see db.collection.distinct
		**/
		distinct(field: string, query?): any;
		/**
		* @see db.collection.find
		**/
		find(query?, projection?: IField): IExplainCursor;
		/**
		* @see db.collection.group
		**/
		group(arg: IGroupArg): any;
		/**
		* @see db.collection.remove
		**/
		remove(query, justOne?: mongoBoolean, writeConcern?: IWriteConcern): any;
		/**
		* @see db.collection.update
		**/
		update(query, update, options?: { upsert?: mongoBoolean, multi?: mongoBoolean, writeConcern?: IWriteConcern }): any;
		/**
		* To see the list of operations supported by db.collection.explain()
		**/
		help(): void;
		/**
		* return the collection which is ready to explain
		**/
		getCollection(): ICollection;
		/**
		* return current explain collection verbosity
		**/
		getVerbosity(): string;
		/**
		* set current explain collection verbosity
		* @param verbosity The possible modes are: "queryPlanner", "executionStats", and "allPlansExecution". Also can be a boolean, true for "allPlansExecution", false for "queryPlanner", default is "queryPlanner"
		**/
		setVerbosity(verbosity?: string | mongoBoolean): ICollectionExplain;
	}

	interface IExplainCursor {
		/**
		* retrieve the explain result
		**/
		finish(): any;
		/**
		* alias for .finish()
		**/
		next(): any;
		/**
		* For a list of query modifiers available
		**/
		help(): void;
		/**
		* @see collection.find({}).addOption
		**/
		addOption(flag: number): IExplainCursor;
		/**
		* @see collection.find({}).batchSize
		**/
		batchSize(size: number): IExplainCursor;
		/**
		* @see collection.find({}).count
		**/
		count(applySkipLimit?: mongoBoolean): any;
		/**
		* @see collection.find({}).forEach
		**/
		forEach(func: (doc) => void): void;
		/**
		* @see collection.find({}).hasNext
		**/
		hasNext(): boolean;
		/**
		* @see collection.find({}).hint
		**/
		hint(indexName: string): IExplainCursor;
		hint(index: IField): IExplainCursor;
		/**
		* @see collection.find({}).limit
		**/
		limit(limit: number): IExplainCursor;
		/**
		* @see collection.find({}).maxTimeMS
		**/
		maxTimeMS(milliseconds: number): IExplainCursor;
		/**
		* @see collection.find({}).max
		**/
		max(indexBounds: IField): IExplainCursor;
		/**
		* @see collection.find({}).min
		**/
		min(indexBounds: IField): IExplainCursor;
		/**
		* @see collection.find({}).readPref
		**/
		readPref(mode: string, tagSet?: any[]): IExplainCursor;
		/**
		* @see collection.find({}).showDiskLoc
		**/
		showDiskLoc(): IExplainCursor;
		/**
		* @see collection.find({}).skip
		**/
		skip(skip: number): IExplainCursor;
		/**
		* @see collection.find({}).snapshot
		**/
		snapshot(): IExplainCursor;
		/**
		* @see collection.find({}).sort
		**/
		sort(sort: IField): IExplainCursor;
	}

	interface IAggregateCursor {
		/**
		* cursor.hasNext() returns true if the cursor returned by the db.collection.find() query can iterate further to return more documents.
		**/
		hasNext(): boolean;
		/**
		* The next document in the cursor returned by the db.collection.find() method. See cursor.hasNext() related functionality.
		**/
		next(): any;
		/**
		* cursor.objsLeftInBatch() returns the number of documents remaining in the current batch.
		**/
		objsLeftInBatch(): number;
		/**
		* Applies function to each document visited by the cursor and collects the return values from successive application into an array.
		**/
		map(func: (doc) => any): any[];
		/**
		* Iterates the cursor to apply a JavaScript function to each document from the cursor.
		**/
		forEach(func: (doc) => void): void;
		/**
		* The toArray() method returns an array that contains all the documents from a cursor. The method iterates completely the cursor, loading all the documents into RAM and exhausting the cursor.
		**/
		toArray(): any[];
		/**
		* Counts the number of documents remaining in a cursor.
		* itcount() is similar to cursor.count(), but actually executes the query on an existing iterator, exhausting its contents in the process.
		**/
		itcount(): number;
		/**
		* Configures the cursor to display results in an easy-to-read format.
		**/
		pretty(): IAggregateCursor;

		/**
		 * Add a project stage to the aggregation pipeline
		 * @method
		 * @param {object} document The project stage document.
		 * @return {AggregationCursor}
		 */
		project(document): IAggregateCursor;

		/**
		 * Add a match stage to the aggregation pipeline
		 * @method
		 * @param {object} document The match stage document.
		 * @return {AggregationCursor}
		 */
		match(document): IAggregateCursor;

		/**
		 * Add a redact stage to the aggregation pipeline
		 * @method
		 * @param {object} document The redact stage document.
		 * @return {AggregationCursor}
		 */
		redact(document): IAggregateCursor;

		/**
		 * Add a limit stage to the aggregation pipeline
		 * @method
		 * @param {number} value The state limit value.
		 * @return {AggregationCursor}
		 */
		limit(value: number): IAggregateCursor;

		/**
		 * Add a skip stage to the aggregation pipeline
		 * @method
		 * @param {number} value The state skip value.
		 * @return {AggregationCursor}
		 */
		skip(value: number): IAggregateCursor;

		/**
		 * Add a unwind stage to the aggregation pipeline
		 * @method
		 * @param {string} field The unwind field name.
		 * @return {AggregationCursor}
		 */
		unwind(value: string | {
			path: string,
			includeArrayIndex?: string,
			preserveNullAndEmptyArrays?: boolean
		}): IAggregateCursor;

		/**
			 * Add a group stage to the aggregation pipeline
			 * @method
			 * @param {object} document The group stage document.
			 * @return {AggregationCursor}
		 */
		group(document): IAggregateCursor;

		/**
			 * Add a sample stage to the aggregation pipeline
			 * @method
			 *  @param {number} size Randomly selects the specified number of documents from its input.
			 * @return {AggregationCursor}
		 */
		sample(size: number): IAggregateCursor;

		/**
	   * Add a sort stage to the aggregation pipeline
	   * @method
	   * @param {object} document The sort stage document.
	   * @return {AggregationCursor}
	   */
		sort(document): IAggregateCursor;

		/**
		 * Add a geoNear stage to the aggregation pipeline
		 * @method
		 * @param {object} document The geoNear stage document.
		 * @return {AggregationCursor}
		 */
		geoNear(document): IAggregateCursor;

		/**
	   * Add a lookup stage to the aggregation pipeline
	   * @method
	   * @param {object} document The lookup stage document.
	   * @return {AggregationCursor}
	   */
		lookup(document): IAggregateCursor;

		/**
		 * Add a out stage to the aggregation pipeline
		 * @method
		 * @param {string} outCollection output collection name.
		 * @return {AggregationCursor}
		 */
		out(outCollection: string): IAggregateCursor;

		/**
		 * Add a out stage to the aggregation pipeline
		 * @method
		 * @return {AggregationCursor}
		 */
		indexStats(): IAggregateCursor;

		/**
		* Counts the number of documents referenced by a AggregateCursor.  
		**/
		count(): number;
	}
    interface IQueryOperator{
		/**
		* Specifies an $all query condition
		* e.g. 
		*   query.where('permission').all(['read', 'write'])
		**/
		all(val: any[]): ICursor;


		/**
		* Specifies arguments for an $and condition
		* e.g. 
		*   query.and([{ color: 'green' }, { status: 'ok' }])
		**/
		and(array: Object[]): ICursor;

		/**
		* Specifies a $box condition
		* e.g. 
		*   var lowerLeft = [40.73083, -73.99756]
		*   var upperRight= [40.741404,  -73.988135]
        *   query.where('location').within().box(lowerLeft,upperRight)
		**/
		box(val: Object): ICursor;
		box(a: number[], b: number[]): ICursor;

		/**
		* Specifies a $center or $centerSphere condition.
        * e.g.
        *  var area = { center: [50, 50], radius: 10, unique: true }
        *  query.where('loc').within().circle(area)
        *  query.circle('loc', area);
        *  // for spherical calculations
        *  var area = {center: [50, 50], radius: 10, unique: true,spherical:true}
        *  query.where('loc').within().circle(area)
        *  query.circle('loc', area);
        **/
		circle(area: Object): ICursor;
		circle(path: string, area: Object): ICursor;

		/**
		* Specifies an $elemMatch condition
        * e.g.
        *  query.where('comment').elemMatch({author:'autobot',votes:{$gte:5}})
		*
        *  query.elemMatch('comment', function (elem) {
        *     elem.where('author').equals('autobot');
        *     elem.where('votes').gte(5);
        *  })
		**/
		elemMatch(criteria: Object): ICursor;
		elemMatch(criteria: (elem: ICursor) => void): ICursor;
		elemMatch(path: string, criteria: Object): ICursor;
		elemMatch(path: string, criteria: (elem: ICursor) => void): ICursor;

	    /**
    	 * Specifies the complementary comparison value for paths specified with `where()`
		 * e.g.
		 *     query.where('age').equals(49);
		 *
		 *     // is the same as
		 *
		 *     query.where('age', 49);
		 *
		 */
		 equals(val: Object): ICursor;

		/**
		 * Specifies the complementary comparison value for paths specified with `where()`
		 * This is alias of `equals`
		 * e.g.
		 *     query.where('age').eq(49);
		 *
		 *     // is the same as
		 *
		 *     query.where('age').equals(49);
		 *
		 *     // is the same as
		 *
		 *     query.where('age', 49);
		 *
		 * @param {Object} val
		 */
		eq(val: Object): ICursor;

		/**
		 * Specifies an `$exists` condition
		 * e.g.
		 *     // { name: { $exists: true }}
		 *     query.where('name').exists()
		 *     query.where('name').exists(true)
		 *     query.find().exists('name')
		 *
		 *     // { name: { $exists: false }}
		 *     query.where('name').exists(false);
		 *     query.find().exists('name', false);
		 *
		 * @param {String} [path]
		 * @param {Number} val
		 */
    	exists(val?: boolean): ICursor;
        exists(path: string, val?: boolean): ICursor;

		/**
		 * Specifies a `$geometry` condition
		 * e.g.
		 *     var polyA = [[[ 10, 20 ], [ 10, 40 ], [ 30, 40 ], [ 30, 20 ]]]
		 *     query.where('loc').within().geometry({ type: 'Polygon', coordinates: polyA })
		 *
		 *     // or
		 *     var polyB = [[ 0, 0 ], [ 1, 1 ]]
		 *     query.where('loc').within().geometry({ type: 'LineString', coordinates: polyB })
		 *
		 *     // or
		 *     var polyC = [ 0, 0 ]
		 *     query.where('loc').within().geometry({ type: 'Point', coordinates: polyC })
		 *
		 *     // or
		 *     query.where('loc').intersects().geometry({ type: 'Point', coordinates: polyC })
		 *
		 * ####NOTE:
		 *
		 * `geometry()` **must** come after either `intersects()` or `within()`.
		 *
		 * The `object` argument must contain `type` and `coordinates` properties.
		 * - type {String}
		 * - coordinates {Array}
		 *
		 * The most recent path passed to `where()` is used.
		 *
		 * @param {Object} object Must contain a `type` property which is a String and a `coordinates` property which is an Array. See the examples.
		 */
		geometry(object: Object): ICursor;

		/**
		 * Specifies a $gt query condition.
		 *
		 * When called with one argument, the most recent path passed to `where()` is used.
		 * e.g.
		 *     query.where('clicks').gt(999)
		 *
		 */
		gt(val: any): ICursor;
		gt(path: string, val: any): ICursor;

		/**
		 * Specifies a $gte query condition.
		 *
		 * When called with one argument, the most recent path passed to `where()` is used.
		 * e.g.
		 *  query.where('clicks').gte(1000)
		 */
		gte(val: any): ICursor;
		gte(path: string, val: any): ICursor;

		/**
		* Specifies an $in query condition.
        *
        * e.g. query.where('author_id').in([3, 48901, 761])
        */
		in(val: any[]): ICursor;
		in(path: string, val: any[]): ICursor;

		/**
		 * Declares an intersects query for `geometry()`.
		 * e.g.
		 *     query.where('path').intersects().geometry({
		 *         type: 'LineString'
		 *       , coordinates: [[180.0, 11.0], [180, 9.0]]
		 *     })
		 *
		 *     query.where('path').intersects({
		 *         type: 'LineString'
		 *       , coordinates: [[180.0, 11.0], [180, 9.0]]
		 *     })
		 */
		intersects(arg?: Object): ICursor;


		/**
		* Specifies a $lt query condition.
		*
		* e.g. query.where('clicks').lt(50)
		*/
		lt(val: any): ICursor;

		/**
		* Specifies a $lt query condition.
		*
		* e.g. query.lt("clicks",50)
		*/
		lt(path: string, val: any): ICursor;

       	/**
		* Specifies a $lte query condition.
		*
		* e.g. query.where('clicks').lte(50)
		*/
		lte(val: any): ICursor;

       	/**
		* Specifies a $lte query condition.
		* e.g. query.lte("clicks",50)
		*/
		lte(path: string, val: any): ICursor;

        /**
		* Specifies a $maxDistance query condition.
		* e.g.
		*  query.where('location').near({ center: [139, 74.3] }).maxDistance(5)
		*/
		maxDistance(val: number): ICursor;
		maxDistance(path: string, val: number): ICursor;
		
		
        /**
		* Specifies a $mod condition
		*
		* e.g. query.where('count').mod(2, 0)
		*/
		mod(val: number[]): ICursor;
		mod(path: string, val: number[]): ICursor;
		
        /**
		* Specifies a $ne query condition.
		*
		* e.g. query.where('status').ne('ok')
		*/
		ne(val: any): ICursor;
		ne(path: string, val: any): ICursor;
        
		
        /**
		* Specifies arguments for a $near or $nearSphere condition.
        * These operators return documents sorted by distance.
		* e.g.
		* query.where('loc').near({ center: [10, 10] });
        * query.where('loc').near({ center: [10, 10], maxDistance: 5 });
        * query.near('loc', { center: [10, 10], maxDistance: 5 });
        *  // GeoJSON
        * query.where('loc').near({ center: { type: 'Point', coordinates: [10, 10] }});
        * query.where('loc').near({ center: { type: 'Point', coordinates: [10, 10] }, maxDistance: 5, spherical: true });
        * query.where('loc').near().geometry({ type: 'Point', coordinates: [10, 10] });
        * // For a $nearSphere condition, pass the `spherical` option.
        * query.near({ center: [10, 10], maxDistance: 5, spherical: true }); 
		*/
		near(val: Object): ICursor;
		near(path: string, val: Object): ICursor;

        /**
		* Specifies an $nin query condition.
		*
		* e.g. query.where('author_id').nin([3, 48901, 761])
		*/
		nin(val: any[]): ICursor;
		nin(path: string, val: any[]): ICursor;

        /**
		* Specifies arguments for an $nor condition.
		*
		* e.g. query.nor([{ color: 'green' }, { status: 'ok' }])
		*/
		nor(array: Object[]): ICursor;
        
		
        /**
		* Specifies arguments for an $or condition.
		*
		* e.g. query.or([{ color: 'red' }, { status: 'emergency' }])
		*/
		or(array: Object[]): ICursor;

        /**
		* Specifies a $polygon condition
		* e.g.
		*  query.where('loc').within().polygon([10,20], [13, 25], [7,15])
		*  query.polygon('loc', [10,20], [13, 25], [7,15])
		*/
		polygon(...coordinatePairs: number[][]): ICursor;
		polygon(path: string, ...coordinatePairs: number[][]): ICursor;


        /**
		* Specifies a $regex query condition.
		* e.g. 
		*    query.where('name').regex(/^sixstepsrecords/)
		*/
		regex(val: RegExp): ICursor;
		regex(path: string, val: RegExp): ICursor;


        /**
		* Specifies a $size query condition.
		*
		* e.g. 
		*    query.where('someArray').size(6)
		*/
		$size(val: number): ICursor;
		$size(path: string, val: number): ICursor;

        /**
		* Specifies a $slice projection for a path
		* e.g. 
		*    query.where('comments').slice(5)
		*    query.where('comments').slice(-5)
		*    query.where('comments').slice([-10, 5])
		*/        
		slice(val: number): ICursor;
		slice(val: number[]): ICursor;
		slice(path: string, val: number): ICursor;
		slice(path: string, val: number[]): ICursor;

        /**
		* Specifies a path for use with chaining
		* e.g. 
		*    // instead of writing:
        *    query.find({age: {$gte: 21, $lte: 65}});
		*    // // we can instead write:
        *    query.where('age').gte(21).lte(65);
		*
		*    // passing query conditions is permitted too
		*    query.find().where({ name: 'vonderful' })
        *
		*    // chaining
		*    query
		*     .where('age').gte(21).lte(65)
		*     .where({ 'name': /^vonderful/i })
		*     .where('friends').slice(10)
		*/        
		where(path?: string, val?: any): ICursor;
		where(path?: Object, val?: any): ICursor;
		
		
        /**
		* Sets a $geoWithin or $within argument for geo-spatial queries.
		* e.g. 
        *    query.within().box()
		*    query.within().circle()
        *    query.within().geometry()
		*
		*    query.where('loc').within({ center: [50,50], radius: 10, unique: true, spherical: true });
		*    query.where('loc').within({ box: [[40.73, -73.9], [40.7, -73.988]] });
        *    query.where('loc').within({ polygon: [[],[],[],[]] });
		*    
		*    query.where('loc').within([], [], []) // polygon
		*    query.where('loc').within([], []) // box
		*    query.where('loc').within({ type: 'LineString', coordinates: [...] }); // geometry
		*/ 		
		within(val?: Object): ICursor;
		within(coordinate: number[], ...coordinatePairs: number[][]): ICursor;

        /**
		* Specifies a $where condition.
		* Use $where when you need to select documents using a JavaScript expression.
		* e.g. 
		*    query.$where('this.comments.length > 10 || this.name.length > 5')
		*    query.$where(function () {
		*     return this.comments.length > 10 || this.name.length > 5;
		*    })
		*
		*  Only use $where when you have a condition that cannot be met using other MongoDB operators like $lt. Be sure to read about all of its caveats before using.
		*/   
		$where(argument: string): ICursor;
		$where(argument: Function): ICursor;		
	}
    interface IQueryBuilder extends IQueryOperator{
		/**
		* Get QueryBuilder Result.
		* e.g.   qb.where('type').eq('movie').build() => {'type':'movie'} 
		**/
		build():Object;
	}

	interface ICursor extends IQueryOperator {
		/**
		* Adds OP_QUERY wire protocol flags, such as the tailable flag, to change the behavior of queries.
		* @param flag OP_QUERY wire protocol flag. For the mongo shell, you can use the cursor flags listed below
		* DBQuery.Option.tailable		Sets the cursor not to close once the last data is received, allowing the query to continue returning data added after the initial results were exhausted.
		* DBQuery.Option.slaveOk		Allows querying of a replica slave.
		* DBQuery.Option.noTimeout		Prevents the server from timing out idle cursors.
		* DBQuery.Option.awaitData		For use with .. data:: DBQuery.Option.tailable; sets the cursor to block and await data for a while rather than returning no data. The cursor will return no data once the timeout has expired.
		* DBQuery.Option.exhaust		Sets the cursor to return all data returned by the query at once rather than splitting the results into batches.
		* DBQuery.Option.partial		Sets the cursor to return partial data from a query against a sharded cluster in which some shards do not respond rather than throwing an error.
		**/
		addOption(flag: number): ICursor;
		/**
		* Specifies the number of documents to return in each batch of the response from the MongoDB instance. In most cases, modifying the batch size will not affect the user or the application, as the mongo shell and most drivers return results as if MongoDB returned a single batch.
		* @param size The number of documents to return per batch. Do not use a batch size of 1.
		**/
		batchSize(size: number): ICursor;
		/**
		* Counts the number of documents referenced by a cursor. Append the count() method to a find() query to return the number of matching documents. The operation does not perform the query but instead counts the results that would be returned by the query.
		* @param applySkipLimit Optional. Specifies whether to consider the effects of the cursor.skip() and cursor.limit() methods in the count. By default, the count() method ignores the effects of the cursor.skip() and cursor.limit(). 
		**/
		count(applySkipLimit?: mongoBoolean): number;
        projection(projection: Object): ICursor;
		/**
		* Changed in version 3.0: The parameter to the method and the output format have changed in 3.0.
		* Provides information on the query plan for the db.collection.find() method.
		* @param verbosity Optional. Specifies the verbosity mode for the explain output. The mode affects the behavior of explain() and determines the amount of information to return. The possible modes are: "queryPlanner", "executionStats", and "allPlansExecution". Default mode is "queryPlanner". For backwards compatibility with earlier versions of cursor.explain(), MongoDB interprets true as "allPlansExecution" and false as "queryPlanner".
		**/
		explain(verbosity?: string | mongoBoolean): any;
		/**
		* Iterates the cursor to apply a JavaScript function to each document from the cursor.
		* @param func A JavaScript function to apply to each document from the cursor. The <function> signature includes a single argument that is passed the current document to process.
		**/
		forEach(func: (doc) => void): void;
		/**
		* cursor.hasNext() returns true if the cursor returned by the db.collection.find() query can iterate further to return more documents.
		**/
		hasNext(): boolean;
		/**
		* Call this method on a query to override MongoDB’s default index selection and query optimization process. Use db.collection.getIndexes() to return the list of current indexes on a collection.
		* When an index filter exists for the query shape, MongoDB ignores the hint().
		* You cannot use hint() if the query includes a $text query expression.
		* @param indexName The index to “hint” or force MongoDB to use when performing the query. Specify the index by the index name
		**/
		hint(indexName: string): ICursor;
		/**
		* @param index The index to “hint” or force MongoDB to use when performing the query. Specify the index by the index specification document
		**/
		hint(index: IField): ICursor;
		/**
		* Counts the number of documents remaining in a cursor.
		* itcount() is similar to cursor.count(), but actually executes the query on an existing iterator, exhausting its contents in the process.
		**/
		itcount(): number;
		/**
		* Use the limit() method on a cursor to specify the maximum number of documents the cursor will return. limit() is analogous to the LIMIT statement in a SQL database.
		**/
		limit(limit: number): ICursor;
		/**
		* Applies function to each document visited by the cursor and collects the return values from successive application into an array.
		* @param func A function to apply to each document visited by the cursor.
		**/
		map(func: (doc) => any): any[];
		/**
		* Specifies a cumulative time limit in milliseconds for processing operations on a cursor.
		* @param milliseconds Specifies a cumulative time limit in milliseconds for processing operations on the cursor.
		**/
		maxTimeMS(milliseconds: number): ICursor;
		/**
		* Specifies the exclusive upper bound for a specific index in order to constrain the results of find(). max() provides a way to specify an upper bound on compound key indexes.
		* The fields correspond to all the keys of a particular index in order. You can explicitly specify the particular index with the hint() method. Otherwise, mongod selects the index using the fields in the indexBounds; however, if multiple indexes exist on same fields with different sort orders, the selection of the index may be ambiguous.
		* e.g. db.products.find( { _id: 7 } ).max( { price: 1.39 } )
		* The query will use the index on the price field, even if the index on _id may be better.
		* @param indexBounds The exclusive upper bound for the index keys
		**/
		max(indexBounds: IField): ICursor;
		/**
		* Constrains the query to only scan the specified number of documents when fulfilling the query. 
		* Use this modifier to prevent potentially long running queries from disrupting performance by scanning through too much data.
		**/
		maxScan(count: number): ICursor;
		/**
		* Specifies the inclusive lower bound for a specific index in order to constrain the results of find(). min() provides a way to specify lower bounds on compound key indexes.
		* The fields correspond to all the keys of a particular index in order. You can explicitly specify the particular index with the hint() method. Otherwise, MongoDB selects the index using the fields in the indexBounds; however, if multiple indexes exist on same fields with different sort orders, the selection of the index may be ambiguous.
		* db.products.find( { _id: 7 } ).min( { price: 1.39 } )
		* The query will use the index on the price field, even if the index on _id may be better.
		* @param indexBounds The inclusive lower bound for the index keys.
		**/
		min(indexBounds: IField): ICursor;
		/**
		* The next document in the cursor returned by the db.collection.find() method. See cursor.hasNext() related functionality.
		**/
		next(): any;
		/**
		* cursor.objsLeftInBatch() returns the number of documents remaining in the current batch.
		**/
		objsLeftInBatch(): number;
		/**
		* Configures the cursor to display results in an easy-to-read format.
		**/
		pretty(): ICursor;
		/**
		* Append readPref() to a cursor to control how the client routes the query to members of the replica set.
		* You must apply readPref() to the cursor before retrieving any documents from the database.
		* @param mode One of the following read preference modes: primary, primaryPreferred, secondary, secondaryPreferred, or nearest
		* @param tagSet Optional. A tag set used to specify custom read preference modes. e.g. [ {'dc': 'east'} ]
		**/
		readPref(mode: string, tagSet?: any[]): ICursor;
		/**
		* Modifies the output of a query by adding a field $diskLoc to matching documents. 
		* e.g. The projection can also access the added field $diskLoc, as in the following example:
		* db.collection.find( { a: 1 }, { $diskLoc: 1 } ).showDiskLoc()
		**/
		showDiskLoc(): ICursor;
		/**
		 * New in Version 3.2
		 * This method replaces the previous cursor.showDiskLoc().
		 * Modifies the output of a query by adding a field $recordId to matching documents. $recordId is the internal key which uniquely identifies a document in a collection. It has the form:
		 */
		showRecordId(): ICursor;
		/**
		* Call the cursor.skip() method on a cursor to control where MongoDB begins returning results. 
		**/
		skip(skip: number): ICursor;
		
				/**
		* A count of the number of documents that match the db.collection.find() query after applying any cursor.skip() and cursor.limit() methods.
		**/
		size(): number;
		
		/**
		* Append the snapshot() method to a cursor to toggle the “snapshot” mode. This ensures that the query will not return a document multiple times, even if intervening write operations result in a move of the document due to the growth in document size.
		* You must apply snapshot() to the cursor before retrieving any documents from the database.
		* You can only use snapshot() with unsharded collections.
		* The snapshot() does not guarantee isolation from insertion or deletions.
		* The snapshot() traverses the index on the _id field. As such, snapshot() cannot be used with sort() or hint().
		**/
		snapshot(): ICursor;
		/**
		* Specifies the order in which the query returns matching documents. You must apply sort() to the cursor before retrieving any documents from the database.
		* @param sort A document that defines the sort order of the result set e.g. { age : -1, posts: 1 }
		**/
		sort(sort: IField | { [field: string]: { $meta: string } }): ICursor;
		/**
		* The toArray() method returns an array that contains all the documents from a cursor. The method iterates completely the cursor, loading all the documents into RAM and exhausting the cursor.
		**/
		toArray(): any[];
		
		/**
		* To list the available modifier and cursor handling methods
		**/
		help(): void;

        /**
		* Specifies which document fields to include or exclude
		* e.g. 
		*   // 1 means include, 0 means exclude
        *   query.select({ name: 1, address: 1, _id: 0 })
        *   // or prefixing a path with - will flag that path as excluded.
		*   query.select('name address -_id')
		*/
		select(arg: string|Object): ICursor;
	}

	interface IDatabase {
		/**
		* Copies data directly between MongoDB instances. The db.cloneCollection() method wraps the cloneCollection database command.
		* @param fromSvr The address of the server to clone from.
		* @param collection The collection in the MongoDB instance that you want to copy. db.cloneCollection() will only copy the collection with this name from database of the same name as the current database the remote MongoDB instance
		* @param query Optional. A standard query document that limits the documents copied as part of the db.cloneCollection() operation. All query selectors available to the find() are available here.
		**/
		cloneCollection(fromSvr: string, collection: string, query?): void;
		/**
		* Copies a remote database to the current database. The command assumes that the remote database has the same name as the current database.
		* New databases are implicitly created, so the current host does not need to have a database named "importdb" for this command to succeed.
		* @param hostname The hostname of the database to copy.
		**/
		cloneDatabase(hostname: string): void;
		/**
		* Displays help text for the specified database command. See the Database Commands.
		* @param command The name of a database command.
		**/
		commandHelp(command: string): void;
		/**
		* Changed in version 3.0: When authenticating to the fromhost instance, db.copyDatabase() supports MONGODB-CR and SCRAM-SHA-1 mechanisms to authenticate the fromhost user.
		* Copies a database either from one mongod instance to the current mongod instance or within the current mongod
		* Do not use db.copyDatabase() to copy databases that contain sharded collections.
		* e.g.  db.copyDatabase(
		*    "reporting",
		*    "reporting_copy",
		*    "example.net",
		*    "reportUser",
		*    "abc123",
		*    "MONGODB-CR"
		* )
		* @param fromdb Name of the source database.
		* @param todb Name of the target database.
		* @param fromhost Optional. The hostname of the source mongod instance. Omit to copy databases within the same mongod instance
		* @param username Optional. The name of the user on the fromhost MongoDB instance. The user authenticates to the fromdb.
		* @param password Optional. The password on the fromhost for authentication. The method does not transmit the password in plaintext
		* @param mechanism Optional. The mechanism to authenticate the username and password on the fromhost. Specify either MONGODB-CR or SCRAM-SHA-1.
		**/
		copyDatabase(fromdb: string, todb: string, fromhost?: string, username?: string, password?: string, mechanism?: string): void;
		/**
		* Creates a new collection explicitly.
		* e.g. db.createCollection("log", { capped : true, size : 5242880, max : 5000 } )
		* @param name The name of the collection to create.
		* @param options Optional. Configuration options for creating a capped collection or for preallocating space in a new collection.
		**/
		createCollection(name: string, options?: ICollectionOption): void;
		/**
		* Returns a document that contains information on in-progress operations for the database instance.
		* e.g. db.currentOp(
		*    {
		*      "waitingForLock" : true,
		*      $or: [
		*         { "op" : { "$in" : [ "insert", "update", "remove" ] } },
		*         { "query.findandmodify": { $exists: true } }
		*     ]
		*    }
		* )
		* @param operations Optional. Specify true to include operations on idle connections and system operations.
		**/
		currentOp(operations?: mongoBoolean): { inprog: ICurrentOp[] };
		/**
		* @param query Optional. Specify a document with query conditions to report only on operations that match the conditions.
		**/
		currentOp(query?): { inprog: ICurrentOp[] };
		/**
		* Removes the current database, deleting the associated data files.
		**/
		dropDatabase(): void;
		/**
		* Deprecated since version 3.0.
		* Provides the ability to run JavaScript code on the MongoDB server.
		* The helper db.eval() in the mongo shell wraps the eval command. Therefore, the helper method shares the characteristics and behavior of the underlying command with one exception: db.eval() method does not support the nolock option.
		* By default, db.eval() takes a global write lock while evaluating the JavaScript function. As a result, db.eval() blocks all other read and write operations to the database while the db.eval() operation runs.
		* To prevent the taking of the global write lock while evaluating the JavaScript code, use the eval command with nolock set to true. nolock does not impact whether the operations within the JavaScript code take write locks.
		* For long running db.eval() operation, consider using either the "eval command" with nolock: true or using other server side code execution options.
		* @param func A JavaScript function to execute.
		* @param arguments Optional. A list of arguments to pass to the JavaScript function. Omit if the function does not take arguments.
		**/
		eval(func: Function, ...arguments: any[]): any;
		/**
		* Forces the mongod to flush all pending write operations to the disk and locks the entire mongod instance to prevent additional writes until the user releases the lock with the db.fsyncUnlock() command. db.fsyncLock() is an administrative command.
		**/
		fsyncLock(): void;
		/**
		* Unlocks a mongod instance to allow writes and reverses the operation of a db.fsyncLock() operation. Typically you will use db.fsyncUnlock() following a database backup operation.
		**/
		fsyncUnlock(): void;
		/**
		* Returns a collection. This is useful for a collection whose name might interact with the shell itself, such names that begin with _ or that mirror the database commands.
		* @param name The name of the collection.
		**/
		getCollection(name: string): ICollection;
		/**
		* Returns an array of documents with collection information, i.e. collection name and options, for the current database.
		**/
		getCollectionInfos(filter?: any): { name: string; options: any }[];
		/**
		* Returns an array containing the names of all collections in the current database.
		**/
		getCollectionNames(): string[];
		/**
		* Specifies the level of write concern for confirming the success of previous write operation issued over the same connection and returns the error string for that operation.
		* When using db.getLastError(), clients must issue the db.getLastError() on the same connection as the write operation they wish to confirm.
		* @param w Optional. The write concern’s w value.
		* @param wtimeout Optional. The time limit in milliseconds.
		**/
		getLastError(w?: number | string, wtimeout?: number): string;
		/**
		* Specifies the level of write concern for confirming the success of previous write operation issued over the same connection and returns the document for that operation.
		* When using db.getLastErrorObj(), clients must issue the db.getLastErrorObj() on the same connection as the write operation they wish to confirm.
		* @param w Optional. The write concern’s w value.
		* @param wtimeout Optional. The time limit in milliseconds.
		**/
		getLastErrorObj(w?: number, wtimeout?: number): IErrorObj;
		/**
		* Returns the current verbosity settings. The verbosity settings determine the amount of Log Messages that MongoDB produces for each log message component.
		* If a component inherits the verbosity level of its parent, db.getLogComponents() displays -1 for the component’s verbosity.
		**/
		getLogComponents(): ILogComponents;
		/**
		* db.getMongo() runs when the shell initiates. Use this command to test that the mongo shell has a connection to the proper database instance.
		**/
		getMongo(): IMongo;
		/**
		* the current database name.
		**/
		getName(): string;
		/**
		* This output reports all errors since the last time the database received a resetError (also db.resetError()) command.
		**/
		getPrevError(): { err?: string; n: number; nPrev: number; ok: number; };
		/**
		* This method provides a wrapper around the database command “profile” and returns the current profiling level.
		**/
		getProfilingLevel(): number;
		/**
		* The current profile level and slowOpThresholdMs setting.
		**/
		getProfilingStatus(): { slowms: number; was: number };
		/**
		* A document with the status of the replica set, using data polled from the oplog. Use this output when diagnosing issues with replication.
		**/
		getReplicationInfo(): IReplicationInfo;
		/**
		* Used to return another database without modifying the db variable in the shell environment.
		* @param database The name of a MongoDB database.
		**/
		getSiblingDB(database: string): IDatabase;
		/**
		* Text output listing common methods on the db object.
		**/
		help(): void;
		/**
		* A document with information about the underlying system that the mongod or mongos runs on. Some of the returned fields are only included on some platforms.
		**/
		hostInfo(): IHostInfo;
		/**
		* A document that describes the role of the mongod instance.
		* If the mongod is a member of a replica set, then the ismaster and secondary fields report if the instance is the primary or if it is a secondary member of the replica set.
		**/
		isMaster(): IMasterInfo;
		/**
		* Terminates an operation as specified by the operation ID. To find operations and their corresponding IDs, see db.currentOp().
		* Terminate running operations with extreme caution. Only use db.killOp() to terminate operations initiated by clients and do not terminate internal database operations.
		* @param opid An operation ID
		**/
		killOp(opid: number): void;
		/**
		* Provides a list of all database commands. See the Database Commands document for a more extensive index of these options.
		**/
		listCommands(): void;
		/**
		* db.loadServerScripts() loads all scripts in the system.js collection for the current database into the mongo shell session.
		**/
		loadServerScripts(): void;
		/**
		* Ends the current authentication session. This function has no effect if the current session is not authenticated.
		**/
		logout(): void;
		/**
		* Provides a wrapper around the db.collection.stats() method. Returns statistics from every collection separated by three hyphen characters.
		**/
		printCollectionStats(): void;
		/**
		* Prints a formatted report of the replica set member’s oplog. The displayed report formats the data returned by db.getReplicationInfo(). 
		**/
		printReplicationInfo(): void;
		/**
		* Prints a formatted report of the sharding configuration and the information regarding existing chunks in a sharded cluster.
		**/
		printShardingStatus(verbose?: mongoBoolean): void;
		/**
		* Returns a formatted report of the status of a replica set from the perspective of the secondary member of the set. The output is identical to that of rs.printSlaveReplicationInfo().
		**/
		printSlaveReplicationInfo(): void;
		/**
		* db.repairDatabase() provides a wrapper around the database command repairDatabase, and has the same effect as the run-time option mongod --repair option, limited to only the current database. See repairDatabase for full documentation.
		* During normal operations, only use the repairDatabase command and wrappers including db.repairDatabase() in the mongo shell and mongod --repair, to compact database files and/or reclaim disk space. Be aware that these operations remove and do not save any corrupt data during the repair process.
		* If you are trying to repair a replica set member, and you have access to an intact copy of your data (e.g. a recent backup or an intact member of the replica set), you should restore from that intact copy, and not use repairDatabase.
		**/
		repairDatabase(): void;
		/**
		* Resets the error message returned by db.getPrevError or getPrevError. Provides a wrapper around the resetError command.
		**/
		resetError(): void;
		/**
		* Provides a helper to run specified database commands. This is the preferred method to issue database commands, as it provides a consistent interface between the shell and drivers.
		* @param cmd A database command, specified as a string
		**/
		runCommand(cmd: string): any;
		/**
		* @param cmdObj A database command, specified in document form, e.g. {"listCollections":1}
		**/
		runCommand(cmdObj: Object): any;
		adminCommand(cmdObj: string | Object): any;
		_adminCommand(cmdObj: string | Object): any;

		/**
		* another way to run command in old version of mongodb
		**/
		$cmd: { findOne: Function };

		/**
		* Provides a wrapper around the buildInfo database command. buildInfo returns a document that contains an overview of parameters used to compile this mongod instance.
		**/
		serverBuildInfo(): any;
		/**
		* Wraps the getCmdLineOpts database command.
		* Returns a document that reports on the arguments and configuration options used to start the mongod or mongos instance.
		**/
		serverCmdLineOpts(): { argv: string[], ok: number, parsed: any };
		/**
		* Returns a document that provides an overview of the database process’s state.
		* Changed in version 3.0: The server status output no longer includes the workingSet, indexCounters, and recordStats sections.
		* @param excludeFields Optional. Field to exclude. e.g. db.serverStatus( { repl: 0, locks: 0 } ) or db.serverStatus( { metrics: 0, locks: 0 } )
		**/
		serverStatus(excludeFields?: IField): any;
		/**
		* Sets a single verbosity level for log messages.
		* @param level The log verbosity level. The verbosity level can range from 0 to 5. To inherit the verbosity level of the component’s parent, you can also specify -1.
		* @param component Optional. The name of the component for which to specify the log verbosity level. One of the following: accessControl,command,control,geo,index,network,query,replication,sharding,storage,storage.journal,write
		**/
		setLogLevel(level: number, component?: string): void;
		/**
		* Modifies the current database profiler level used by the database profiling system to capture data about performance. The method provides a wrapper around the database command profile.
		* @param level Specifies a profiling level, which is either 0 for no profiling, 1 for only slow operations, or 2 for all operations.
		* @param slowms Optional. Sets the threshold in milliseconds for the profile to consider a query or operation to be slow.
		**/
		setProfilingLevel(level: number, slowms?: number): void;
		/**
		* Shuts down the current mongod or mongos process cleanly and safely.
		* This operation fails when the current database is not the admin database.
		* This command provides a wrapper around the shutdown.
		**/
		shutdownServer(options?: { timeoutSecs?: number }): void;
		/**
		* Returns statistics that reflect the use state of a single database.
		* @param scale Optional. The scale at which to deliver results. Unless specified, this command returns all data in bytes.
		**/
		stats(scale?: number): any;
		/**
		* The version of the mongod or mongos instance.
		**/
		version(): string;
		/**
		* Allows a user to authenticate to the database from within the shell. db.auth() returns 0 when authentication is not successful, and 1 when the operation is successful.
		* @param username Specifies an existing username with access privileges for this database.
		* @param password Specifies the corresponding password.
		* @param mechanism Optional. Specifies the authentication mechanism used. Defaults to either: SCRAM-SHA-1 on new 3.0, MONGODB-CR otherwise.
		* @param digestPassword Optional. Determines whether the server receives digested or undigested password. Set to false to specify undigested password. For use with SASL/LDAP authentication since the server must forward an undigested password to saslauthd.
		**/
		auth(username: string, password: string): number;
		auth(options: { user: string, pwd: string, mechanism?: string, digestPassword: mongoBoolean }): number;
		/**
		* Creates a new user for the database where the method runs. db.createUser() returns a duplicate user error if the user already exists on the database.
		* @param user The document with authentication and access information about the user to create.
		* @param writeConcern Optional. The level of write concern for the creation operation.
		**/
		createUser(user: IUser, writeConcern?: IWriteConcern);
		/**
		* To create legacy (2.2. and earlier) privilege documents
		* Deprecated since version 2.4: The roles parameter replaces the readOnly parameter for db.addUser(). 2.4 also adds the otherDBRoles and userSource fields to documents in the system.users collection.
		**/
		addUser(user: string, pwd: string, readonly?: mongoBoolean);
		/**
		* Use db.addUser() to add privilege documents to the system.users collection in a database, which creates database credentials in MongoDB.
		* Changed in version 2.4: The schema of system.users changed in 2.4 to accommodate a more sophisticated privilege model. In 2.4 db.addUser() supports both forms of privilege documents.
		**/
		addUser(user: IUser);
		/**
		* Updates the user’s profile on the database on which you run the method. An update to a field completely replaces the previous field’s values. This includes updates to the user’s roles array.
		* When you update the roles array, you completely replace the previous array’s values. To add or remove roles without replacing all the user’s existing roles, use the db.grantRolesToUser() or db.revokeRolesFromUser() methods.
		* @param username The name of the user to update.
		* @param update A document containing the replacement data for the user. This data completely replaces the corresponding data for the user.
		* @param writeConcern Optional. The level of write concern for the update operation. 
		**/
		updateUser(username: string, update: { customData?: any; roles?: (string | { role: string, db: string })[], pwd?: string }, writeConcern?: IWriteConcern);
		/**
		* Updates a user’s password. Run the method in the database where the user is defined, i.e. the database you created the user.
		* @param username Specifies an existing username with access privileges for this database.
		* @param password Specifies the corresponding password.
		* @param writeConcern Optional. The level of write concern for the update operation. 
		**/
		changeUserPassword(username: string, password: string, writeConcern?: IWriteConcern);
		// changeUserPassword(username:string, password:string, mechanism?:string, digestPassword?:mongoBoolean);
		// * @param mechanism Optional. Specifies the authentication mechanism used. Defaults to either: SCRAM-SHA-1 on new 3.0, MONGODB-CR otherwise.
		// * @param digestPassword Optional. Determines whether the server receives digested or undigested password. Set to false to specify undigested password. For use with SASL/LDAP authentication since the server must forward an undigested password to saslauthd.
		/**
		* Removes the specified username from the database.
		* @param username The database username.
		**/
		removeUser(username: string);
		/**
		* Removes all users from the current database.
		* @param writeConcern Optional. The level of write concern for the removal operation. 
		**/
		dropAllUsers(writeConcern?: IWriteConcern);
		/**
		* Removes the user from the current database.
		* @param username The name of the user to remove from the database.
		* @param writeConcern Optional. The level of write concern for the removal operation. 
		**/
		dropUser(username: string, writeConcern?: IWriteConcern);
		/**
		* Grants additional roles to a user.
		* @param username The name of the user to whom to grant roles.
		* @param roles An array of additional roles to grant to the user. Available build-in roles: read, readWrite, dbAdmin, dbOwner, userAdmin, clusterAdmin, clusterManager, clusterMonitor, hostManager, backup, restore, readAnyDatabase, readWriteAnyDatabase, userAdminAnyDatabase, dbAdminAnyDatabase, root
		* @param writeConcern Optional. The level of write concern for the modification.
		**/
		grantRolesToUser(username: string, roles: any[], writeConcern?: IWriteConcern);
		/**
		* Removes a one or more roles from a user on the current database.
		* @param username The name of the user from whom to revoke roles.
		* @param roles The roles to remove from the user. Available build-in roles: read, readWrite, dbAdmin, dbOwner, userAdmin, clusterAdmin, clusterManager, clusterMonitor, hostManager, backup, restore, readAnyDatabase, readWriteAnyDatabase, userAdminAnyDatabase, dbAdminAnyDatabase, root
		* @param Optional. The level of write concern for the modification.
		**/
		revokeRolesFromUser(username: string, roles: any[], writeConcern?: IWriteConcern);
		/**
		* Returns user information for a specified user. Run this method on the user’s database. The user must exist on the database on which the method runs.
		* @param username The name of the user for which to retrieve information.
		**/
		getUser(username: string): IUser;
		/**
		* Returns information for all the users in the database.
		**/
		getUsers(): IUser[];
		/**
		* Creates a role in a database. You can specify privileges for the role by explicitly listing the privileges or by having the role inherit privileges from other roles or both. The role applies to the database on which you run the method.
		* @param role A document containing the name of the role and the role definition
		* @param writeConcern Optional. The level of write concern to apply to this operation.
		**/
		createRole(role: IRole, writeConcern?: IWriteConcern);
		/**
		* Updates a user-defined role. The db.updateRole() method must run on the role’s database.
		* An update to the privileges or roles array completely replaces the previous array’s values.
		* @param rolename The name of the user-defined role to update.
		* @param update A document containing the replacement data for the role. This data completely replaces the corresponding data for the role.
		* @param writeConcern Optional. The level of write concern to apply to this operation.
		**/
		updateRole(rolename: string, update: { privileges?: any[]; roles?: any[] }, writeConcern?: IWriteConcern);
		/**
		* Deletes a user-defined role from the database on which you run the method.
		* @param rolename The name of the user-defined role to remove from the database.
		* @param writeConcern Optional. The level of write concern to apply to this operation.
		**/
		dropRole(rolename: string, writeConcern?: IWriteConcern);
		/**
		* Deletes all user-defined roles on the database where you run the method.
		* @param writeConcern Optional. The level of write concern to apply to this operation.
		**/
		dropAllRoles(writeConcern?: IWriteConcern): number;
		/**
		* Grants additional privileges to a user-defined role.
		* @param rolename The name of the role to grant privileges to.
		* @param privileges The privileges to add to the role. e.g. [{ resource: { db: "myApp" , collection: "" }, actions: [ "find", "createCollection", "dbStats", "collStats" ] }].
		* @param writeConcern Optional. The level of write concern to apply to this operation.
		**/
		grantPrivilegesToRole(rolename: string, privileges: IPrivilege[], writeConcern?: IWriteConcern);
		/**
		* Removes the specified privileges from the user-defined role on the database where the method runs. 
		* @param rolename The name of the user-defined role from which to revoke privileges.
		* @param privileges An array of privileges to remove from the role. e.g. [{ resource: { db: "myApp" , collection: "" }, actions: [ "find", "createCollection", "dbStats", "collStats" ] }].
		* @param writeConcern Optional. The level of write concern to apply to this operation.
		**/
		revokePrivilegesFromRole(rolename: string, privileges: IPrivilege[], writeConcern?: IWriteConcern);
		/**
		* Grants roles to a user-defined role.
		* @param rolename The name of the role to which to grant sub roles.
		* @param roles An array of roles from which to inherit.
		* @param writeConcern Optional. The level of write concern to apply to this operation.
		**/
		grantRolesToRole(rolename: string, roles: any[], writeConcern?: IWriteConcern);
		/**
		* Removes the specified inherited roles from a role.
		* @param rolename The name of the role from which to revoke roles.
		* @param roles The inherited roles to remove.
		* @param writeConcern Optional. The level of write concern to apply to this operation.
		**/
		revokeRolesFromRole(rolename: string, roles: any[], writeConcern?: IWriteConcern);
		/**
		* Returns the roles from which this role inherits privileges. Optionally, the method can also return all the role’s privileges.
		* Run db.getRole() from the database that contains the role. The command can retrieve information for both user-defined roles and built-in roles.
		* @param rolename The name of the role.
		* @param showPrivileges Optional. If true, returns the role’s privileges. Pass this argument as a document: {showPrivileges: true}.
		**/
		getRole(rolename: string, showPrivileges?: { showPrivileges: mongoBoolean }): IRole;
		/**
		* Returns information for all the roles in the database on which the command runs. The method can be run with or without an argument.
		* If run without an argument, db.getRoles() returns inheritance information for the database’s user-defined roles.
		* @param rolesInfo Set this field to 1 to retrieve all user-defined roles.
		* @param showPrivileges Optional. Set the field to true to show role privileges, including both privileges inherited from other roles and privileges defined directly. By default, the command returns only the roles from which this role inherits privileges and does not return specific privileges.
		* @param showBuiltinRoles Optional. Set to true to display built-in roles as well as user-defined roles.
		**/
		getRoles(options?: { rolesInfo?: number, showPrivileges?: mongoBoolean, showBuiltinRoles?: mongoBoolean }): IRole[];
	}

	interface IReplication {
		/**
		* Adds a member to a replica set. To run the method, you must connect to the primary of the replica set.
		* @param host The new member to add to the replica set.specify the hostname and optionally the port number for the new member.
		* @param Optional. Applies only if the <host> value is a string. If true, the added host is an arbiter.
		**/
		add(host: string, arbiterOnly?: mongoBoolean);
		/**
		* @param hostObj specify a replica set member configuration document as found in the members array. You must specify _id and the host fields in the member configuration document. e.g. { host: "mongodbd4.example.net:27017", priority: 0 }  
		**/
		add(hostObj: any);
		/**
		* Adds a new arbiter to an existing replica set.
		* @param host Specifies the hostname and optionally the port number of the arbiter member to add to replica set.
		**/
		addArb(host: string);
		/**
		* Returns a document that contains the current replica set configuration.
		* The method wraps the replSetGetConfig command.
		**/
		conf(): { _id: string; version: number; members: any[]; settings: any };
		/**
		* Makes the current replica set member ineligible to become primary for the period specified.
		* @param seconds The duration the member is ineligible to become primary.
		**/
		freeze(seconds: number);
		/**
		* Returns a basic help text for all of the replication related shell functions.
		**/
		help();
		/**
		* Initiates a replica set. Optionally takes a configuration argument in the form of a document that holds the configuration of a replica set.
		* @param configuration Optional. A document that specifies configuration settings for the new replica set. If a configuration is not specified, MongoDB uses a default configuration.
		**/
		initiate(configuration?: any);
		/**
		* Prints a formatted report of the replica set member’s oplog. The displayed report formats the data returned by db.getReplicationInfo(). [1] The output of rs.printReplicationInfo() is identical to that of db.printReplicationInfo().
		**/
		printReplicationInfo();
		/**
		* Returns a formatted report of the status of a replica set from the perspective of the secondary member of the set. The output is identical to that of db.printSlaveReplicationInfo().
		**/
		printSlaveReplicationInfo();
		/**
		* Reconfigures an existing replica set, overwriting the existing replica set configuration. To run the method, you must connect to the primary of the replica set.
		* Using rs.reconfig() with { force: true } can lead to rollback of committed writes. Exercise caution when using this option.
		* @param configuration A document that specifies the configuration of a replica set.
		* @param force Optional. If set as { force: true }, this forces the replica set to accept the new configuration even if a majority of the members are not accessible. Use with caution, as this can lead to rollback situations.
		**/
		reconfig(configuration: any, force?: { force: mongoBoolean });
		/**
		* Removes the member described by the hostname parameter from the current replica set. This function will disconnect the shell briefly and forces a reconnection as the replica set renegotiates which member will be primary. As a result, the shell will display an error even if this command succeeds.
		* @param hostname The hostname of a system in the replica set.
		**/
		remove(hostname: string);
		/**
		* Provides a shorthand for the following operation:
		* db.getMongo().setSlaveOk()
		**/
		slaveOk();
		/**
		* This output reflects the current status of the replica set, using data derived from the heartbeat packets sent by the other members of the replica set.
		**/
		status();
		/**
		* Forces the primary of the replica set to become a secondary, triggering an election for primary. The method steps down the primary for a specified number of seconds; during this period, the stepdown member is ineligible from becoming primary.
		* The method only steps down the primary if an electable secondary is up-to-date with the primary, waiting up to 10 seconds for a secondary to catch up.
		* @param stepDownSecs Optional. The number of seconds to step down the primary, during which time the stepdown member is ineligible from becoming primary. If this parameter is unspecified, the method uses the default value of 60 seconds.
		* @param secondaryCatchUpPeriodSecs Optional. The number of seconds that mongod will wait for an electable secondary to catch up to the primary. When specified, secondaryCatchUpPeriodSecs overrides the default wait time of 10 seconds.
		**/
		stepDown(stepDownSecs?: number, secondaryCatchUpPeriodSecs?: number);
		/**
		* Provides a wrapper around the replSetSyncFrom, which allows administrators to configure the member of a replica set that the current member will pull data from. Specify the name of the member you want to replicate from in the form of [hostname]:[port].
		* @param server in the form of "[hostname]:[port]".
		**/
		syncFrom(server: string);
	}

	interface ISharding {
		/**
		* Runs a database command against the admin database of a mongos instance.
		* @param command A database command to run against the admin database.
		* @param checkMongos Require verification that the shell is connected to a mongos instance.
		**/
		_adminCommand(command: string, checkMongos?: mongoBoolean);
		/**
		* Reports on the active balancer lock, if it exists.
		* Returns:	null if lock document does not exist or no lock is not taken. Otherwise, returns the lock document.
		**/
		getBalancerLockDetails(): any;
		/**
		* Verifies that a namespace name is well formed. If the namespace is well formed, the sh._checkFullName() method exits with no message.
		* @param namespace The namespace of a collection. The namespace is the combination of the database name and the collection name. Enclose the namespace in quotation marks.
		**/
		_checkFullName(namespace: string);
		/**
		* The sh._checkMongos() method throws an error message if the mongo shell is not connected to a mongos instance. Otherwise it exits (no return document or return code).
		**/
		_checkMongos();
		/**
		* Returns information on the last migration performed on the specified database or collection.
		* @param namespace The namespace of a database or collection within the current database.
		**/
		_lastMigration(namespace?: string): ILastMigration;
		/**
		* Adds a database instance or replica set to a sharded cluster. The optimal configuration is to deploy shards across replica sets. This method must be run on a mongos instance.
		* @param host The hostname of either a standalone database instance or of a replica set. [replica-set-name/]hostname[:port]. Include the port number if the instance is running on a non-standard port. Include the replica set name if the instance is a replica set, as explained below.
		**/
		addShard(host: string);
		/**
		* Associates a shard with a tag or identifier. MongoDB uses these identifiers to direct chunks that fall within a tagged range to specific shards. sh.addTagRange() associates chunk ranges with tag ranges.
		* @param shard The name of the shard to which to give a specific tag.
		* @param tag The name of the tag to add to the shard.
		**/
		addShardTag(shard: string, tag: string);
		/**
		* Attaches a range of shard key values to a shard tag created using the sh.addShardTag() method.
		* @param namespace The namespace of the sharded collection to tag.
		* @param minimum The minimum value of the shard key range to include in the tag. The minimum is an inclusive match. Specify the minimum value in the form of <fieldname>:<value>. This value must be of the same BSON type or types as the shard key.
		* @param maximum The maximum value of the shard key range to include in the tag. The maximum is an exclusive match. Specify the maximum value in the form of <fieldname>:<value>. This value must be of the same BSON type or types as the shard key.
		* @param tag The name of the tag to attach the range specified by the minimum and maximum arguments to.
		**/
		addTagRange(namespace: string, minimum: any, maximum: any, tag: string);
		/**
		* Removes a range of shard key values to a shard tag created using the sh.removeShardTag() method.
		* @param namespace The namespace of the sharded collection to tag.
		* @param minimum The minimum value of the shard key from the tag. Specify the minimum value in the form of <fieldname>:<value>. This value must be of the same BSON type or types as the shard key.
		* @param maximum The maximum value of the shard key range from the tag. Specify the maximum value in the form of <fieldname>:<value>. This value must be of the same BSON type or types as the shard key.
		* @param tag The name of the tag attached to the range specified by the minimum and maximum arguments to.
		**/
		removeTagRange(namespace: string, minimum: any, maximum: any, tag: string);
		/**
		* Disables the balancer for the specified sharded collection. This does not affect the balancing of chunks for other sharded collections in the same cluster.
		* @param namespace The namespace of the collection.
		**/
		disableBalancing(namespace: string);
		/**
		* Enables the balancer for the specified namespace of the sharded collection.
		* sh.enableBalancing() does not start balancing. Rather, it allows balancing of this collection the next time the balancer runs.
		* @param namespace The namespace of the collection.
		**/
		enableBalancing(namespace: string);
		/**
		* Enables sharding on the specified database. This does not automatically shard any collections but makes it possible to begin sharding collections using sh.shardCollection().
		* @param database The name of the database shard. Enclose the name in quotation marks.
		**/
		enableSharding(database: string);
		/**
		* String in form hostname:port
		**/
		getBalancerHost(): string;
		/**
		* sh.getBalancerState() returns true when the balancer is enabled and false if the balancer is disabled. This does not reflect the current state of balancing operations: use sh.isBalancerRunning() to check the balancer’s current state.
		**/
		getBalancerState(): boolean;
		/**
		* a basic help text for all sharding related shell functions.
		**/
		help(): void;
		/**
		* Returns true if the balancer process is currently running and migrating chunks and false if the balancer process is not running. Use sh.getBalancerState() to determine if the balancer is enabled or disabled.
		**/
		isBalancerRunning(): boolean;
		/**
		* Moves the chunk that contains the document specified by the query to the destination shard.
		* In most circumstances, allow the balancer to automatically migrate chunks, and avoid calling sh.moveChunk() directly.
		* @param namespace The namespace of the sharded collection that contains the chunk to migrate.
		* @param query An equality match on the shard key that selects the chunk to move.
		* @param destination The name of the shard to move.
		**/
		moveChunk(namespace: string, query: any, destination: string);
		/**
		* Removes the association between a tag and a shard. Only issue sh.removeShardTag() when connected to a mongos instance.
		* @param shard The name of the shard from which to remove a tag.
		* @param tag The name of the tag to remove from the shard.
		**/
		removeShardTag(shard: string, tag: string);
		/**
		* Enables or disables the balancer. Use sh.getBalancerState() to determine if the balancer is currently enabled or disabled and sh.isBalancerRunning() to check its current state.
		* @param state Set this to true to enable the balancer and false to disable it.
		**/
		setBalancerState(state: mongoBoolean);
		/**
		* Shards a collection using the key as a the shard key.
		* @param namespace The namespace of the collection to shard.
		* @param key A document that specifies the shard key to use to partition and distribute objects among the shards. A shard key may be one field or multiple fields. A shard key with multiple fields is called a “compound shard key.”
		* @param unique When true, ensures that the underlying index enforces a unique constraint. Hashed shard keys do not support unique constraints.
		**/
		shardCollection(namespace: string, key: any, unique?: mongoBoolean);
		/**
		* Splits a chunk at the shard key value specified by the query.
		* @param namespace The namespace (i.e. <database>.<collection>) of the sharded collection that contains the chunk to split.
		* @param query A query document that specifies the shard key value at which to split the chunk.
		**/
		splitAt(namespace: string, query: any);
		/**
		* Splits the chunk that contains the shard key value specified by the query at the chunk’s median point. sh.splitFind() creates two roughly equal chunks. To split a chunk at a specific point instead, see sh.splitAt().
		* @param namespace The namespace (i.e. <database>.<collection>) of the sharded collection that contains the chunk to split.
		* @param query A query document that specifies the shard key value that determines the chunk to split.
		**/
		splitFind(namespace: string, query: any);
		/**
		* Enables the balancer in a sharded cluster and waits for balancing to initiate.
		* @param timeout Milliseconds to wait.
		* @param interval Milliseconds to sleep each cycle of waiting.
		**/
		startBalancer(timeout?: number, interval?: number);
		/**
		* When run on a mongos instance, prints a formatted report of the sharding configuration and the information regarding existing chunks in a sharded cluster. The default behavior suppresses the detailed chunk information if the total number of chunks is greater than or equal to 20.
		* @param verbose Optional. If true, the method displays details of the document distribution across chunks when you have 20 or more chunks.
		**/
		status(verbose?: mongoBoolean);
		/**
		* Disables the balancer in a sharded cluster and waits for balancing to complete.
		* @param timeout Milliseconds to wait.
		* @param interval Milliseconds to sleep each cycle of waiting.
		**/
		stopBalancer(timeout?: number, interval?: number);
		/**
		* Waits for a change in the state of the balancer.
		* @param wait Optional. Set to true to ensure the balancer is now active. The default is false, which waits until balancing stops and becomes inactive.
		* @param timeout Optional. Milliseconds to wait.
		* @param interval Optional. Milliseconds to sleep.
		**/
		waitForBalancer(wait?: mongoBoolean, timeout?: number, interval?: number);
		/**
		* Internal method that waits until the balancer is not running.
		* @param timeout Milliseconds to wait.
		* @param interval Milliseconds to sleep.
		**/
		waitForBalancerOff(timeout?: number, interval?: number);
		/**
		* Waits until the specified distributed lock changes state. sh.waitForDLock() is an internal method 
		* @param lockname The name of the distributed lock.
		* @param wait Optional. Set to true to ensure the balancer is now active. Set to false to wait until balancing stops and becomes inactive.
		* @param timeout Optional. Milliseconds to wait.
		* @param interval Optional. Milliseconds to sleep.
		**/
		waitForDLock(lockname: string, wait?: mongoBoolean, timeout?: number, interval?: number);
		/**
		* sh.waitForPingChange() waits for a change in ping state of one of the activepings, and only returns when the specified ping changes state.
		* @param activePings An array of active pings from the mongos collection.
		* @param timeout Number of milliseconds to wait for a change in ping state.
		* @param interval Number of milliseconds to sleep in each waiting cycle.
		**/
		waitForPingChange(activePings: any[], timeout?: number, interval?: number);
	}

	interface ILastMigration {
		_id: any;
		server: string;
		clientAddr: string;
		time: any;
		what: any;
		ns: string;
		details: any;
	}

	interface IMongo {
		/**
		* Provides access to database objects from the mongo shell or from a JavaScript file.
		* @param database The name of the database to access.
		**/
		getDB(database: string): IDatabase;
		getDBNames(): string[];
		/**
		* See Read Preference for an introduction to read preferences in MongoDB. Use getReadPrefMode() to return the current read preference mode
		**/
		getReadPrefMode(): string;
		/**
		* Returns:	The current read preference tag set for the Mongo() connection object.
		* See Read Preference for an introduction to read preferences and tag sets in MongoDB. Use getReadPrefTagSet() to return the current read preference tag set
		**/
		getReadPrefTagSet(): Object;
		/**
		* Call the setReadPref() method on a Mongo connection object to control how the client will route all queries to members of the replica set.
		* @param mode One of the following read preference modes: primary, primaryPreferred, secondary, secondaryPreferred, or nearest.
		* @param tagSet Optional. A tag set used to specify custom read preference modes. e.g. [ {'dc': 'east'} ]
		**/
		setReadPref(mode: string, tagSet?: any[]);
		/**
		* For the current session, this command permits read operations from non-master (i.e. slave or secondary) instances
		**/
		setSlaveOk(isSlave?: mongoBoolean);
	}

	interface IPlanCache {
		/**
		* Displays the methods available to view and modify a collection’s query plan cache.
		**/
		help(): void;
		/**
		* Displays the query shapes for which cached query plans exist.
		* The query optimizer only caches the plans for those query shapes that can have more than one viable plan.
		**/
		listQueryShapes(): { query: any; sort: any; projection: any }[];
		/**
		* Displays the cached query plans for the specified query shape.
		* The query optimizer only caches the plans for those query shapes that can have more than one viable plan.
		* @param query The query predicate of the query shape. Only the structure of the predicate, including the field names, are significant to the shape; the values in the query predicate are insignificant.
		* @param projection Optional. The projection associated with the query shape. Required if specifying the sort parameter
		* @param sort Optional. The sort associated with the query shape.
		**/
		getPlansByQuery(query: any, projection?: IField, sort?: IField): any[];
		/**
		* Clears the cached query plans for the specified query shape.
		* @param query The query predicate of the query shape. Only the structure of the predicate, including the field names, are significant to the shape; the values in the query predicate are insignificant.
		* @param projection Optional. The projection associated with the query shape. Required if specifying the sort parameter
		* @param sort Optional. The sort associated with the query shape.
		**/
		clearPlansByQuery(query: any, projection?: IField, sort?: IField): void;
		/**
		* Removes all cached query plans for a collection.
		**/
		clear(): void;
	}

	interface IBulk {
		/**
		* Adds an insert operation to a bulk operations list.
		* @param doc Document to insert. The size of the document must be less than or equal to the maximum BSON document size (16 megabytes)
		**/
		insert(doc: Object);
		/**
		* Specifies a query condition for an update or a remove operation.
		* @param query Specifies a query condition using Query Selectors to select documents for an update or a remove operation. To specify all documents, use an empty document {}.With update operations, the sum of the query document and the update document must be less than or equal to the maximum BSON document size (16 megabytes).With remove operations, the query document must be less than or equal to the maximum BSON document size (16 megabytes).
		**/
		find(query: any): IBulkFindOp;
		/**
		* Executes the list of operations built by the Bulk() operations builder.
		* @param writeConcern Optional. Write concern document for the bulk operation as a whole. Omit to use default. For a standalone mongod server, the write concern defaults to { w: 1 }. With a replica set, the default write concern is { w: 1 } unless modified as part of the replica set configuration
		**/
		execute(writeConcern?: IWriteConcern);
		/**
		* Returns an array of write operations executed through Bulk.execute(). The returned write operations are in groups as determined by MongoDB for execution. For information on how MongoDB groups the list of bulk write operations, see Bulk.execute() Behavior.
		* Only use Bulk.getOperations() after a Bulk.execute(). Calling Bulk.getOperations() before you call Bulk.execute() will result in an incomplete list.
		**/
		getOperations(): { originalZeroIndex: number; batchType: number; operations: any[] }[];
		/**
		* Returns a JSON document that contains the number of operations and batches in the Bulk() object.
		**/
		tojson(): string;
		/**
		* Returns as a string a JSON document that contains the number of operations and batches in the Bulk() object.
		**/
		toString(): string;
	}

	interface IBulkFindOp {
		/**
		* Adds a single document remove operation to a bulk operations list. Use the Bulk.find() method to specify the condition that determines which document to remove. The Bulk.find.removeOne() limits the removal to one document. To remove multiple documents, see Bulk.find.remove().
		**/
		removeOne();
		/**
		* Adds a remove operation to a bulk operations list. Use the Bulk.find() method to specify the condition that determines which documents to remove. The Bulk.find.remove() method removes all matching documents in the collection. To limit the remove to a single document, see Bulk.find.removeOne().
		**/
		remove();
		/**
		* Adds a single document replacement operation to a bulk operations list. Use the Bulk.find() method to specify the condition that determines which document to replace. The Bulk.find.replaceOne() method limits the replacement to a single document.
		* @param replacement A replacement document that completely replaces the existing document. Contains only field and value pairs.
		**/
		replaceOne(replacement: any);
		/**
		* Adds a single document update operation to a bulk operations list. The operation can either replace an existing document or update specific fields in an existing document.
		* Use the Bulk.find() method to specify the condition that determines which document to update. The Bulk.find.updateOne() method limits the update or replacement to a single document. To update multiple documents, see Bulk.find.update().
		* @param update An update document that updates specific fields or a replacement document that completely replaces the existing document. An update document only contains update operator expressions. A replacement document contains only field and value pairs.
		**/
		updateOne(update: any);
		/**
		* Adds a multi update operation to a bulk operations list. The method updates specific fields in existing documents.
		* Use the Bulk.find() method to specify the condition that determines which documents to update. The Bulk.find.update() method updates all matching documents. To specify a single document update, see Bulk.find.updateOne().
		* @param update Specifies the fields to update. Only contains update operator expressions.
		**/
		update(update: any);
		/**
		* Sets the upsert option to true for an update or a replacement operation
		* e.g. Bulk.find(query).upsert().update(update); Bulk.find(query).upsert().updateOne(update); Bulk.find(query).upsert().replaceOne(replacement);
		**/
		upsert(): IBulkFindOp;
	}

	//≈ // for expand interface
	interface IUser {
		_id?: any;
		user: string;
		pwd?: string;
		customData?: any;
		/**
		* Build-in roles: read readWrite dbAdmin dbOwner userAdmin clusterAdmin clusterManager clusterMonitor hostManager backup restore readAnyDatabase readWriteAnyDatabase userAdminAnyDatabase dbAdminAnyDatabase root
		**/
		roles: (string | { role: string; db: string })[];
	}
	//≈
	//≈ // for expand interface
	interface IRole {
		role: string;
		privileges: IPrivilege[];
		roles: any[];
	}
	//≈
	//≈ // for expand interface
	interface IPrivilege {
		resource: { db: string; collection: string } | { cluster: boolean } | { anyResource: boolean };
		actions: string[]
	}
	//≈
	//≈ // for expand interface
	interface ICollectionOption {
		/**
		* Optional. To create a capped collection, specify true. If you specify true, you must also set a maximum size in the size field.
		**/
		capped?: mongoBoolean;
		/**
		* Optional. Specify false to disable the automatic creation of an index on the _id field.
		**/
		autoIndexId?: mongoBoolean;
		/**
		* Optional. Specify a maximum size in bytes for a capped collection. Once a capped collection reaches its maximum size, MongoDB removes the older documents to make space for the new documents. The size field is required for capped collections and ignored for other collections.
		**/
		size?: number;
		/**
		* Optional. The maximum number of documents allowed in the capped collection. The size limit takes precedence over this limit. If a capped collection reaches the size limit before it reaches the maximum number of documents, MongoDB removes old documents. If you prefer to use the max limit, ensure that the size limit, which is required for a capped collection, is sufficient to contain the maximum number of documents
		**/
		max?: number;
		/**
		* Optional. Available for the MMAPv1 storage engine only.
		**/
		usePowerOf2Sizes?: mongoBoolean;
		/**
		* Optional. Available for the MMAPv1 storage engine only.
		**/
		noPadding?: mongoBoolean;
		/**
		* New in version 3.0.
		* Optional. Available for the WiredTiger storage engine only. { storage-engine-name: options }
		**/
		storageEngine?: { [storageEngineMame: string]: any };
		/**
		* The validator option takes a document that specifies the validation rules or expressions. You can specify the expressions using the same operators as the query operators with the exception of the following operators: $geoNear, $near, $nearSphere, $text, $where.
		**/
		validator?: any;
		/**
		* The validationLevel determines how strictly MongoDB applies the validation rules to existing documents during an update.
		* avaliable values: off, strict, moderate
		**/
		validationLevel?: string;
		/**
		* The validationAction option determines whether to error on invalid documents or just warn about the violations but allow invalid documents.
		* avaliable values: error, warn
		**/
		validationAction?: string;
	}
	//≈
	//≈ // for expand interface
	interface IStatsOption {
		/**
		* Optional. The scale used in the output to display the sizes of items. By default, output displays sizes in bytes. To display kilobytes rather than bytes, specify a scale value of 1024.
		**/
		scale?: number;
		/**
		* Optional. If true, db.collection.stats() returns index details in addition to the collection stats.Defaults to false.
		**/
		indexDetails?: mongoBoolean;
		/**
		* Optional. If indexDetails is true, use indexDetailsKey to filter index details by specifying the index key. Use getIndexes() to discover index keys. You cannot use indexDetailsKey with indexDetailsName.
		**/
		indexDetailsKey?: IField;
		/**
		* Optional. If indexDetails is true, use indexDetailsName to filter index details by specifying the index name. Use getIndexes() to discover index names. You cannot use indexDetailsName with indexDetailsKey.
		**/
		indexDetailsName?: string;
	}
	//≈
	//≈ // for expand interface
	interface IMapReduceOption {
		/**
		* Specifies the location of the result of the map-reduce operation. You can output to a collection, output to a collection with an action, or output inline. You may output to a collection when performing map reduce operations on the primary members of the set; on secondary members you may only use the inline output.
		**/
		out: string | any;
		/**
		* Specifies the selection criteria using query operators for determining the documents input to the map function.
		**/
		query?: any;
		/**
		* Sorts the input documents. This option is useful for optimization. For example, specify the sort key to be the same as the emit key so that there are fewer reduce operations. The sort key must be in an existing index for this collection.
		**/
		sort?: IField;
		/**
		* Specifies a maximum number of documents for the input into the map function.
		**/
		limit?: number;
		/**
		* Optional. Follows the reduce method and modifies the output.
		**/
		finalize?: (key, reducedValue) => any;
		/**
		* Specifies global variables that are accessible in the map, reduce and finalize functions.
		**/
		scope?: any;
		/**
		* Specifies whether to convert intermediate data into BSON format between the execution of the map and reduce functions. Defaults to false.
		**/
		jsMode?: mongoBoolean;
		/**
		* Specifies whether to include the timing information in the result information. The verbose defaults to true to include the timing information.
		**/
		verbose?: mongoBoolean;
		/**
		 * New in version 3.2
		 * Enables mapReduce to bypass document validation during the operation. This lets you insert documents that do not meet the validation requirements.
		 */
		bypassDocumentValidation?: mongoBoolean;
	}
	//≈
	interface IInsertResult { nInserted: number; writeError?: any; writeConcernError?: any }
	interface IRemoveResult { nRemoved: number; writeError?: any; writeConcernError?: any }
	interface ISaveResult { nMatched?: number, nUpserted?: number, nModified?: number; nInserted?: number; writeError?: any; writeConcernError?: any }
	interface IUpdateResult { nMatched: number, nUpserted: number, nModified: number; writeError?: any; writeConcernError?: any }
	interface IErrorObj { connectionId: number; err?: string; n: number; ok: number; syncMillis: number; writtenTo: any }
	//≈ // for expand interface
	interface IGroupArg {
		/**
		* The field or fields to group. Returns a “key object” for use as the grouping key.
		**/
		key?: IField;
		/**
		* An aggregation function that operates on the documents during the grouping operation. These functions may return a sum or a count. The function takes two arguments: the current document and an aggregation result document for that group.
		**/
		reduce: (currentDoc, memo) => any;
		/**
		* Initializes the aggregation result document.
		**/
		initial: any;
		/**
		* Optional. Alternative to the key field. Specifies a function that creates a “key object” for use as the grouping key. Use keyf instead of key to group by calculated fields rather than existing document fields.
		**/
		keyf?: (doc) => { [key: string]: any };
		/**
		* The selection criteria to determine which documents in the collection to process. If you omit the cond field, db.collection.group() processes all the documents in the collection for the group operation.
		**/
		cond?: any;
		/**
		* Optional. A function that runs each item in the result set before db.collection.group() returns the final value. This function can either modify the result document or replace the result document as a whole.
		**/
		finalize?: (result) => void;
	}
	//≈
	//≈ // for expand interface
	interface IField {
		[field: string]: string | mongoBoolean | Object;
	}
	//≈
	//≈ // for expand interface
	interface IFindAndModifyArg {
		/**
		* Optional. The selection criteria for the modification. The query field employs the same query selectors as used in the db.collection.find() method. Although the query may match multiple documents, findAndModify() will only select one document to modify.
		**/
		query?: any;
		/**
		* Optional. Determines which document the operation modifies if the query selects multiple documents. findAndModify() modifies the first document in the sort order specified by this argument.
		**/
		sort?: { [field: string]: number };
		/**
		* Must specify either the remove or the update field. Removes the document specified in the query field. Set this to true to remove the selected document . The default is false.
		**/
		remove?: mongoBoolean;
		/**
		* Must specify either the remove or the update field. Performs an update of the selected document. The update field employs the same update operators or field: value specifications to modify the selected document.
		**/
		update?: any;
		/**
		* Optional. When true, returns the modified document rather than the original. The findAndModify() method ignores the new option for remove operations. The default is false.
		**/
		new?: mongoBoolean;
		/**
		* Optional. A subset of fields to return. The fields document specifies an inclusion of a field with 1, as in: fields: { field1: 1, field2: 1, ... }
		**/
		fields?: { [field: string]: number };
		/**
		* Optional. Used in conjunction with the update field. When true, findAndModify() creates a new document if no document matches the query, or if documents match the query, findAndModify() performs an update. To avoid multiple upserts, ensure that the query fields are uniquely indexed.
		**/
		upsert?: mongoBoolean
		/**
		* New in version 3.2
		**/
		bypassDocumentValidation?: mongoBoolean;
	}
	//≈
	//≈ // for expand interface
	interface IIndex {
		key: IField;
		name: string;
		ns: string;
		v: number;
	}
	//≈
	//≈ // for expand interface
	interface IIndexOption {
		background?: mongoBoolean;
		unique?: mongoBoolean;
		name?: string;
		sparse?: mongoBoolean;
		expireAfterSeconds?: number;
		v?: number;
		storageEngine?: { [storageEngineName: string]: any };
		weights?: { [field: string]: number };
		default_language?: string;
		language_override?: string;
		textIndexVersion?: number;
		"2dsphereIndexVersion"?: number;
		bits?: number;
		min?: number;
		max?: number;
		bucketSize?: number;
		dropDups?: mongoBoolean;
		partialFilterExpression?: Object;
	}
	//≈
	//≈ // for expand interface
	interface IAggregateOption {
		explain?: mongoBoolean;
		allowDiskUse?: mongoBoolean;
		cursor?: { batchSize: number; };
		/**
		 * New in Version 3.2
		 */
		bypassDocumentValidation?: mongoBoolean;
		/**
		 * New in Version 3.2
		 */
		readConcern?: Object;
	}
	//≈
	//≈ // for expand interface
	interface IWriteConcern {
		w?: number | string;
		j?: mongoBoolean;
		wtimeout?: number;
	}
	//≈

	interface ICollStats {
		ns: string;
		count: number;
		size: number;
		avgObjSize: number;
		storageSize: number;
		numExtents?: number;
		nindexes: number;
		lastExtentSize?: number;
		userFlags?: number;
		totalIndexSize: number;
		indexSizes: { [indexName: string]: number };
		capped: boolean;
		max: number;
		maxSize: number;
		wiredTiger?: any;
		indexDetails: any;
		shards?: any;
		sharded?: boolean;
		nchunks?: number;
		paddingFactorNote?: string
	}

	interface ICurrentOp {
		desc: string;
		threadId: number;
		connectionId?: number;
		opid?: number;
		active: boolean;
		secs_running?: number;
		microsecs_running?: number;
		op?: string;
		ns?: string;
		insert?: any;
		query?: any;
		planSummary?: string;
		client?: string;
		locks?: any;
		waitingForLock?: boolean;
		msg?: string;
		progress?: {
			done: number;
			total: number;
		}
		killPending?: boolean;
		numYields?: number;
		fsyncLock?: boolean;
		info?: string;
		lockType?: string;
		lockStats?: {
			acquireCount: number;
			acquireWaitCount: number;
			timeAcquiringMicros: number;
			deadlockCount: number;
		}
	}

	interface ILogComponents {
		verbosity: number;
		accessControl: {
			verbosity: number;
		}
		command: {
			verbosity: number;
		},
		control: {
			verbosity: number;
		},
		geo: {
			verbosity: number;
		},
		index: {
			verbosity: number;
		},
		network: {
			verbosity: number;
		},
		query: {
			verbosity: number;
		},
		replication: {
			verbosity: number;
		},
		sharding: {
			verbosity: number;
		},
		storage: {
			verbosity: number;
			journal: {
				verbosity: number;
			}
		},
		write: {
			verbosity: number;
		}
	}

	interface IReplicationInfo {
		logSizeMB: number;
		usedMB: number;
		errmsg: string;
		oplogMainRowCount?: number;
		timeDiff?: number;
		timeDiffHours?: number;
		tFirst?: Timestamp;
		tLast?: Timestamp;
		now?: Timestamp;
	}

	interface IHostInfo {
		system: {
			hostname: string;
			cpuAddrSize: number;
			memSizeMB: number;
			numCores: number;
			cpuArch: string;
			numaEnabled: boolean;
		},
		os: {
			type: string;
			name: string;
			version: string;
		},
		extra: {
			versionString: string,
			libcVersion?: string;
			kernelVersion?: string;
			cpuFrequencyMHz: number;
			cpuFeatures: string;
			pageSize: number;
			numPages?: number;
			maxOpenFiles?: number;
		},
		ok: number;
	}

	interface IMasterInfo {
		ismaster: boolean;
		localTime: any;
		maxBsonObjectSize: number;
		maxMessageSizeBytes: number;
		maxWireVersion: number;
		maxWriteBatchSize: number;
		minWireVersion: number;
		ok: number;
	}

	type mongoBoolean = boolean | number;
}

interface ObjectIdConstructor {
	new (val?): ObjectId;
	(val?): ObjectId;
	fromDate(source: Date): ObjectId;
}

interface ObjectId {
	getTimestamp(): Timestamp;
	toString(): string;
    isObjectId: boolean;
	valueOf(): string;
    equals(id: ObjectId): boolean;
}

declare var ObjectId: ObjectIdConstructor;
declare var ObjectID: ObjectIdConstructor;

interface TimestampConstructor {
	new (time?: number, inc?: number): Timestamp;
	(time?: number, inc?: number): Timestamp;
}

interface Timestamp {
	tojson(): string;
	getTime(): number;
	getInc(): number;
	toString(): string;
}

declare var Timestamp: TimestampConstructor;

interface DateConstructor {
	timeFunc(theFunc, numTimes);
}

interface Date {
	tojson(): string;
}

declare var ISODate: (str?: string) => Date;

interface RegExpConstructor {
	escape(text): string;
}

interface RegExp {
	tojson(): string;
}

interface ArrayConstructor {
	contains(array, x): boolean;
	unique(array): any[];
	shuffle(array): any[];
	tojson(arr: any[], indent?, nohint?): string;
	fetchRefs(array, coll): any[];
	sum(array: number[]): number;
	avg(array: number[]): number;
	stdDev(array: number[]): number;
}

interface ObjectConstructor {
	extend(dst, src, deep?: boolean): any;
	merge(dst, src, deep?: boolean): any;
	keySet(obj): string[];
	bsonsize(obj: Object): number;
}

interface String {
	trim(): string;
	trimLeft(): string;
	trimRgith(): string;
	ltrim(): string;
	rtrim(): string;
	startsWith(str: string): boolean;
	endsWith(str: string): boolean;
	includes(str: string): boolean;
	pad(length: number, right?: boolean, chr?: string): string;
}

interface Number {
	toPercentStr(): string;
	zeroPad(width: number): string;
}

interface NumberLongConstructor {
	new (num: number | string): NumberLong;
	(num: number | string): NumberLong;
}

interface NumberLong {
	tojson(): string;
}

declare var NumberLong: NumberLongConstructor;

interface NumberIntConstructor {
	new (num): Number
	(num): Number
}

declare var NumberInt: NumberIntConstructor;

interface DoubleConstructor {
	new (num): Double
	(num): Double
}

interface Double {
	valueOf(): number
	tojson(): string
}

declare var Double: DoubleConstructor

interface DBRef {
	new (namespace: string, _id, database?: string): DBRef;
	(namespace: string, _id, database?: string): DBRef;
	fetch();
	tojson(): string;
	getDb();
	getCollection();
	getRef();
	getId();
	toString(): string;
}

declare var DBRef: DBRef;

interface Binary {
	new (sub_type: number, base64: string): Binary;
	(sub_type: number, base64: string): Binary;
    toUUID(): string;
    toJUUID(): string;
    toCSUUID(): string;
    toPYUUID(): string;
}

declare var Binary: Binary;

interface MapConstructor {
	new (): Map;
	(): Map;
	hash(val): string;
}

declare var Map: MapConstructor;

interface Map {
	put(key: string, value: any): any;
	get(key: string): any;
	values(): any[];
}

declare var rand: () => number; //for 2.4
declare var Random: Random;

interface Random {
	srand(s);
	rand(): number;
	randInt(): number;
	setRandomSeed(s?);
	genExp(mean): number;
	genNormal(mean, standardDeviation): number;
}

declare var Geo: Geo;

interface Geo {
	distance(a, b): number;
	sphereDistance(a, b): number;
}

declare function Code(func: Function, scope?: Object): Object;

declare function tojson(x, indent?, nohint?): string;
declare function tojsononeline(x): string;
declare function tojsonObject(x, indent?, nohint?): string;
declare function print(...x);
declare function printjson(x);
declare function printjsononeline(x);
declare function printArray(x: any[]);
declare function isString(x);
declare function isNumber(x);
declare function isObject(x);
declare function hex_md5(arg): string;
declare function chatty(s);
declare function friendlyEqual(a, b): boolean;
declare function argumentsToArray(a): any[];
declare function compare(l, r): number;
declare function compareOn(field): (l, r) => number;
declare function use(databaseName: string): void;
declare function sleep(milliseconds: number): void;
declare function emit(key, value): void;
declare function setVerboseShell(arg: boolean): void;
declare function UUID(hex: string): any;
declare function LUUID(hex: string): any;
declare function JUUID(hex: string): any;
declare function CSUUID(hex: string): any;
declare function PYUUID(hex: string): any;
declare function MD5(hex: string): any;
declare function BinData(sub_type: number, base64: string): any;
declare function Symbol(val): any;
declare function async(fn): () => any;
declare function await(promise): any;
declare var Promise: any;
declare var MinKey: any;
declare var MaxKey: any;

declare var DBQuery: {
	Option: {
		tailable: number;
		slaveOk: number;
		oplogReplay: number;
		noTimeout: number;
		awaitData: number;
		exhaust: number;
		partial: number;
	},
	/**
	 * DBQuery.shellBatchSize to change the number of iteration from the default value 20
	 */
	shellBatchSize: number;
}

declare var db: mongo.IDatabase;
declare var rs: mongo.IReplication;
declare var sh: mongo.ISharding;
declare var qb: mongo.IQueryBuilder;
declare var queryBuilder: mongo.IQueryBuilder;
