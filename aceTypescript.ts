/// <reference path="./typings/tsd.d.ts" />

_ = require("lodash");

var aceUtils = require("./aceUtils");
var ts = require("./typescriptService");
var tsCompleters = require('./typescriptCompleters');
var mongoCompleters = require('./mongoCompleters');
var sourceMap=require("source-map");
var typescript = require("typescript");

//var fs = require("browserify-fs");
var langTools = ace.require("ace/ext/language_tools");
var AceRange = ace.require('ace/range').Range;

// interface AceTs {
//     ts: ts.TypescriptService;
//     transpile: () => string;
//     format: () => string;
// }

interface AceTsSetupParams {
    tsFilePath: string;
    disableErrorInsight:boolean;
    tsFileInitContent?: string;
    tsTypings?: (string|{ path: string; content?: string })[];
    editorElem: string|HTMLElement, editorTheme?: string;
    dbFieldsFetcher?: (collectionName?: string) => { fieldName: string; collection: string }[];
    helpUrlFetcher?: (methodDotName: string) => string;//methodDotName like: "mongo.ICollection.find"
    handleF1MethodHelp?:(docUrl:string,methodDotName:string)=>string;//
}

function bindTypescriptExtension(editor: AceAjax.Editor, params) {
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
    let compilerOptions = { target: typescript.ScriptTarget.ES5, "module": typescript.ModuleKind.CommonJS, sourceMap:true };

    var errorMarkers = [];
    
    let lastChangedTime=Date.now();
    
    function updateTsErrorMarkers() {
        var session = editor.getSession();
        
        if ($(".ace_editor.ace_autocomplete").is(":visible") && _.isEmpty(session.getAnnotations())) return;
        
        var addPhase = phase => d => { d.phase = phase; return d };

        var syntactic = tsServ.ls.getSyntacticDiagnostics(fileName);
        var semantic = tsServ.ls.getSemanticDiagnostics(fileName);
        // this.ls.languageService.getEmitOutput(file).diagnostics;
        var errors = [].concat(syntactic.map(addPhase("Syntax"))
            , semantic.map(addPhase("Semantics")));




        errorMarkers.forEach((id) => {
            session.removeMarker(id);
        });

        var annotations: AceAjax.Annotation[] = [];
        

        errors.forEach((error) => {
            //var getpos = aceEditorPosition.getAcePositionFromChars;
            var doc = editor.getSession().getDocument()

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
            errorMarkers.push(session.addMarker(range, "typescript-error", "text", true));
            
            
            var getMessageType = (error) => {
                if (error.category === 0)
                    return 'warning'

                if (error.category === 1)
                    return 'error'

                return 'info'
            }

            var getErrorText=(error)=>{
                if (!error) return ""
                
                if (_.isString(error.messageText)) return error.messageText;
                
                return error.messageText.messageText;//DiagnosticMessageChain
            }

            annotations.push({
                row: start.row,
                column: start.column,
                text: getErrorText(error),
                type: getMessageType(error),
                //raw:"test"                
            });
        });

        session.setAnnotations(annotations);
    }
    
   

    let checkTsErrorHandler;
    let triggerCheckTsErrorHandler=()=>{
        checkTsErrorHandler=setInterval(()=>{
            let now=Date.now();
            if ((now-lastChangedTime)<250) return ;
    
            updateTsErrorMarkers();
            
            clearInterval(checkTsErrorHandler);   
            checkTsErrorHandler=undefined;      
        },100);
    }
    
    function onChangeDocument(e: AceAjax.EditorChangeEvent) {
        //reloadDocument();
        lastChangedTime=Date.now();
        try {
            if (!params.disableErrorInsight && !checkTsErrorHandler){
                triggerCheckTsErrorHandler();
            }
            
            syncTypeScriptServiceContent(fileName, e);
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
        tsCompleters.fetchParamsPlaceHolderCompleter(tsServ,fileName),
        mongoCompleters.getShellCmdCompleter(tsServ, fileName),//getShellCmdCompleter置顶，它增加了session.__includeShellCmdSpaceChar
        
        tsCompleters.getTypeScriptAutoCompleters(tsServ, fileName, params.helpUrlFetcher),//注，Completer的顺序很重要，getTypeScriptAutoCompleters必须置顶，
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
        //enableLiveAutocompletion: true
    });


    editor.commands.on("afterExec", function(e) {
        if (e.command.name === "Tab" || e.command.name === "Return") {
            
            let canStartAuto=(()=>{
                let curChar=aceUtils.getCurChar(editor.getSession(), editor.getCursorPosition());
                if (curChar && curChar.trim()!=="") return true;
                
                let prevChar=aceUtils.getPrevChar(editor.getSession(), editor.getCursorPosition());
                if ([".","(","'",'"',"{"].indexOf(prevChar)>-1) return true;
                
                return false;
            })();
            
            if (canStartAuto)
               editor.execCommand("startAutocomplete");
        }
            
        if (e.command.name == "insertstring" && /^[\w.\(\,\$\'\"]$/.test(e.args)) {
            editor.execCommand("startAutocomplete")
        }
    })



    require('./quickAndDefinitionTooltip').setupTooltip(editor, tsServ, fileName,params.helpUrlFetcher);
    
    

    var rst = {
        //editor,
        ts: tsServ,
        transpile: (transferFunc?: (src: string) => string) => {
            let selectedText = editor.getSession().doc.getTextRange(editor.selection.getRange());
            let src = selectedText ? selectedText : editor.getValue();
            if (transferFunc)
                src = transferFunc(src);

            let transRst= typescript.transpileModule(src, {compilerOptions});
           // console.log(transRst.sourceMapText);
            rst["sourceMap"]=new sourceMap.SourceMapConsumer(transRst.sourceMapText);
            
            
            return transRst.outputText;
        },
        format: () => {
            var newText = tsServ.format(fileName);
            editor.setValue(newText);
            editor.selection.clearSelection();
            editor.gotoLine(1);

            return newText;
        },

        appendScriptContent: (scriptFile, lines: string[]) => {
            return tsServ.appendScriptContent(scriptFile, lines);
        },
        
        updateScript: (scriptFile, content:string) => {
            return tsServ.updateScript(scriptFile, content);
        },
        
        reloadDocument,
        
        getOriginPos({row,column}){//0-based
            let result=rst["sourceMap"].originalPositionFor({line:row+1,column});
            if (result && result.line){
                return {row:result.line-1, column:result.column}
            }else return;
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
    
    
   editor.commands.addCommand({
        name: 'View Mongo Online Help if available',
        bindKey: { win: 'F1', mac: 'F1' },
        exec: function(editor) {
            if (!params.handleF1MethodHelp) return;
            if (editor.tokenTooltip && editor.tokenTooltip.isOpen && editor.tokenTooltip.__currentDocUrl){
                return params.handleF1MethodHelp(editor.tokenTooltip.__currentDocUrl);
            }
            
            
            var posChar = tsServ.fileCache.lineColToPosition(fileName, editor.getCursorPosition().row + 1, editor.getCursorPosition().column + 1);

            var quickInfo = tsServ.getQuickInfoByPos(fileName, posChar);
            //console.log({quickInfo});
            //"(property) mongo.ICollection.find: () => void"
            //"(method) mongo.IDatabase.getCollection(name:string): mongo.ICollection"

            if (quickInfo && quickInfo.type && quickInfo.type !== "any") {//any is invalid tooltip
                if (params.helpUrlFetcher){
                    let methodDotName=aceUtils.getMethodDotName(quickInfo.type);
                    if (methodDotName){
                      let docUrl=params.helpUrlFetcher(methodDotName); 
                       params.handleF1MethodHelp(docUrl,methodDotName);
                    }
                    // if (docUrl){
                    //     require("shell").openExternal(docUrl);
                    //     //console.log({docUrl});
                    // }
                }
            }
        }
    });

    //require("./aceElectronContextMenu")(editor);


    tsServ.setup(tsAndTypingFiles, compilerOptions);


    editor.addEventListener("change", onChangeDocument);
    editor.on("blur", ()=>{       
        updateTsErrorMarkers();
    });
    

    function reloadDocument() {
        tsServ.updateScript(fileName, editor.getSession().getValue());
    };
    

    reloadDocument();
}


let aceInjected=false;

//default theme twilight
export function setupAceEditor(params: AceTsSetupParams): AceAjax.Editor {
    
    if (!aceInjected){
        aceInjected=true;
        aceUtils.appendTooltipToBody();
        aceUtils.injectCompleterToAdjustMethodParamWidth();
    }
    
    var editor = ace.edit(<any>params.editorElem);

    editor.setOptions({ enableBasicAutocompletion: false });
    editor.$blockScrolling = Infinity;


    var theme = params.editorTheme || 'twilight';
    editor.setTheme(`ace/theme/${theme}`);
    editor.getSession().setMode("ace/mode/typescript");

    bindTypescriptExtension(editor, params);
    
    // _.defer(() => {
    //     //var start=Date.now();
    //     bindTypescriptExtension(editor, params);
    //     //console.log("setup editor elapsed", Date.now() - start);
    // });


    return editor;
}	
	