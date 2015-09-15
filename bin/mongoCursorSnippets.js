///<reference path='typings/node/node.d.ts'/>
var mongoForEachTemplates = [
    {
        caption: "forEach",
        snippet: "forEach((it)=> { \n      $1\n });",
        comment: 'Iterates the cursor to apply a JavaScript function to each document from the cursor.',
        example: "db.users.find().forEach( function(myDoc) { print( \"user: \" + myDoc.name ); } );",
        score: 1000
    }
];
var mongoMapTemplates = [
    {
        caption: "map",
        snippet: "map((it)=> { \n      $1\n      return it;\n });",
        comment: 'Applies function to each document visited by the cursor and collects the return values from successive application into an array.',
        example: "db.users.find().map( function(u) { return u.name; } );",
        score: 1000
    },
];
var mongoSortTemplates = [
    {
        caption: "sort",
        snippet: "sort({ ${2:sortField}:${3:-1} })",
        comment: 'Specifies the order in which the query returns matching documents.',
        example: "db.orders.find().sort({ amount: -1 })",
        score: 1000
    },
    {
        caption: "sortById",
        snippet: "sort({ _id:${2:1} })",
        comment: 'Sort by Id',
        example: "db.orders.find().sort({ _id: -1 })",
        score: 100
    },
    {
        caption: "sortAsInserted",
        snippet: "sort({ \\$natural:${2:1} })",
        comment: 'Specifies the order in which the query returns matching documents. Use $natural operator to return documents in the order they exist on disk',
        example: "db.orders.find().sort({ $natural: 1 })",
        score: 100
    },
    {
        caption: "sortAsInsertedDesc",
        snippet: "sort({ \\$natural:${2:-1} })",
        comment: 'Specifies the order in which the query returns matching documents. Use $natural operator to return documents in the reversed order they exist on disk',
        example: "db.orders.find().sort({ $natural: -1 })",
        score: 100
    },
    {
        caption: "first",
        snippet: "sort({ \\$natural:1 }).limit(${2:1})",
        comment: 'Return first N records. Use $natural operator to return documents in the order they exist on disk',
        example: "db.orders.find().sort({ $natural: 1 }).limit(n)",
        score: 100
    },
    {
        caption: "last",
        snippet: "sort({ \\$natural:-1 }).limit(${2:1})",
        comment: 'Return last N records. Use $natural operator to return documents in the reversed order they exist on disk',
        example: "db.orders.find().sort({ $natural: -1 }).limit(n)",
        score: 100
    },
];
var cursorTemplates = [];
var addMongoCodeTemplates = function (mongoMethod, templates) {
    var theTmpls = templates.map(function (it) {
        it.meta = "code template";
        it.isMongoTemplateCommand = true;
        it.methodDotName = "cursor." + mongoMethod; //for help url
        return it;
    });
    cursorTemplates = cursorTemplates.concat(templates);
};
var initMongoCursorTemplates = function () {
    addMongoCodeTemplates("forEach", mongoForEachTemplates);
    addMongoCodeTemplates("map", mongoMapTemplates);
    addMongoCodeTemplates("sort", mongoSortTemplates);
};
initMongoCursorTemplates();
module.exports = cursorTemplates;
