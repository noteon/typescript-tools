///<reference path='typings/node/node.d.ts'/>

var mongoCreateCollectionTemplates = [
      {
            caption: "createCollection",
            snippet: 
`createCollection("\${1:name}", { capped : true, size : 512 * 1024, max : 1000 } )`,
            comment: 'Creates a new collection explicitly. set capped option is true',
            example:
`db.createCollection("log", { capped : true, size : 5242880, max : 5000 } )`,
      }
];      
      
var mongoStatsTemplates = [
      {
            caption: "stats",
            snippet: 
`stats();`,
            comment: 'Returns statistics that reflect the use state of a single database.',
            example:
`db.stats()`,
      }
];      

var mongoCreateUserTemplates = [
      {
            caption: "createUser",
            snippet: 
`createUser(
   {
     user: "$2",
     pwd: "$3",
     roles: [ {role:"read", db:"$4"} ]
    /* All build-in Roles 
    Database User Roles: read|readWrite
    Database Admion Roles: dbAdmin|dbOwner|userAdmin
    Cluster Admin Roles: clusterAdmin|clusterManager|clusterMonitor|hostManager
    Backup and Restoration Roles: backup|restore
    All-Database Roles: readAnyDatabase|readWriteAnyDatabase|userAdminAnyDatabase|dbAdminAnyDatabase
    Superuser Roles: root */
   }
)`,
            comment: 'Creates a new user for the database where the method runs. db.createUser() returns a duplicate user error if the user already exists on the database.',
            example:
`use products
db.createUser({
        "user" : "accountAdmin01",
        "pwd": "cleartext password",
        "customData" : { employeeId: 12345 },
        "roles" : [ { role: "clusterAdmin", db: "admin" },
                    { role: "readAnyDatabase", db: "admin" },
                    "readWrite"
                  ] 
      },
      { w: "majority" , wtimeout: 5000 } )`,
      }
];
      


var mongoCurrentOpTemplates=[
      {
            caption: "currentOpWriteOperationsWaitingLock",
            snippet: 
`currentOp(
   {
     "waitingForLock" : true,
     \\$or: [
        { "op" : { "\\$in" : [ "insert", "update", "remove" ] } },
        { "query.findandmodify": { \\$exists: true } }
    ]
   }
)`,
            comment: 'Returns information on all write operations that are waiting for a lock',
            example:
`db.currentOp(
   {
     "waitingForLock" : true,
     $or: [
        { "op" : { "$in" : [ "insert", "update", "remove" ] } },
        { "query.findandmodify": { $exists: true } }
    ]
   }
)`,
      },
      
      
      {
            caption: "currentOpActiveAndNeverYielded",
            snippet: 
`currentOp(
   {
     "active" : true,
     "numYields" : 0,
     "waitingForLock" : false
   }
)`,
            comment: 'returns information on all active running operations that have never yielded',
            example:
`db.currentOp(
   {
     "active" : true,
     "numYields" : 0,
     "waitingForLock" : false
   }
)`,
      },
      
      {
            caption: "currentOpActiveAndRunningLongerThan3Secs",
            snippet: 
`currentOp(
   {
     "active" : true,
     "secs_running" : { "\\$gt" : 3 },
     "ns" : /^db1\\./
   }
)`,
            comment: 'returns information on all active operations for database db1 that have been running longer than 3 seconds',
            example:
`db.currentOp(
   {
     "active" : true,
     "secs_running" : { "$gt" : 3 },
     "ns" : /^db1\\./
   }
)`,
      },    
          
      {
            caption: "currentOpActiveIndexingOperations",
            snippet: 
`currentOp(
    {
      \\$or: [
        { op: "query", "query.createIndexes": { \\$exists: true } },
        { op: "insert", ns: /\\.system\\.indexes\\b/ }
      ]
    }
)`,
            comment: 'returns information on all active operations for database db1 that have been running longer than 3 seconds',
            example:
`db.currentOp(
    {
      $or: [
        { op: "query", "query.createIndexes": { $exists: true } },
        { op: "insert", ns: /\\.system\\.indexes\\b/ }
      ]
    }
)`,
      }    
          
]

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
      addMongoCodeTemplates("createUser",mongoCreateUserTemplates);
      addMongoCodeTemplates("currentOp",mongoCurrentOpTemplates);
}
initMongoCursorTemplates();

export = databaseTemplates;
