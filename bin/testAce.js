/// <reference path="./typings/tsd.d.ts" />
var TypescriptService = require('./typescriptService');
var aceUtils = require('./aceUtils');
var tsServ = new TypescriptService();
var FILE_NAME = "/tmp/inplaceText.ts";
tsServ.setup([{ name: FILE_NAME, content: "//////" }], { module: "amd" });
function setupAceEditor() {
    var langTools = ace.require("ace/ext/language_tools");
    var AceRange = ace.require('ace/range').Range;
    var editor = ace.edit("editor");
    editor.setOptions({ enableBasicAutocompletion: false });
    editor.setTheme("ace/theme/twilight");
    editor.getSession().setMode("ace/mode/typescript");
    editor.addEventListener("change", onChangeDocument);
    //    editor.addEventListener("update", onUpdateDocument);
    var syncStop = false;
    function reloadDocument() {
        //syncStop = true;
        tsServ.updateScript(FILE_NAME, editor.getSession().getValue());
        //syncStop = false;
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
    setInterval(function () {
        // tsServ.updateScript(FILE_NAME, editor.getSession().getValue());
    }, 2000);
    reloadDocument();
    var errorMarkers = [];
    function updateMarker(e) {
        var addPhase = function (phase) { return function (d) { d.phase = phase; return d; }; };
        var syntactic = tsServ.ls.getSyntacticDiagnostics(FILE_NAME);
        var semantic = tsServ.ls.getSemanticDiagnostics(FILE_NAME);
        // this.ls.languageService.getEmitOutput(file).diagnostics;
        var errors = [].concat(syntactic.map(addPhase("Syntax")), semantic.map(addPhase("Semantics")));
        var session = editor.getSession();
        errorMarkers.forEach(function (id) {
            session.removeMarker(id);
        });
        var annotations = [];
        errors.forEach(function (error) {
            //var getpos = aceEditorPosition.getAcePositionFromChars;
            var doc = editor.getSession().getDocument();
            var start = aceUtils.getPosition(doc, error.start);
            var end = aceUtils.getPosition(doc, error.start + error.length);
            var range = new AceRange(start.row, start.column, end.row, end.column);
            //console.log("session push marker",start.row,start.column);
            errorMarkers.push(session.addMarker(range, "typescript-error", "text", true));
            //errorMarkers.push(session.addMarker(range, "typescript-error", error.messageText, false));
            //console.log("add annotation", start.row, start.column, error.messageText);
            annotations.push({
                row: start.row,
                column: start.column,
                text: error.messageText,
                type: "error",
            });
        });
        session.setAnnotations(annotations);
        //          row: number;
        //  column: number;
        //  text: string;
        //  type: string;
        //console.log('error',errors);
    }
    function onChangeDocument(e) {
        //reloadDocument();
        //console.log("onChangeDoc",e);
        if (!syncStop) {
            try {
                syncTypeScriptServiceContent(FILE_NAME, e);
                var startAt = Date.now();
                updateMarker(e);
            }
            catch (ex) {
            }
        }
    }
    //sync LanguageService content and ace editor content
    function syncTypeScriptServiceContent(script, e) {
        var doc = editor.getSession().getDocument();
        var action = e.action;
        var start = aceUtils.getChars(doc, e.start);
        if (action == "insert") {
            var end = aceUtils.getChars(doc, e.end);
            end = end - (e.lines.join(aceUtils.EOL).length);
            tsServ.editScriptByPos(script, start, end, e.lines);
        }
        else if (action == "remove") {
            var end = start + (e.lines.join(aceUtils.EOL).length);
            tsServ.editScriptByPos(script, start, end, [""]);
        }
        //console.log('syncTypeScriptServiceContent', start,end,e.lines);
    }
    ;
    // uses http://rhymebrain.com/api.html
    var typescriptCompleter = {
        getCompletions: function (editor, session, pos, prefix, callback) {
            var doc = editor.getSession().getDocument();
            var prevChar;
            if (pos.column > 0) {
                prevChar = session.getValue().charAt(aceUtils.getChars(doc, { row: pos.row, column: pos.column - 1 }));
            }
            //console.log("Enter Typescript Completer getCompletions",{pos, prefix, prevChar});
            if (prevChar && prevChar === '(') {
                //tsServ.getSignatureInfo
                var helpItems = tsServ.getSignatureInfo(FILE_NAME, pos.row, pos.column);
                console.log('helpItems', pos, helpItems);
                var quickInfo = tsServ.getQuickInfo(FILE_NAME, pos.row, pos.column);
                console.log('QuickInfo', quickInfo);
                var definitionInfo = tsServ.getDefinitionInfo(FILE_NAME, pos.row, pos.column);
                console.log('definition', definitionInfo);
                return callback(null, [{ name: quickInfo.type, value: quickInfo.type, meta: "" }]);
            }
            var startAt = Date.now();
            //tsServ.updateScript(FILE_NAME,text);
            // console.log('updateScript elapsed', Date.now()-startAt);
            startAt = Date.now();
            //? why pos, not pos.row, pos.column
            var completionsInfo = tsServ.getCompletionsInfoByPos(true, FILE_NAME, pos);
            if (!completionsInfo) {
                //try to refresh
                //console.log("try refresh tsServ",prefix); 
                //有时候Script Snapshot会混乱掉，需要有个机制重新刷新 script
                var startAt = Date.now();
                //tsServ.updateScript(FILE_NAME, session.getValue());  
                //console.log('updateScript elapsed', Date.now()-startAt);
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
            // console.log('tooltip fired',item.srcProps);
            var detailInfo = tsServ.getCompletionEntryDetailsInfo(FILE_NAME, item.pos, item.name) || { type: "" };
            if (detailInfo.type) {
                item.docHTML = "<b>" + detailInfo.type + "</b>";
            }
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
        if (e.command.name == "insertstring" && /^[\w.\(\,]$/.test(e.args)) {
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
