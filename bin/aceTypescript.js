/// <reference path="./typings/tsd.d.ts" />
_ = require("lodash");
function bindTypescriptExtension(editor, params) {
    var aceUtils = require("./aceUtils");
    var ts = require("./typescriptService");
    var tsCompleters = require('./typescriptCompleters');
    var mongoCompleters = require('./mongoCompleters');
    var typescript = require("typescript");
    var fs = require("fs");
    var langTools = ace.require("ace/ext/language_tools");
    var AceRange = ace.require('ace/range').Range;
    var tsServ = new ts.TypescriptService();
    var fileName = params.tsFilePath;
    //console.log(__dirname+"/lodash.d.ts");
    var tsAndTypingFiles = [];
    tsAndTypingFiles.push({ name: fileName, content: params.tsFileInitContent || "//////" });
    params.tsTypings && params.tsTypings.forEach(function (it) {
        if (it.path)
            tsAndTypingFiles.push({ name: it.path, content: it.content || typescript.sys.readFile(it.path) });
        else
            tsAndTypingFiles.push({ name: it, content: typescript.sys.readFile(it.path) });
    });
    //target 1= ES5
    var compilerOptions = { target: typescript.ScriptTarget.ES5, "module": typescript.ModuleKind.CommonJS };
    var errorMarkers = [];
    function updateTsErrorMarkers() {
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
            //console.log("range",start,end);
            var range = new AceRange(start.row, start.column, end.row, end.column);
            //ignore mongo command like: user db1
            if (start.row === end.row) {
                var line = editor.getSession().getLine(start.row).trim();
                //console.log("error marker", line, start.row)
                if (/^(help|use|show) ?$/.test(line) || /^(help|use|show) .*$/.test(line))
                    return;
            }
            //console.log("end.row", end.row, editor.getCursorPosition().row);
            if (editor.container && (document.activeElement === editor.container.children[0]) && (end.row === editor.getCursorPosition().row)) {
                return;
            }
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
            var getErrorText = function (error) {
                if (!error)
                    return "";
                if (_.isString(error.messageText))
                    return error.messageText;
                return error.messageText.messageText; //DiagnosticMessageChain
            };
            annotations.push({
                row: start.row,
                column: start.column,
                text: getErrorText(error),
                type: getMessageType(error),
            });
        });
        session.setAnnotations(annotations);
    }
    var throttledUpdateMarker = _.throttle(updateTsErrorMarkers, 100);
    var debounceUpdateMarker = _.debounce(throttledUpdateMarker, 500);
    function onChangeDocument(e) {
        //reloadDocument();
        try {
            syncTypeScriptServiceContent(fileName, e);
            var startAt = Date.now();
            var cursorRow = editor.getCursorPosition().row;
            if (e.start.row === cursorRow && e.end.row === cursorRow && e.lines && e.lines.join(aceUtils.EOL).length === 1) {
                debounceUpdateMarker();
            }
            else
                throttledUpdateMarker();
        }
        catch (ex) {
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
            e.lines.forEach(function (line) {
                if (!line)
                    return;
                if (line.length < 3)
                    return; // db.
                var colName = aceUtils.getCollectionName(line);
                // console.log("syncType",line, colName);
                if (colName)
                    params.dbFieldsFetcher(aceUtils.getCollectionName(line));
            });
        }
        else if (action == "remove") {
            var end = start + (e.lines.join(aceUtils.EOL).length);
            tsServ.editScriptByPos(script, start, end, [""]);
        }
        //console.log('syncTypeScriptServiceContent', start,end,e.lines);
    }
    ;
    langTools.setCompleters([
        mongoCompleters.getShellCmdCompleter(tsServ, fileName),
        tsCompleters.getTypeScriptAutoCompleters(tsServ, fileName, params.helpUrlFetcher),
        //TypescriptAuto会缓存语言服务的一些值
        tsCompleters.getTypescriptParameterCompleter(tsServ, fileName),
        mongoCompleters.getFieldCompleter(tsServ, fileName, params.dbFieldsFetcher),
        mongoCompleters.operatorsCompleter,
        mongoCompleters.dateRangeCompleter,
        mongoCompleters.getCollectionMethodsCompleter(tsServ, fileName, params.helpUrlFetcher),
    ]);
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
    var rst = {
        //editor,
        ts: tsServ,
        transpile: function (transferFunc) {
            var selectedText = editor.getSession().doc.getTextRange(editor.selection.getRange());
            var src = selectedText ? selectedText : editor.getValue();
            if (transferFunc)
                src = transferFunc(src);
            return typescript.transpile(src, compilerOptions);
        },
        format: function () {
            var newText = tsServ.format(fileName);
            editor.setValue(newText);
            return newText;
        },
        appendScriptContent: function (scriptFile, lines) {
            return tsServ.appendScriptContent(scriptFile, lines);
        }
    };
    editor["typescriptServ"] = rst;
    editor.commands.addCommand({
        name: 'Format Code',
        bindKey: { win: 'Alt-Shift-F', mac: 'Alt-Shift-F' },
        exec: function (editor) {
            //console.log("bindKey executed format Code");
            editor["typescriptServ"].format();
        }
    });
    //require("./aceElectronContextMenu")(editor);
    tsServ.setup(tsAndTypingFiles, compilerOptions);
    editor.addEventListener("change", onChangeDocument);
    editor.on("blur", function () {
        updateTsErrorMarkers();
    });
    function reloadDocument() {
        tsServ.updateScript(fileName, editor.getSession().getValue());
    }
    ;
    reloadDocument();
}
//default theme twilight
function setupAceEditor(params) {
    var editor = ace.edit(params.editorElem);
    editor.setOptions({ enableBasicAutocompletion: false });
    editor.$blockScrolling = Infinity;
    var theme = params.editorTheme || 'twilight';
    editor.setTheme("ace/theme/" + theme);
    editor.getSession().setMode("ace/mode/typescript");
    bindTypescriptExtension(editor, params);
    // _.defer(() => {
    //     //var start=Date.now();
    //     bindTypescriptExtension(editor, params);
    //     //console.log("setup editor elapsed", Date.now() - start);
    // });
    return editor;
}
exports.setupAceEditor = setupAceEditor;
