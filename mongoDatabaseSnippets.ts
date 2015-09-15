///<reference path='typings/node/node.d.ts'/>

var mongoCreateCollectionTemplates = [
      {
            caption: "createCollection",
            snippet: 
`createCollection("\${1:name}", { capped : true, size : 512 * 1024, max : 1000 } )`,
            comment: 'Creates a new collection explicitly. set capped option is true',
            example:
`db.createCollection("log", { capped : true, size : 5242880, max : 5000 } )`,
            score:1000
      }
];      
      
var mongoStatsTemplates = [
      {
            caption: "stats",
            snippet: 
`stats(1024)`,
            comment: 'Returns statistics that reflect the use state of a single database.',
            example:
`db.stats(1024)`,
            score:1000
      }
];      

var mongoCreateUserTemplates = [
      {
            caption: "stats",
            snippet: 
`createUser(
   {
     user: "$2",
     pwd: "$3",
     roles: [ "read" ] //read|readWrite|dbAdmin|dbOwner|userAdmin ...
   }
)`,
            comment: 'Creates a new user for the database where the method runs. db.createUser() returns a duplicate user error if the user already exists on the database.',
            example:
`use products
db.createUser( { "user" : "accountAdmin01",
                 "pwd": "cleartext password",
                 "customData" : { employeeId: 12345 },
                 "roles" : [ { role: "clusterAdmin", db: "admin" },
                             { role: "readAnyDatabase", db: "admin" },
                             "readWrite"
                             ] },
               { w: "majority" , wtimeout: 5000 } )`,
            score:1000
      }
];      


let databaseTemplates=[];

let addMongoCodeTemplates=(mongoMethod,templates:any[])=>{
    let theTmpls=templates.map((it)=>{
          it.meta="code template"
          it.isMongoTemplateCommand=true;
          it.methodDotName="db."+mongoMethod;  //for help url
          
          return it;
    })  
    
    databaseTemplates=databaseTemplates.concat(templates)
}

let initMongoCursorTemplates=()=>{
      addMongoCodeTemplates("createCollection",mongoCreateCollectionTemplates);
      addMongoCodeTemplates("stats",mongoStatsTemplates);
}
initMongoCursorTemplates();

export = databaseTemplates;