///<reference path='typings/node/node.d.ts'/>

var mongoForEachTemplates = [
      {
            caption: "forEach",
            snippet: 
`forEach((it)=> { 
      $1
 });`,
            comment: 'Iterates the cursor to apply a JavaScript function to each document from the cursor.',
            example:
`db.users.find().forEach( function(myDoc) { print( "user: " + myDoc.name ); } );`,
      }
];      
      
var mongoMapTemplates = [
      {
            caption: "map",
            snippet: 
`map((it)=> { 
      $1
      return it;
 });`,
            comment: 'Applies function to each document visited by the cursor and collects the return values from successive application into an array.',
            example:
`db.users.find().map( function(u) { return u.name; } );`,
      },
]

var mongoLimitTemplates = [
      {
            caption: "limit",
            snippet: 
`limit(\${2:5})`,
            comment: 'Use the limit() method on a cursor to specify the maximum number of documents the cursor will return. limit() is analogous to the LIMIT statement in a SQL database.',
            example:
`db.orders.find().limit(5)`,
      },
]


var mongoSortTemplates = [
      {
            caption: "sort",
            snippet: 
`sort({ \${2:sortField}:\${3:-1} })`,
            comment: 'Specifies the order in which the query returns matching documents.',
            example:
`db.orders.find().sort({ amount: -1 })`,
      },

      {
            caption: "sortById",
            snippet: 
`sort({ _id:\${2:1} })`,
            comment: 'Sort by Id',
            example:
`db.orders.find().sort({ _id: -1 })`,
      },
      
      {
            caption: "sortAsInserted",
            snippet: 
`sort({ \\$natural:\${2:1} })`,
            comment: 'Specifies the order in which the query returns matching documents. Use $natural operator to return documents in the order they exist on disk',
            example:
`db.orders.find().sort({ $natural: 1 })`,
      },
      
      {
            caption: "sortAsInsertedDesc",
            snippet: 
`sort({ \\$natural:\${2:-1} })`,
            comment: 'Specifies the order in which the query returns matching documents. Use $natural operator to return documents in the reversed order they exist on disk',
            example:
`db.orders.find().sort({ $natural: -1 })`,
      },
      
      {
            caption: "first",
            snippet: 
`sort({ \\$natural:1 }).limit(\${2:1})`,
            comment: 'Return first N records. Use $natural operator to return documents in the order they exist on disk',
            example:
`db.orders.find().sort({ $natural: 1 }).limit(n)`,
      },
      
      {
            caption: "last",
            snippet: 
`sort({ \\$natural:-1 }).limit(\${2:1})`,
            comment: 'Return last N records. Use $natural operator to return documents in the reversed order they exist on disk',
            example:
`db.orders.find().sort({ $natural: -1 }).limit(n)`,
      },
]


let cursorTemplates=[];

let addMongoCodeTemplates=(mongoMethod,templates:any[])=>{
    let theTmpls=templates.map((it)=>{
          it.meta="code template"
          it.isMongoTemplateCommand=true;
          it.methodDotName="cursor."+mongoMethod;  //for help url
          
          return it;
    })  
    
    cursorTemplates=cursorTemplates.concat(templates)
}

let initMongoCursorTemplates=()=>{
      addMongoCodeTemplates("forEach",mongoForEachTemplates);
      addMongoCodeTemplates("map",mongoMapTemplates);
      addMongoCodeTemplates("sort",mongoSortTemplates);
      addMongoCodeTemplates("limit",mongoLimitTemplates);
}
initMongoCursorTemplates();

export = cursorTemplates;
