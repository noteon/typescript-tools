/// <reference path="./typings/tsd.d.ts" />
var aceUtils = require("./aceUtils");
var ts = require("./typescriptService");
var tsCompleters = require('./typescriptCompleters');
var mongoCompleters = require('./mongoCompleters');
_ = require('lodash');
//default theme twilight
function setupAceEditor(params) {
    var langTools = ace.require("ace/ext/language_tools");
    var AceRange = ace.require('ace/range').Range;
    var editor = ace.edit(params.editorElem);
    editor.setOptions({ enableBasicAutocompletion: false });
    editor.$blockScrolling = Infinity;
    var theme = params.editorTheme || 'twilight';
    editor.setTheme("ace/theme/" + theme);
    editor.getSession().setMode("ace/mode/typescript");
    var tsServ = new ts.TypescriptService();
    var fileName = params.fileName;
    tsServ.setup([{ name: fileName, content: params.initFileContent || "//////" }], { module: "amd" });
    editor.addEventListener("change", onChangeDocument);
    //    editor.addEventListener("update", onUpdateDocument);
    var syncStop = false;
    function reloadDocument() {
        tsServ.updateScript(fileName, editor.getSession().getValue());
    }
    ;
    reloadDocument();
    var errorMarkers = [];
    function updateMarker(e) {
        var addPhase = function (phase) { return function (d) { d.phase = phase; return d; }; };
        var syntactic = tsServ.ls.getSyntacticDiagnostics(fileName);
        var semantic = tsServ.ls.getSemanticDiagnostics(fileName);
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
    }
    var throttledUpdateMarker = _.throttle(updateMarker, 100);
    var debounceUpdateMarker = _.debounce(throttledUpdateMarker, 500);
    function onChangeDocument(e) {
        //reloadDocument();
        if (!syncStop) {
            try {
                syncTypeScriptServiceContent(fileName, e);
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
    var typeScriptCompleters = tsCompleters.getTypeScriptCompleters(tsServ, fileName);
    var mongoFieldCompleter = mongoCompleters.getFieldCompleter(tsServ, fileName, function (scriptFile) {
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
    langTools.setCompleters([typeScriptCompleters.typeScriptParameterCompleter, typeScriptCompleters.typescriptAutoCompleter,
        mongoFieldCompleter, mongoCompleters.operatorsCompleter]);
    //langTools.setCompleters([typescriptCompleter,typeScriptParameterCompleter]);
    editor.setOptions({
        enableBasicAutocompletion: true,
    });
    editor.commands.on("afterExec", function (e) {
        if (e.command.name == "insertstring" && /^[\w.\(\,\$\'\"]$/.test(e.args)) {
            editor.execCommand("startAutocomplete");
        }
    });
    require('./quickAndDefinitionTooltip').setupTooltip(editor, tsServ, fileName);
    return editor;
}
exports.setupAceEditor = setupAceEditor;
