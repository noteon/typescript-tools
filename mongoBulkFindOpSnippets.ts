///<reference path='typings/node/node.d.ts'/>

var mongoUpdateTemplates = [
      {
            caption: "update",
            snippet: 
`update({ \\$set: { $2 } })`,
            comment: 'Adds a multi update operation to a bulk operations list. The method updates specific fields in existing documents.',
            example:
`var bulk = db.items.initializeUnorderedBulkOp();
bulk.find( { status: "D" } ).update( { $set: { status: "I", points: "0" } } );
bulk.find( { item: null } ).update( { $set: { item: "TBD" } } );
bulk.execute();`
      }
];      
      
let bulkFindOpTemplates=[];

let addMongoCodeTemplates=(mongoMethod,templates:any[])=>{
    let theTmpls=templates.map((it)=>{
          it.meta="snippet"
          it.isMongoTemplateCommand=true;
          it.methodDotName="db."+mongoMethod;  //for help url
          
          return it;
    })  
    
    bulkFindOpTemplates=bulkFindOpTemplates.concat(templates)
}

let initMongoBulkFindOpTemplates=()=>{
      addMongoCodeTemplates("update",mongoUpdateTemplates);
}
initMongoBulkFindOpTemplates();

export = bulkFindOpTemplates;
