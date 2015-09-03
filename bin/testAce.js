/// <reference path="./typings/tsd.d.ts" />
var ts = require('./typescriptService');
var aceUtils = require('./aceUtils');
var tsCompleters = require('./typescriptCompleters');
var mongoCompleters = require('./mongoCompleters');
_ = require('lodash');
var tsServ = new ts.TypescriptService();
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
            var getMessageType = function (error) {
                if (error.category === 0)
                    return 'warning';
                if (error.category === 1)
                    return 'error';
                return 'info';
            };
            annotations.push({
                row: start.row,
                column: start.column,
                text: error.messageText,
                type: getMessageType(error),
            });
        });
        session.setAnnotations(annotations);
        //          row: number;
        //  column: number;
        //  text: string;
        //  type: string;
        //console.log('error',errors);
    }
    var throttledUpdateMarker = _.throttle(updateMarker, 100);
    var debounceUpdateMarker = _.debounce(throttledUpdateMarker, 500);
    function onChangeDocument(e) {
        //reloadDocument();
        //console.log("onChangeDoc",e);
        if (!syncStop) {
            try {
                syncTypeScriptServiceContent(FILE_NAME, e);
                var startAt = Date.now();
                var cursorRow = editor.getCursorPosition().row;
                if (e.start.row === cursorRow && e.end.row === cursorRow && e.lines && e.lines.join(aceUtils.EOL).length === 1) {
                    debounceUpdateMarker(e);
                }
                else
                    throttledUpdateMarker(e);
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
    //langTools.snippetCompleter
    //langTools.setCompleters([]);
    var typeScriptCompleters = tsCompleters.getTypeScriptCompleters(tsServ, FILE_NAME);
    var mongoFieldCompleter = mongoCompleters.getFieldCompleter(tsServ, FILE_NAME, function (scriptFile) {
        return [{
                caption: '_id',
                value: '_id',
                meta: "order-field",
            },
            {
                caption: 'amount',
                value: 'amount',
                meta: "order-field",
            },
            {
                caption: 'user.fname',
                value: 'user.fname',
                meta: "order-field",
            },
            {
                caption: 'user.lname',
                value: 'user.lname',
                meta: "order-field",
            }];
    });
    langTools.setCompleters([typeScriptCompleters.typeScriptParameterCompleter, typeScriptCompleters.typescriptAutoCompleter, mongoFieldCompleter, mongoCompleters.operatorsCompleter]);
    //langTools.setCompleters([typescriptCompleter,typeScriptParameterCompleter]);
    editor.setOptions({
        enableBasicAutocompletion: true,
    });
    editor.commands.on("afterExec", function (e) {
        if (e.command.name == "insertstring" && /^[\w.\(\,\$\'\"]$/.test(e.args)) {
            editor.execCommand("startAutocomplete");
        }
    });
    var TokenTooltip = require("./aceTokenTooltip").TokenTooltip;
    editor["tokenTooltip"] = new TokenTooltip(editor, function (editor, token, pos) {
        var isModKeyPressed = function () {
            var commandKey = 91;
            var ctrlKey = 17;
            var os = require('os');
            var modKey = (os.platform() === 'darwin') ? commandKey : ctrlKey;
            var keymaster = require('keymaster');
            return keymaster.isPressed(modKey);
        };
        //console.log('show token tooltip',token,pos);
        var posChar = tsServ.fileCache.lineColToPosition(FILE_NAME, pos.row + 1, pos.column + 1);
        if (!isModKeyPressed()) {
            var quickInfo = tsServ.getQuickInfoByPos(FILE_NAME, posChar);
            if (quickInfo && quickInfo.type && quickInfo.type !== "any") {
                return aceUtils.highlightTypeAndComment(quickInfo);
            }
        }
        else {
            var definitionInfo = tsServ.getDefinitionInfoByPos(FILE_NAME, posChar);
            //console.log('definitionInfo',definitionInfo);
            if (definitionInfo && definitionInfo.content)
                return aceUtils.highLightCode(definitionInfo.content);
        }
    });
}
exports.setupAceEditor = setupAceEditor;
