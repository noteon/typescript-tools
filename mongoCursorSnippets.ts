///<reference path='typings/node/node.d.ts'/>

var mongoFindTemplates = [
      {
            caption: "find",
            snippet: 
`find({$2})`,
            comment: 'Selects documents in a collection and returns a cursor to the selected documents.',
            example:
`db.products.find( { qty: { $gte: 25, $lt: 35 } })`,
            score:1000
      }]


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
      addMongoCodeTemplates("find",mongoFindTemplates);
}
initMongoCursorTemplates();

export = cursorTemplates;