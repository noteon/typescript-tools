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
            
            tsServ.updateScript(FILE_NAME,text);
            
            let completionsInfo=tsServ.getCompletionsInfoByPos(false,FILE_NAME,pos);
            let completions=completionsInfo.entries.map((it)=>{
              return {
                  name:it.name,
                  value:it.name,
                  meta:it.kind,
                  toolTip:it.type,
                  score:100
              }   
            });
            
            
            
            
//             kind: "method"
// kindModifiers: ""
// name: "greet"
// type: "(method) Greeter.greet(): string"
            console.log("completions",completions);
            console.log("prefix",prefix);
            
			//console.log(session.getValue());
          
            //if (prefix.length === 0) { callback(null, []); return }
                      
            
            callback(null, completions)
            
        },
		
        getDocTooltip: function(item) {
            //console.log('tooltip fired',item);
            item.docHTML = "<b>"+item.toolTip+"</b>"
        }
    }
    
    //langTools.snippetCompleter
    //langTools.setCompleters([]);
    langTools.setCompleters([typescriptCompleter]);	
  	editor.setOptions({enableBasicAutocompletion: true});
    

}	
	