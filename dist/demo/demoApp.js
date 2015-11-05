    var start=Date.now();
    moment=require("moment");
    
    var aceTs=require("../aceTypescript");
    
    
    var lodashTypingFile=__dirname+"/lodash.d.ts";
    var appendedMethod=false

    var tsEditor=aceTs.setupAceEditor({
        tsFilePath:"/tmp/guid.ts",
        tsTypings:[lodashTypingFile],
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
                      collection: "order",
                  },
                  {    
                      fieldName: 'amount',
                      collection: "order",
                  },
  
                  {
                      fieldName: 'user.fname',
                      collection: "order",
                  },
                  
                  {
                      fieldName: 'user.lname',
                      collection: "order",
                  },
                  
                  {
                      fieldName: 'fname',
                      collection: "user",
                  },
                  
                  {
                      fieldName: 'lname',
                      collection: "user",
                  }
                  
                  ].filter(function(it){
                    if (!collectionName) return true
                    return collectionName===it.collection
                  })
  
      },
      
     helpUrlFetcher: function(methodDotName){
       return "https://www.haosou.com/s?ie=utf-8&shb=1&src=360sou_newhome&q="+methodDotName;
     },
     handleF1MethodHelp:function(url){
         if (url)
             require('shell').openExternal(url);
         else
           alert("Mongo online document is not available for this method.");
     }
    });
    
     var jsEditor = ace.edit("js-editor");
    jsEditor.setTheme("ace/theme/monokai");
    jsEditor.getSession().setMode("ace/mode/javascript");
    jsEditor.$blockScrolling = Infinity;

    setInterval(function(){
      jsEditor.getSession().setValue(tsEditor.typescriptServ.transpile(function(src){
        src="//// transpiled from typescript\n"+src;
        return src
        
      }));
    },1*1000);
   