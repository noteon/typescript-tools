///<reference path='typings/node/node.d.ts'/>

let configSample=`{
    _id : "my_replica_set",
     members : [
         {_id : 0, host : "rs1.example.net:27017"},
         {_id : 1, host : "rs2.example.net:27017"},
         {_id : 2, host : "rs3.example.net", arbiterOnly: true},
     ]
}`;

var mongoInitializeTemplates = [
      {
            caption: "initiate",
            snippet: 
`initiate();`,
            comment: 'Initiates a replica set. Optionally takes a configuration argument in the form of a document that holds the configuration of a replica set.',
            example:
`rs.initiate()`,
      },
      {
            caption: "initiateWithSampleConfig",
            snippet: 
`initiate(${configSample});`,
            comment: 'Initiates a replica set. Optionally takes a configuration argument in the form of a document that holds the configuration of a replica set.',
            example:
`rs.initiate(${configSample})`,
      }
];      

      
let replTemplates=[];

let addMongoCodeTemplates=(mongoMethod,templates:any[])=>{
    let theTmpls=templates.map((it)=>{
          it.meta="snippet"
          it.isMongoTemplateCommand=true;
          it.methodDotName="rs."+mongoMethod;  //for help url
          
          return it;
    })  
    
    replTemplates=replTemplates.concat(templates)
}

let initReplTemplates=()=>{
      addMongoCodeTemplates("initiate",mongoInitializeTemplates);
}
initReplTemplates();

export = replTemplates;
