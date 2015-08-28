/// <reference path="./typings/tsd.d.ts" />
var TypescriptService = require('./typescriptService');
var tsServ = new TypescriptService();
var FILE_NAME = "/tmp/inplaceText.ts";
tsServ.setup([{ name: FILE_NAME, content: "//////" }], { module: "amd" });
function setupAceEditor() {
    var langTools = ace.require("ace/ext/language_tools");
    var editor = ace.edit("editor");
    editor.setOptions({ enableBasicAutocompletion: false });
    editor.setTheme("ace/theme/twilight");
    editor.getSession().setMode("ace/mode/typescript");
    // uses http://rhymebrain.com/api.html
    var typescriptCompleter = {
        getCompletions: function (editor, session, pos, prefix, callback) {
            //console.log("Enter Typescript Completer getCompletions");
            var text = session.getValue();
            var startAt = Date.now();
            tsServ.updateScript(FILE_NAME, text);
            console.log('updateScript elapsed', Date.now() - startAt);
            startAt = Date.now();
            var completionsInfo = tsServ.getCompletionsInfoByPos(true, FILE_NAME, pos);
            var completions = completionsInfo.entries.map(function (it) {
                return {
                    name: it.name,
                    value: it.name,
                    meta: it.kind,
                    //toolTip:it.type,
                    pos: pos,
                    score: 100
                };
            });
            console.log('getCompletionsInfoByPos elapsed', Date.now() - startAt);
            //             kind: "method"
            // kindModifiers: ""
            // name: "greet"
            // type: "(method) Greeter.greet(): string"
            //console.log("completions",completions);
            //console.log("prefix",prefix);
            //console.log(session.getValue());
            //if (prefix.length === 0) { callback(null, []); return }
            startAt = Date.now();
            callback(null, completions);
            console.log('completions callback elapsed', Date.now() - startAt);
        },
        getDocTooltip: function (item) {
            //console.log('tooltip fired',item);
            var detailInfo = tsServ.getCompletionEntryDetailsInfo(FILE_NAME, item.pos, item.name) || { type: "Not Found" };
            item.docHTML = "<b>" + detailInfo.type + "</b>";
        }
    };
    //langTools.snippetCompleter
    //langTools.setCompleters([]);
    langTools.setCompleters([typescriptCompleter]);
    editor.setOptions({
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true
    });
    editor.commands.on("afterExec", function (e) {
        if (e.command.name == "insertstring" && /^[\w.]$/.test(e.args)) {
            editor.execCommand("startAutocomplete");
        }
    });
    // override editor onTextInput
    // var originalTextInput = editor.onTextInput;
    // editor.onTextInput = function (text){
    //     originalTextInput.call(editor, text);
    //     console.log('editor onTextInput', text);
    //     if(text == "."){
    //         editor.execCommand("startAutoComplete");
    //     }
    // };   
    var str = 'test2';
}
exports.setupAceEditor = setupAceEditor;
