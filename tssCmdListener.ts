// Copyright (c) Claus Reinke. All rights reserved.
// Licensed under the Apache License, Version 2.0.
// See LICENSE.txt in the project root for complete license information.

///<reference path='typings/node/node.d.ts'/>
///<reference path='node_modules/typescript/lib/typescript.d.ts'/>

import ts = require("typescript");
import path = require("path");
import tsServ=require("./typescriptService");

function resolvePath(rpath) {
  return switchToForwardSlashes(path.resolve(rpath));
}

function switchToForwardSlashes(path: string) {
    return path.replace(/\\/g, "/");
}

var EOL = require("os").EOL;

// some approximated subsets..
interface ReadlineHandlers {
  on(event: string, listener: (event:string)=>void) : ReadlineHandlers;
  close() : void;
}

interface Readline {
  createInterface(options:any) : ReadlineHandlers;
}

// bypass import, we don't want to drop out of the global module;
// use fixed readline (https://github.com/joyent/node/issues/3305),
// fixed version should be in nodejs from about v0.9.9/v0.8.19?
var readline:Readline = require("./readline");


class TSSCmdListener extends tsServ.TypescriptService {


  // /** flatten messageChain into string|string[] */
  // private messageChain(message:string|ts.DiagnosticMessageChain) {
  //   if (typeof message==="string") {
  //     return [message];
  //   } else {
  //     return [message.messageText].concat(message.next?this.messageChain(message.next):[]);
  //   }
  // }


  /** output value/object as JSON, excluding irrelevant properties,
   *  with optional pretty-printing controlled by this.prettyJSON
   *  @param info thing to output
   *  @param excludes Array of property keys to exclude
   */
  private output(info,excludes=["displayParts"]) {
    var replacer = (k,v)=>excludes.indexOf(k)!==-1?undefined:v;
    if (info) {
      console.log(JSON.stringify(info,replacer,this.prettyJSON?" ":undefined).trim());
    } else {
      console.log(JSON.stringify(info,replacer));
    }
  }

  private outputJSON(json) {
    console.log(json.trim());
  }

  
  /** commandline server main routine: commands in, JSON info out */
  public listen() {
    var line: number;
    var col: number;

    var rl = readline.createInterface({input:process.stdin,output:process.stdout});

    var cmd:string, pos:number, file:string, script, added:boolean, range:boolean, check:boolean
      , def, refs:ts.ReferenceEntry[], locs:ts.DefinitionInfo[], info, source:ts.SourceFile
      , brief, member:boolean, navbarItems:ts.NavigationBarItem[], pattern:string;

    var collecting = 0, on_collected_callback:()=>void, lines:string[] = [];

    var commands = {};
    function match(cmd,regexp) {
      commands[regexp.source] = true;
      return cmd.match(regexp);
    }

    rl.on('line', input => {  // most commands are one-liners
      var m:string[];
      try {

        cmd = input.trim();

        if (collecting>0) { // multiline input, eg, source

          lines.push(input)
          collecting--;

          if (collecting===0) {
            on_collected_callback();
          }

        } else if (m = match(cmd,/^signature (\d+) (\d+) (.*)$/)) { // only within call parameters?

          (()=>{
            line   = parseInt(m[1]);
            col    = parseInt(m[2]);
            file   = resolvePath(m[3]);

              
            this.output(this.getSignatureInfo(file,line,col));
          })();

        } else if (m = match(cmd,/^(type|quickInfo) (\d+) (\d+) (.*)$/)) { // "type" deprecated

          line   = parseInt(m[2]);
          col    = parseInt(m[3]);
          file   = resolvePath(m[4]);

          this.output(this.getQuickInfo(file,line,col));

        } else if (m = match(cmd,/^definition (\d+) (\d+) (.*)$/)) {

          line = parseInt(m[1]);
          col  = parseInt(m[2]);
          file = resolvePath(m[3]);

          // TODO: what about multiple definitions?
          this.output(this.getDefinitionInfo(file,line,col));

        } else if (m = match(cmd,/^(references|occurrences) (\d+) (\d+) (.*)$/)) {

          line = parseInt(m[2]);
          col  = parseInt(m[3]);
          file = resolvePath(m[4]);

          pos  = this.fileCache.lineColToPosition(file,line,col);
          
          var isOccurences;
          switch (m[1]) {
            case "references":
              isOccurences=false;
              break;
            case "occurrences":
              isOccurences=true;
              break;
            default:
              throw "cannot happen";
          }

          this.output(this.getReferencesOrOccurrencesInfo(isOccurences,file,line,col));

        } else if (m = match(cmd,/^navigationBarItems (.*)$/)) {

          file = resolvePath(m[1]);

          this.output(this.getNavigationBarItemsInfo(file));

        } else if (m = match(cmd,/^navigateToItems (.*)$/)) {

          pattern = m[1];
          return this.getNavigateToItemsInfo(pattern);
          
        } else if (m = match(cmd,/^completions(-brief)?( true| false)? (\d+) (\d+) (.*)$/)) {

          brief  = m[1];
          line   = parseInt(m[3]);
          col    = parseInt(m[4]);
          file   = resolvePath(m[5]);

          this.output(this.getCompletionsInfo(brief,file,line,col),["displayParts","documentation","sortText"]);

        } else if (m = match(cmd,/^update( nocheck)? (\d+)( (\d+)-(\d+))? (.*)$/)) { // send non-saved source

          file       = resolvePath(m[6]);
          
          added      = !this.fileCache.getScriptInfo(file);
          range      = !!m[3]
          check      = !m[1]

          if (!added || !range) {
            collecting = parseInt(m[2]);
            on_collected_callback = () => {

              if (!range) {
                this.updateScript(file,lines.join(EOL))
              } else {
                var startLine = parseInt(m[4]);
                var endLine   = parseInt(m[5]);
                
                this.editScript(file,startLine,endLine,lines);
              }
              var syn:number,sem:number;
              if (check) {
                syn = this.ls.getSyntacticDiagnostics(file).length;
                sem = this.ls.getSemanticDiagnostics(file).length;
              }
              on_collected_callback = undefined;
              lines = [];

              this.outputJSON((added ? '"added ' : '"updated ')
                              +(range ? 'lines'+m[3]+' in ' : '')
                              +file+(check ? ', ('+syn+'/'+sem+') errors' : '')+'"');
            };
          } else {
            this.outputJSON('"cannot update line range in new file"');
          }

        } else if (m = match(cmd,/^showErrors$/)) { // get processing errors
          this.output(this.getErrorsInfo());

        } else if (m = match(cmd,/^files$/)) { // list files in project

          this.output(this.getScriptFileNames());

        } else if (m = match(cmd,/^lastError(Dump)?$/)) { // debugging only

          if (this.lastError)
            if (m[1]) // commandline use
              console.log(JSON.parse(this.lastError).stack);
            else
              this.outputJSON(this.lastError);
          else
            this.outputJSON('"no last error"');

        } else if (m = match(cmd,/^dump (\S+) (.*)$/)) { // debugging only

          (()=>{
            var dump = m[1];
            var file = resolvePath(m[2]);

            var sourceText = this.fileCache.getScriptInfo(file).content;
            if (dump==="-") { // to console
              console.log('dumping '+file);
              console.log(sourceText);
            } else { // to file
              ts.sys.writeFile(dump,sourceText,false);

              this.outputJSON('"dumped '+file+' to '+dump+'"');
            }
          })();

        } else if (m = match(cmd,/^reload$/)) { // reload current project

          // TODO: keep updated (in-memory-only) files?
          this.reload();
          this.outputJSON(this.listeningMessage('reloaded'));

        } else if (m = match(cmd,/^quit$/)) {

          rl.close();

        } else if (m = match(cmd,/^prettyJSON (true|false)$/)) { // useful for debugging

          this.prettyJSON = m[1]==='true';

          this.outputJSON('"pretty JSON: '+this.prettyJSON+'"');

        } else if (m = match(cmd,/^help$/)) {

          console.log(Object.keys(commands).join(EOL));

        } else {

          this.outputJSON('"TSS command syntax error: '+cmd+'"');

        }

      } catch(e) {

          this.lastError = (JSON.stringify({msg:e.toString(),stack:e.stack})).trim();
          this.outputJSON('"TSS command processing error: '+e+'"');

      }

    }).on('close', () => {

          this.outputJSON('"TSS closing"');

    });

    this.outputJSON(this.listeningMessage('loaded'));

  }

  private listeningMessage(prefix) {
    var count = this.rootFiles.length-1;
    var more  = count>0 ? ' (+'+count+' more)' : '';
    return '"'+prefix+' '+this.rootFiles[0]+more+', TSS listening.."';
  }
}

export = TSSCmdListener;