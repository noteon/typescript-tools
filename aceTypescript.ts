/// <reference path="./typings/tsd.d.ts" />

import aceUtils = require("./aceUtils");
import ts = require("./typescriptService");
import tsCompleters = require('./typescriptCompleters');
import mongoCompleters = require('./mongoCompleters');
import typescript = require("typescript");

import fs = require("fs");
_ = require("lodash");

interface AceTs {
    ts: ts.TypescriptService;
    transpile: () => string;
    format: () => string;
}

interface AceTsSetupParams {
    tsFilePath: string;
    tsFileInitContent?: string;
    tsTypings?: (string|{ path: string; content?: string })[];
    editorElem: string|HTMLElement, editorTheme?: string;
    dbFieldsFetcher?: (collectionName?: string) => { fieldName: string; collection: string }[];
    helpUrlFetcher?: (methodDotName: string) => string;//methodDotName like: " mongo.ICollection.find"
}

//default theme twilight
export function setupAceEditor(params: AceTsSetupParams): AceAjax.Editor {

    var langTools = ace.require("ace/ext/language_tools");
    var AceRange = ace.require('ace/range').Range;

    var editor = ace.edit(<any>params.editorElem);
    editor.setOptions({ enableBasicAutocompletion: false });
    editor.$blockScrolling = Infinity;

    var theme = params.editorTheme || 'twilight';
    editor.setTheme(`ace/theme/${theme}`);
    editor.getSession().setMode("ace/mode/typescript");

    var tsServ = new ts.TypescriptService();
    var fileName = params.tsFilePath;
    //console.log(__dirname+"/lodash.d.ts");
    
    var tsAndTypingFiles = [];
    tsAndTypingFiles.push({ name: fileName, content: params.tsFileInitContent || "//////" });

    params.tsTypings && params.tsTypings.forEach((it: any) => {
        if (it.path)
            tsAndTypingFiles.push({ name: it.path, content: it.content || typescript.sys.readFile(it.path) })
        else
            tsAndTypingFiles.push({ name: it, content: typescript.sys.readFile(it.path) });

    })
    
    //target 1= ES5
    let compilerOptions = { target: typescript.ScriptTarget.ES5, "module": typescript.ModuleKind.CommonJS };

    tsServ.setup(tsAndTypingFiles, compilerOptions);

    editor.addEventListener("change", onChangeDocument);
    //    editor.addEventListener("update", onUpdateDocument);

    function reloadDocument() {
        tsServ.updateScript(fileName, editor.getSession().getValue());
    };

    reloadDocument();

    var errorMarkers = [];
    function updateMarker(e: AceAjax.EditorChangeEvent) {
        var addPhase = phase => d => { d.phase = phase; return d };

        var syntactic = tsServ.ls.getSyntacticDiagnostics(fileName);
        var semantic = tsServ.ls.getSemanticDiagnostics(fileName);
        // this.ls.languageService.getEmitOutput(file).diagnostics;
        var errors = [].concat(syntactic.map(addPhase("Syntax"))
            , semantic.map(addPhase("Semantics")));


        var session = editor.getSession();


        errorMarkers.forEach((id) => {
            session.removeMarker(id);
        });

        var annotations: AceAjax.Annotation[] = [];

        errors.forEach((error) => {
            //var getpos = aceEditorPosition.getAcePositionFromChars;
            var doc = editor.getSession().getDocument()

            var start = aceUtils.getPosition(doc, error.start);
            var end = aceUtils.getPosition(doc, error.start + error.length);
            var range = new AceRange(start.row, start.column, end.row, end.column);
            
            //ignore mongo command like: user db1
            if (start.row === end.row) {
                var line = editor.getSession().getLine(start.row).trim();
                //console.log("error marker", line, start.row)
                if (/^(help|use|show) ?$/.test(line) || /^(help|use|show) .*$/.test(line))
                    return;
            }
            
            //console.log("session push marker",start.row,start.column);
            errorMarkers.push(session.addMarker(range, "typescript-error", "text", true));
            
            
            //errorMarkers.push(session.addMarker(range, "typescript-error", error.messageText, false));
            
            //console.log("add annotation", start.row, start.column, error.messageText);
            var getMessageType = (error) => {
                if (error.category === 0)
                    return 'warning'

                if (error.category === 1)
                    return 'error'

                return 'info'
            }

            annotations.push({
                row: start.row,
                column: start.column,
                text: error.messageText,
                type: getMessageType(error),
                //raw:"test"                
            });
        });

        session.setAnnotations(annotations);
    }


    var throttledUpdateMarker = _.throttle(updateMarker, 100);
    var debounceUpdateMarker = _.debounce(throttledUpdateMarker, 500);

    function onChangeDocument(e: AceAjax.EditorChangeEvent) {
        //reloadDocument();
        try {
            syncTypeScriptServiceContent(fileName, e);

            var startAt = Date.now();

            var cursorRow = editor.getCursorPosition().row;

            if (e.start.row === cursorRow && e.end.row === cursorRow && e.lines && e.lines.join(aceUtils.EOL).length === 1) {
                debounceUpdateMarker(e)
            } else
                throttledUpdateMarker(e)
                
            //console.log("update Error Markers", Date.now()-startAt);        
                
        } catch (ex) {

        }
    }
    
    //sync LanguageService content and ace editor content
    function syncTypeScriptServiceContent(script, e: AceAjax.EditorChangeEvent) {
        var doc = editor.getSession().getDocument()

        var action = e.action;
        var start = aceUtils.getChars(doc, e.start);

        if (action == "insert") {
            var end = aceUtils.getChars(doc, e.end);
            end = end - (e.lines.join(aceUtils.EOL).length);

            tsServ.editScriptByPos(script, start, end, e.lines);

            e.lines.forEach((line) => {
                if (!line) return;
                if (line.length < 3) return; // db.
                
                var colName = aceUtils.getCollectionName(line);
                // console.log("syncType",line, colName);

                
                if (colName)
                    params.dbFieldsFetcher(aceUtils.getCollectionName(line));
            })
        } else if (action == "remove") {
            var end = start + (e.lines.join(aceUtils.EOL).length)

            tsServ.editScriptByPos(script, start, end, [""]);
        }
        //console.log('syncTypeScriptServiceContent', start,end,e.lines);
    };

    langTools.setCompleters([
        mongoCompleters.getFieldCompleter(tsServ, fileName, params.dbFieldsFetcher),
        mongoCompleters.operatorsCompleter,
        mongoCompleters.getShellCmdCompleter(tsServ, fileName, params.dbFieldsFetcher),
        tsCompleters.getTypescriptParameterCompleter(tsServ, fileName),
        tsCompleters.getTypeScriptAutoCompleters(tsServ, fileName, params.helpUrlFetcher),
    ]);
    
    //langTools.setCompleters([typescriptCompleter,typeScriptParameterCompleter]);
    
    editor.setOptions({
        enableBasicAutocompletion: true,
        //enableLiveAutocompletion: true
    });


    editor.commands.on("afterExec", function(e) {
        if (e.command.name == "insertstring" && /^[\w.\(\,\$\'\"]$/.test(e.args)) {
            editor.execCommand("startAutocomplete")
        }
    })


    require('./quickAndDefinitionTooltip').setupTooltip(editor, tsServ, fileName);

    var rst = {
        //editor,
        ts: tsServ,
        transpile: (transferFunc?: (src: string) => string) => {
            let selectedText = editor.getSession().doc.getTextRange(editor.selection.getRange());
            let src = selectedText ? selectedText : editor.getValue();
            if (transferFunc)
                src = transferFunc(src);

            return typescript.transpile(src, <any>compilerOptions)
        },
        format: () => {
            var newText = tsServ.format(fileName);
            editor.setValue(newText);

            return newText;
        },

        appendScriptContent: (scriptFile, lines: string[]) => {
            return tsServ.appendScriptContent(scriptFile, lines);
        }
    }

    editor["typescriptServ"] = rst;

    editor.commands.addCommand({
        name: 'Format Code',
        bindKey: { win: 'Alt-Shift-F', mac: 'Alt-Shift-F' },
        exec: function(editor) {
            //console.log("bindKey executed format Code");
            editor["typescriptServ"].format();
        }
    });

    require("./aceElectronContextMenu")(editor);

    return editor;
}	
	