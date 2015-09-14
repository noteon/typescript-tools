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
            score:1000
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
            score:1000
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
}
initMongoCursorTemplates();

export = cursorTemplates;
