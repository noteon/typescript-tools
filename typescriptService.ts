// Copyright (c) Claus Reinke. All rights reserved.
// Licensed under the Apache License, Version 2.0.
// See LICENSE.txt in the project root for complete license information.

///<reference path='typings/node/node.d.ts'/>
///<reference path='node_modules/typescript/lib/typescript.d.ts'/>

import ts = require("typescript");
import harness = require("./harness");
import FileCache=require("./fileCache");
import path = require("path");

interface SignatureParam{
  name:string;
  isOptional:boolean;
  type:string;
  docComment:string;
}

interface SignatureHelpItemInfo {
  prefix:string;
  separator:string;
  suffix:string;
  parameters:SignatureParam[],
  docComment:string;
}

interface SignatureHelpItems {
    items: SignatureHelpItemInfo[];
    selectedItemIndex: number;
    argumentIndex: number;
    argumentCount: number;
}

function resolvePath(rpath) {
  return switchToForwardSlashes(path.resolve(rpath));
}

function switchToForwardSlashes(path: string) {
    return path.replace(/\\/g, "/");
}


//var EOL = require("os").EOL;
var EOL = "\n";

/** TypeScript Services Server,
    an interactive commandline tool
    for getting info on .ts projects */
export class TypescriptService {
  public compilerOptions: ts.CompilerOptions;
  public compilerHost: ts.CompilerHost;
  public lsHost : ts.LanguageServiceHost;
  public ls : ts.LanguageService;
  public rootFiles : string[];
  public lastError;

  constructor (public prettyJSON: boolean = false) { } // NOTE: call setup

  public fileCache: FileCache;

  /** collect syntactic and semantic diagnostics for all project files */
  private getErrors(): ts.Diagnostic[] {

      var addPhase = phase => d => {d.phase = phase; return d};
      var errors = [];
      this.fileCache.getFileNames().map( file=>{
        var syntactic = this.ls.getSyntacticDiagnostics(file);
        var semantic = this.ls.getSemanticDiagnostics(file);
        // this.ls.languageService.getEmitOutput(file).diagnostics;
        errors = errors.concat(syntactic.map(addPhase("Syntax"))
                              ,semantic.map(addPhase("Semantics")));
      });
      return errors;
  }
  
  
  

  /** flatten messageChain into string|string[] */
  private messageChain(message:string|ts.DiagnosticMessageChain) {
    if (typeof message==="string") {
      return [message];
    } else {
      return [message.messageText].concat(message.next?this.messageChain(message.next):[]);
    }
  }

  /** load file and dependencies, prepare language service for queries */
  public setup(files:{name:string, content?:string}[],options) {
    this.fileCache = new FileCache();
    
    this.rootFiles = files.map(file=>resolvePath(file.name));

    this.compilerOptions = options;
    this.compilerHost    = ts.createCompilerHost(options);

    //TODO: diagnostics

    // prime fileCache with root files and defaultLib
    var seenNoDefaultLib = options.noLib;
    
    files.forEach(file=>{
      var fullFileName=resolvePath(file.name);
      if (!file.content){
        var source = this.compilerHost.getSourceFile(fullFileName,options.target);
        
        if (source) {
          seenNoDefaultLib = seenNoDefaultLib || source.hasNoDefaultLib;
          this.fileCache.addFile(fullFileName,source.text);
        } else {
          throw ("tss cannot find file: "+file);
       }        
      }else{
        //seenNoDefaultLib = seenNoDefaultLib || source.hasNoDefaultLib;
        this.fileCache.addFile(fullFileName,file.content);
      }
    });
    
    if (!seenNoDefaultLib) {
      var defaultLibFileName = this.compilerHost.getDefaultLibFileName(options);
      var source = this.compilerHost.getSourceFile(defaultLibFileName,options.target);
      this.fileCache.addFile(defaultLibFileName,source.text);
    }

    // Get a language service
    // internally builds programs from root files,
    // chases dependencies (references and imports), ...
    // (NOTE: files are processed on demand, loaded via lsHost, cached in fileCache)
    
        
        
    this.lsHost = {
        getCompilationSettings : ()=>this.compilerOptions,
        getScriptFileNames : ()=>this.fileCache.getFileNames(),
        getScriptVersion : (fileName: string)=>this.fileCache.getScriptInfo(fileName).version.toString(),
        
        //comment by qinghai
        //getScriptIsOpen : (fileName: string)=>this.fileCache.getScriptInfo(fileName).isOpen,
        getScriptSnapshot : (fileName: string)=>this.fileCache.getScriptSnapshot(fileName),
        getCurrentDirectory : ()=>ts.sys.getCurrentDirectory(),
        getDefaultLibFileName :
          (options: ts.CompilerOptions)=>ts.getDefaultLibFileName(options),
        log : (message)=>undefined, // ??
        trace : (message)=>undefined, // ??
        error : (message)=>console.error(message) // ??
    };
    
    this.ls = ts.createLanguageService(this.lsHost,ts.createDocumentRegistry());
    this.fileCache.ls = this.ls;
  }


  /** recursively prepare navigationBarItems for JSON output */
  private handleNavBarItem(file:string,item:ts.NavigationBarItem) {
    // TODO: under which circumstances can item.spans.length be other than 1?
    return { info: [item.kindModifiers,item.kind,item.text].filter(s=>s!=="").join(" ")
           , kindModifiers : item.kindModifiers
           , kind: item.kind
           , text: item.text
           , min: this.fileCache.positionToLineCol(file,item.spans[0].start)
           , lim: this.fileCache.positionToLineCol(file,item.spans[0].start+item.spans[0].length)
           , childItems: item.childItems.map(item=>this.handleNavBarItem(file,item))
           };
  }
  
  public getSignatureInfo(file,line,col){
        var pos    = this.fileCache.lineColToPosition(file,line,col);

        return this.getSignatureInfoByPos(file,pos)
  }

  public getSignatureInfoByPos(file,pos){
         var info:any   = this.ls.getSignatureHelpItems(file,pos);

            var param = p=>({name:p.name
                            ,isOptional:p.isOptional
                            ,type:ts.displayPartsToString(p.displayParts)||""
                            ,docComment:ts.displayPartsToString(p.documentation)||""
                            });

            info && (info.items = info.items
                                      .map(item=>({prefix: ts.displayPartsToString(item.prefixDisplayParts)||""
                                                  ,separator: ts.displayPartsToString(item.separatorDisplayParts)||""
                                                  ,suffix: ts.displayPartsToString(item.suffixDisplayParts)||""
                                                  ,parameters: item.parameters.map(param)
                                                  ,docComment: ts.displayPartsToString(item.documentation)||""
                                                  }))
            );
            
            return <SignatureHelpItems>info;

  }

  
  public getQuickInfo(file, line, col) {
    var pos = this.fileCache.lineColToPosition(file, line, col);

    return this.getQuickInfoByPos(file,pos);
  }
  
  public getQuickInfoByPos(file, pos) {
    //console.log('getQuickInfo',pos,this.ls.getQuickInfoAtPosition(file, pos)); 
    var info: any = (this.ls.getQuickInfoAtPosition(file, pos) || {});
    info.type = ((info && ts.displayPartsToString(info.displayParts)) || "");
    info.docComment = ((info && ts.displayPartsToString(info.documentation)) || "");

    return info;
  }
  
  public getDefinitionInfo(file, line, col) {
    var pos = this.fileCache.lineColToPosition(file, line, col);
    return this.getDefinitionInfoByPos(file,pos);
  }
  
    public getDefinitionInfoByPos(file, pos):{def:ts.DefinitionInfo, file:string,min:any, lim:any, content:string} {
    var locs = this.ls.getDefinitionAtPosition(file, pos); // NOTE: multiple definitions
    
    

    var info: any = locs && locs.map(def => {
      var snapshot=def && this.fileCache.getScriptSnapshot(def.fileName);
      
      return  {
        def: def,
        file: def && def.fileName,
        min: def && this.fileCache.positionToLineCol(def.fileName, def.textSpan.start),
        lim: def && this.fileCache.positionToLineCol(def.fileName, ts.textSpanEnd(def.textSpan)),
        content: snapshot && snapshot.getText(def.textSpan.start,def.textSpan.length+def.textSpan.start)
      }
    });

    // TODO: what about multiple definitions?
    return ((locs && info[0]) || null);
  }

  
  //occurences:false, to getReferences  
  public getReferencesOrOccurrencesInfo(occurences:boolean, file,line,col){
           var   pos  = this.fileCache.lineColToPosition(file,line,col);
           
           var refs= occurences?this.ls.getOccurrencesAtPosition(file, pos):this.ls.getReferencesAtPosition(file, pos);
           
           var info = (refs || []).map( ref => {
            var start, end, fileName, lineText;
            if (ref) {
              start    = this.fileCache.positionToLineCol(ref.fileName,ref.textSpan.start);
              end      = this.fileCache.positionToLineCol(ref.fileName,ts.textSpanEnd(ref.textSpan));
              fileName = resolvePath(ref.fileName);
              lineText = this.fileCache.getLineText(fileName,start.line);
            }
            return {
              ref      : ref,
              file     : ref && ref.fileName,
              lineText : lineText,
              min      : start,
              lim      : end
            }} );

          return info;

  }
  
  public getNavigationBarItemsInfo(file){
       return this.ls.getNavigationBarItems(file)
                          .map(item=>this.handleNavBarItem(file,item));
  }

  public getCompletionEntryDetailsInfo(file,pos,name){
    var d = this.ls.getCompletionEntryDetails(file, pos, name);
    if (d) {
      d["type"] = ts.displayPartsToString(d.displayParts);
      d["docComment"] = ts.displayPartsToString(d.documentation);
      return d;
    } 
  }
  
  public getCompletionsInfoByPos(brief:boolean, file, pos){
         var startTime=Date.now();
         var info:any = this.ls.getCompletionsAtPosition(file, pos) || null;
         //console.log("getCompletionsInfoByPos", info);
         
          if (info) {
            // fill in completion entry details, unless briefness requested
            !brief && (info.entries = info.entries.map( e =>{
                        var d = this.getCompletionEntryDetailsInfo(file,pos, e.name)
                        if (d) {
                          return d;
                        } else {
                          return e;
                        }} ));
                        // NOTE: details null for primitive type symbols, see TS #1592

            (()=>{ // filter entries by prefix, determined by pos
              var languageVersion = this.compilerOptions.target;
              var source   = this.fileCache.getScriptInfo(file).content;
              var startPos = pos;
              var idPart   = p => /[0-9a-zA-Z_$]/.test(source[p])
                               || ts.isIdentifierPart(source.charCodeAt(p),languageVersion);
              var idStart  = p => /[a-zA-Z_$]/.test(source[p])
                               || ts.isIdentifierStart(source.charCodeAt(p),languageVersion);
              while ((--startPos>=0) && idPart(startPos) );
              if ((++startPos < pos) && idStart(startPos)) {
                var prefix = source.slice(startPos,pos);
                info["prefix"] = prefix;
                
                
                var len    = prefix.length;
                
                //console.log("info.entries",info.entries);
                
                info.entries = info.entries.filter( e => e.name.substr(0,len).toLowerCase()===prefix.toLowerCase() );
              }
            })();
          }
       return info;
  }


  public getCompletionsInfo(brief:boolean, file, line,col){
         var     pos    = this.fileCache.lineColToPosition(file,line,col);

         return this.getCompletionsInfoByPos(brief, file, pos)
  }
  
  public getNavigateToItemsInfo(pattern){
        return this.ls.getNavigateToItems(pattern)
                   .map(item=>{
                      item['min'] = this.fileCache.positionToLineCol(item.fileName
                                                                    ,item.textSpan.start);
                      item['lim'] = this.fileCache.positionToLineCol(item.fileName
                                                                    ,item.textSpan.start
                                                                    +item.textSpan.length);
                      return item;
                    });

  }
  
  public updateScript(file, content){
    this.fileCache.updateScript(file,content);
  }
  
  public editScript(file, startLine, endLine, lines:string[]){
    var script = this.fileCache.getScriptInfo(file);
    var maxLines = this.ls.getSourceFile(file).getLineStarts().length;
    var startPos = startLine <= maxLines
      ? (startLine < 1 ? 0 : this.fileCache.lineColToPosition(file, startLine, 1))
      : script.content.length;
    var endPos = endLine < maxLines
      ? (endLine < 1 ? 0 : this.fileCache.lineColToPosition(file, endLine + 1, 0) - 1) //??CHECK
      : script.content.length;

    this.fileCache.editScript(file, startPos, endPos, lines.join(EOL));
  }
  
  public editScriptByPos(file,startPos,endPos, newLines:string[]){
    this.fileCache.editScript(file, startPos, endPos, newLines.join(EOL));
  }
  
  public appendScriptContent(file, newLines:string[]){
    var script = this.fileCache.getScriptInfo(file);
    var startPos= script.content.length;
    var endPos=script.content.length;
    
    this.fileCache.editScript(file, startPos, endPos, newLines.join(EOL));
  }
  
  public getErrorsInfo(){
   
    
    return this.ls.getProgram().getGlobalDiagnostics()
      .concat(this.getErrors())
      .map(d => {
        if (d.file) {

          var file = resolvePath(d.file.fileName);
          var lc = this.fileCache.positionToLineCol(file, d.start);
          var len = this.fileCache.getScriptInfo(file).content.length;
          var end = Math.min(len, d.start + d.length);
          // NOTE: clamped to end of file (#11)
          var lc2 = this.fileCache.positionToLineCol(file, end);
          return {
            file: file,
            start: { line: lc.line, character: lc.character },
            end: { line: lc2.line, character: lc2.character },
            text: this.messageChain(d.messageText).join(EOL),
            code: d.code,
            phase: d["phase"],
            category: ts.DiagnosticCategory[d.category]
          };

        } else { // global diagnostics have no file

          return {
            text: this.messageChain(d.messageText).join(EOL),
            code: d.code,
            phase: d["phase"],
            category: ts.DiagnosticCategory[d.category]
          };

        }
      }
        );
    
  }
  
  public getScriptFileNames(){
    return this.lsHost.getScriptFileNames(); // TODO: files are pre-resolved
  }
  
  public reload(){
    // TODO: keep updated (in-memory-only) files?
      var files=this.rootFiles.map((it)=>{return {name:it}});
    
    
      return this.setup(files,this.compilerOptions);
  }
  
  public transpile(fileName){
    var tsRst=this.ls.getEmitOutput(fileName) 
    
    return tsRst && tsRst.outputFiles && tsRst.outputFiles[0] && tsRst.outputFiles[0].text;  
  }

  public createDefaultFormatCodeOptions(): ts.FormatCodeOptions {
    return {
        IndentSize: 4,
        TabSize: 4,
        NewLineCharacter: '\r\n',
        ConvertTabsToSpaces: true,
        InsertSpaceAfterCommaDelimiter: true,
        InsertSpaceAfterSemicolonInForStatements: true,
        InsertSpaceBeforeAndAfterBinaryOperators: true,
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
        InsertSpaceAfterKeywordsInControlFlowStatements: true,
        InsertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
        PlaceOpenBraceOnNewLineForFunctions: false,
        PlaceOpenBraceOnNewLineForControlBlocks: false
    };
 }

  public format(fileName,text?:string, options?:ts.FormatCodeOptions){
    let content=text;
    if (!content)
        content=this.fileCache.getScriptInfo(fileName).content;
    
     return require('./tsFormatter')(fileName, content, options);
  }

}
