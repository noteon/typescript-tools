/// <reference path="./typings/tsd.d.ts" />

import TypescriptService=require('./typescriptService');

var tsServ=new TypescriptService();
var FILE_NAME="/tmp/inplaceText.ts"

tsServ.setup([{name:FILE_NAME, content:"//////"}],{module:"amd"});

export function setupAceEditor(){
	
	var langTools = ace.require("ace/ext/language_tools");
    var editor = ace.edit("editor");
	editor.setOptions({enableBasicAutocompletion: false});
    editor.setTheme("ace/theme/twilight");
    editor.getSession().setMode("ace/mode/typescript");
	
    // uses http://rhymebrain.com/api.html
    var typescriptCompleter = {
        getCompletions: function(editor, session, pos, prefix, callback) {
            console.log("Enter Typescript Completer getCompletions");
            let text=session.getValue();
            
            var startAt=Date.now();
            tsServ.updateScript(FILE_NAME,text);
            
            console.log('updateScript elapsed', Date.now()-startAt);
            
            startAt=Date.now();
            
            let completionsInfo=tsServ.getCompletionsInfoByPos(true,FILE_NAME,pos);
            let completions=completionsInfo.entries.map((it)=>{
              return {
                  name:it.name,
                  value:it.name,
                  meta:it.kind,
                  //toolTip:it.type,
                  pos:pos,
                  score:100
              }   
            });
            
            console.log('getCompletionsInfoByPos elapsed', Date.now()-startAt);
            
            
//             kind: "method"
// kindModifiers: ""
// name: "greet"
// type: "(method) Greeter.greet(): string"
            //console.log("completions",completions);
            //console.log("prefix",prefix);
            
			//console.log(session.getValue());
          
            //if (prefix.length === 0) { callback(null, []); return }
                      
            startAt=Date.now();
            callback(null, completions)
             console.log('completions callback elapsed', Date.now()-startAt);
            
        },
		
        getDocTooltip: function(item) {
            //console.log('tooltip fired',item);
            var detailInfo:any=tsServ.getCompletionEntryDetailsInfo(FILE_NAME,item.pos,item.name) || {type:"Not Found"};
            
            item.docHTML = "<b>"+detailInfo.type+"</b>"
        }
    }
    
    //langTools.snippetCompleter
    //langTools.setCompleters([]);
    langTools.setCompleters([typescriptCompleter]);	
  	editor.setOptions({enableBasicAutocompletion: true});
    

}	
	