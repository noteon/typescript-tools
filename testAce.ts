/// <reference path="./typings/tsd.d.ts" />

import TypescriptService = require('./typescriptService');
import aceUtils = require('./aceUtils');

var tsServ = new TypescriptService();
var FILE_NAME = "/tmp/inplaceText.ts"

tsServ.setup([{ name: FILE_NAME, content: "//////" }], { module: "amd" });

export function setupAceEditor() {

    var langTools = ace.require("ace/ext/language_tools");
    var editor = ace.edit("editor");
    editor.setOptions({ enableBasicAutocompletion: false });
    editor.setTheme("ace/theme/twilight");
    editor.getSession().setMode("ace/mode/typescript");

    editor.addEventListener("change", onChangeDocument);
//    editor.addEventListener("update", onUpdateDocument);

    var syncStop = false;

    function reloadDocument() {
        syncStop = true;
        tsServ.updateScript(FILE_NAME, editor.getSession().getValue());
        syncStop = false;
        // var errors = this.serviceShim.languageService.getScriptErrors("temp.ts", 100);
        // var annotations = [];
        // var self = this;
        // this.sender.emit("compiled", this.compile(this.doc.getValue()));

        // errors.forEach(function(error){
        //     var pos = DocumentPositionUtil.getPosition(self.doc, error.minChar);
        //     annotations.push({
        //         row: pos.row,
        //         column: pos.column,
        //         text: error.message,
        //         minChar:error.minChar,
        //         limChar:error.limChar,
        //         type: "error",
        //         raw: error.message
        //     });
        // });

        // this.sender.emit("compileErrors", annotations);
    };
    
    reloadDocument();

    function onChangeDocument(e: AceAjax.EditorChangeEvent) {
        //reloadDocument();
        // console.log("onChangeDoc",e);
        if (!syncStop) {
            try {
                syncTypeScriptServiceContent(FILE_NAME, e);
                //updateMarker(e);
            } catch (ex) {

            }
        }
    }
    
    //sync LanguageService content and ace editor content
    function syncTypeScriptServiceContent(script, e: AceAjax.EditorChangeEvent) {
        //console.log('syncTypeScriptServiceContent', e);
        var doc = editor.getSession().getDocument()

        var action = e.action;
        var start = aceUtils.getChars(doc, e.start);

        if (action == "insert") {
            var end=  aceUtils.getChars(doc, e.end);
            tsServ.editScriptByPos(script, start, end, e.lines);
        }else if (action == "remove") {
            var end=start+ (e.lines.join(aceUtils.EOL).length)
            
            tsServ.editScriptByPos(script, start, end, [""]);
        }
    };
    
    

    
    // uses http://rhymebrain.com/api.html
    var typescriptCompleter = {
        getCompletions: function(editor, session, pos, prefix, callback) {
            //console.log("Enter Typescript Completer getCompletions");
            let text = session.getValue();

            var startAt = Date.now();
            //tsServ.updateScript(FILE_NAME,text);
            
            // console.log('updateScript elapsed', Date.now()-startAt);
            
            startAt = Date.now();

            let completionsInfo = tsServ.getCompletionsInfoByPos(true, FILE_NAME, pos);
            if (!completionsInfo)
               return callback(null,[])
               

            //console.log(completionsInfo.entries);
            let completions = completionsInfo.entries.map((it) => {
                return {
                    name: it.name,
                    value: it.name,
                    meta: it.kind,
                    //toolTip:it.type,
                    pos: pos
                }
            });

            //console.log('getCompletionsInfoByPos elapsed', Date.now() - startAt);
            
            
            //             kind: "method"
            // kindModifiers: ""
            // name: "greet"
            // type: "(method) Greeter.greet(): string"
            //console.log("completions",completions);
            //console.log("prefix",prefix);
            
            //console.log(session.getValue());
          
            //if (prefix.length === 0) { callback(null, []); return }
                      
            startAt = Date.now();
            callback(null, completions)
            //console.log('completions callback elapsed', Date.now() - startAt);

        },

        getDocTooltip: function(item) {
            //console.log('tooltip fired',item);
            var detailInfo: any = tsServ.getCompletionEntryDetailsInfo(FILE_NAME, item.pos, item.name) || { type: "Not Found" };

            item.docHTML = "<b>" + detailInfo.type + "</b>"
        }
    }
    
    //langTools.snippetCompleter
    //langTools.setCompleters([]);
    langTools.setCompleters([typescriptCompleter]);
    editor.setOptions({
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true
    });


    editor.commands.on("afterExec", function(e) {
        if (e.command.name == "insertstring" && /^[\w.]$/.test(e.args)) {
            editor.execCommand("startAutocomplete")
        }
    })     
    // override editor onTextInput
    // var originalTextInput = editor.onTextInput;
    // editor.onTextInput = function (text){
    //     originalTextInput.call(editor, text);
    //     console.log('editor onTextInput', text);
    //     if(text == "."){
    //         editor.execCommand("startAutoComplete");

    //     }
    // };   
}	
	