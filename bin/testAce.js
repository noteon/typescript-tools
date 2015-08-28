/// <reference path="./typings/tsd.d.ts" />
var TypescriptService = require('./typescriptService');
var aceUtils = require('./aceUtils');
var tsServ = new TypescriptService();
var FILE_NAME = "/tmp/inplaceText.ts";
tsServ.setup([{ name: FILE_NAME, content: "//////" }], { module: "amd" });
function setupAceEditor() {
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
    }
    ;
    reloadDocument();
    function onChangeDocument(e) {
        //reloadDocument();
        // console.log("onChangeDoc",e);
        if (!syncStop) {
            try {
                syncTypeScriptServiceContent(FILE_NAME, e);
            }
            catch (ex) {
            }
        }
    }
    //sync LanguageService content and ace editor content
    function syncTypeScriptServiceContent(script, e) {
        //console.log('syncTypeScriptServiceContent', e);
        var doc = editor.getSession().getDocument();
        var action = e.action;
        var start = aceUtils.getChars(doc, e.start);
        if (action == "insert") {
            var end = aceUtils.getChars(doc, e.end);
            tsServ.editScriptByPos(script, start, end, e.lines);
        }
        else if (action == "remove") {
            var end = start + (e.lines.join(aceUtils.EOL).length);
            tsServ.editScriptByPos(script, start, end, [""]);
        }
    }
    ;
    // uses http://rhymebrain.com/api.html
    var typescriptCompleter = {
        getCompletions: function (editor, session, pos, prefix, callback) {
            //console.log("Enter Typescript Completer getCompletions");
            //let text = session.getValue();
            var startAt = Date.now();
            //tsServ.updateScript(FILE_NAME,text);
            // console.log('updateScript elapsed', Date.now()-startAt);
            startAt = Date.now();
            var completionsInfo = tsServ.getCompletionsInfoByPos(true, FILE_NAME, pos);
            if (!completionsInfo) {
                //try to refresh
                console.log("try refresh tsServ", prefix);
                //有时候Script Snapshot会混乱掉，需要有个机制重新刷新 script
                var startAt = Date.now();
                tsServ.updateScript(FILE_NAME, session.getValue());
                console.log('updateScript elapsed', Date.now() - startAt);
                return callback(null, []);
            }
            //console.log("completionsInfo",completionsInfo.entries);
            var completions = completionsInfo.entries.map(function (it) {
                return {
                    name: it.name,
                    value: it.name,
                    meta: it.kind,
                    //toolTip:it.type,
                    pos: pos,
                    srcProps: it,
                };
            });
            var matchFunc = function (elm) {
                return elm.name.indexOf(prefix) == 0 ? 1 : 0;
            };
            var matchCompare = function (a, b) {
                return matchFunc(b) - matchFunc(a);
            };
            var textCompare = function (a, b) {
                if (a.name == b.name) {
                    return 0;
                }
                else {
                    return (a.name > b.name) ? 1 : -1;
                }
            };
            var compare = function (a, b) {
                var ret = matchCompare(a, b);
                return (ret != 0) ? ret : textCompare(a, b);
            };
            completions = completions.sort(compare);
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
            callback(null, completions);
            //console.log('completions callback elapsed', Date.now() - startAt);
        },
        getDocTooltip: function (item) {
            console.log('tooltip fired', item.srcProps);
            var detailInfo = tsServ.getCompletionEntryDetailsInfo(FILE_NAME, item.pos, item.name) || { type: "Not Found" };
            item.docHTML = "<b>" + detailInfo.type + "</b>";
        }
    };
    //langTools.snippetCompleter
    //langTools.setCompleters([]);
    langTools.setCompleters([typescriptCompleter]);
    editor.setOptions({
        enableBasicAutocompletion: true,
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
}
exports.setupAceEditor = setupAceEditor;
