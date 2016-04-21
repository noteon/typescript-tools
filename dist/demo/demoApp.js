    var start=Date.now();
    moment=require("moment");
    
    var aceTs=require("../../bin/aceTypescript");
    var path=require("path");
    var fs=require('fs');
    
    
    var appendedMethod=false
    //console.log(__dirname);
    
    var tsFilePath=path.resolve(__dirname,"tmp.ts");
    
    window["editor"]=aceTs.setupAceEditor({
        tsFilePath:tsFilePath,
        //tsFileInitContent:fs.readFileSync(tsFilePath), 
        tsTypings:[path.resolve(__dirname,"lodash.d.ts"),path.resolve(__dirname,"mongo-shell.d.ts")],
        editorTheme:"monokai",
        editorElem:'ts-editor',
        dbFieldsFetcher: function (collectionName){
          // if (collectionName && !appendedMethod){
          //    appendedMethod=true;
          //    tsEditor.typescriptServ.ts.appendScriptContent(lodashTypingFile,["","interface String { toTestCapitalA:(a:string,b:number)=>string; }"]);
          //    tsEditor.typescriptServ.ts.appendScriptContent(lodashTypingFile,["","interface String { toTestCapitalB:(a:string,b:number)=>string; }"]);
             
          //    console.log(tsEditor.typescriptServ.ts.fileCache.getScriptInfo(lodashTypingFile).content);
          // }
          if (collectionName)
              console.log("fieldFetcher",collectionName);
          
          return [{
                      fieldName: '_id',
                      collection: "test",
                  },
                  {    
                      fieldName: 'amount',
                      collection: "test",
                  },
  
                  {
                      fieldName: 'user.order.quantity',
                      collection: "test",
                  },
                  
                  {
                      fieldName: 'user.order.amount',
                      collection: "test",
                  },
                  {
                      fieldName: 'user.lname',
                      collection: "test",
                  },
                  
                  {
                      fieldName: 'user.fname',
                      collection: "test",
                  },
                  
                  {
                      fieldName: 'user.lname',
                      collection: "test",
                  }
                  
                  ].filter(function(it){
                    if (!collectionName) return true
                    return collectionName===it.collection
                  })
  
      },
      
     helpUrlFetcher: function(methodDotName){
       return "https://www.haosou.com/s?ie=utf-8&shb=1&src=360sou_newhome&q="+methodDotName;
     },
     handleF1MethodHelp:function(url,methodDotName){
         if (url)
             require('shell').openExternal(url);
         else
           alert("Mongo online document  is not available for the method '"+methodDotName+"'");
     }
    });
    
     var jsEditor = ace.edit("js-editor");
    jsEditor.setTheme("ace/theme/monokai");
    jsEditor.getSession().setMode("ace/mode/javascript");
    jsEditor.$blockScrolling = Infinity;

    setInterval(function(){
      jsEditor.getSession().setValue(window["editor"].typescriptServ.transpile(function(src){
        src=src+"\n//// transpiled from typescript";
        return src
        
      }));
    },1*1000);
   