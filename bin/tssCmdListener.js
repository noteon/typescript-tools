// Copyright (c) Claus Reinke. All rights reserved.
// Licensed under the Apache License, Version 2.0.
// See LICENSE.txt in the project root for complete license information.
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
///<reference path='typings/node/node.d.ts'/>
///<reference path='node_modules/typescript/bin/typescript.d.ts'/>
var ts = require("typescript");
var path = require("path");
var TypescriptService = require("./typescriptService");
function resolvePath(rpath) {
    return switchToForwardSlashes(path.resolve(rpath));
}
function switchToForwardSlashes(path) {
    return path.replace(/\\/g, "/");
}
var EOL = require("os").EOL;
// bypass import, we don't want to drop out of the global module;
// use fixed readline (https://github.com/joyent/node/issues/3305),
// fixed version should be in nodejs from about v0.9.9/v0.8.19?
var readline = require("./readline");
var TSSCmdListener = (function (_super) {
    __extends(TSSCmdListener, _super);
    function TSSCmdListener() {
        _super.apply(this, arguments);
    }
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
    TSSCmdListener.prototype.output = function (info, excludes) {
        if (excludes === void 0) { excludes = ["displayParts"]; }
        var replacer = function (k, v) { return excludes.indexOf(k) !== -1 ? undefined : v; };
        if (info) {
            console.log(JSON.stringify(info, replacer, this.prettyJSON ? " " : undefined).trim());
        }
        else {
            console.log(JSON.stringify(info, replacer));
        }
    };
    TSSCmdListener.prototype.outputJSON = function (json) {
        console.log(json.trim());
    };
    /** commandline server main routine: commands in, JSON info out */
    TSSCmdListener.prototype.listen = function () {
        var _this = this;
        var line;
        var col;
        var rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        var cmd, pos, file, script, added, range, check, def, refs, locs, info, source, brief, member, navbarItems, pattern;
        var collecting = 0, on_collected_callback, lines = [];
        var commands = {};
        function match(cmd, regexp) {
            commands[regexp.source] = true;
            return cmd.match(regexp);
        }
        rl.on('line', function (input) {
            var m;
            try {
                cmd = input.trim();
                if (collecting > 0) {
                    lines.push(input);
                    collecting--;
                    if (collecting === 0) {
                        on_collected_callback();
                    }
                }
                else if (m = match(cmd, /^signature (\d+) (\d+) (.*)$/)) {
                    (function () {
                        line = parseInt(m[1]);
                        col = parseInt(m[2]);
                        file = resolvePath(m[3]);
                        _this.output(_this.getSignatureInfo(file, line, col));
                    })();
                }
                else if (m = match(cmd, /^(type|quickInfo) (\d+) (\d+) (.*)$/)) {
                    line = parseInt(m[2]);
                    col = parseInt(m[3]);
                    file = resolvePath(m[4]);
                    _this.output(_this.getQuickInfo(file, line, col));
                }
                else if (m = match(cmd, /^definition (\d+) (\d+) (.*)$/)) {
                    line = parseInt(m[1]);
                    col = parseInt(m[2]);
                    file = resolvePath(m[3]);
                    // TODO: what about multiple definitions?
                    _this.output(_this.getDefinitionInfo(file, line, col));
                }
                else if (m = match(cmd, /^(references|occurrences) (\d+) (\d+) (.*)$/)) {
                    line = parseInt(m[2]);
                    col = parseInt(m[3]);
                    file = resolvePath(m[4]);
                    pos = _this.fileCache.lineColToPosition(file, line, col);
                    var isOccurences;
                    switch (m[1]) {
                        case "references":
                            isOccurences = false;
                            break;
                        case "occurrences":
                            isOccurences = true;
                            break;
                        default:
                            throw "cannot happen";
                    }
                    _this.output(_this.getReferencesOrOccurrencesInfo(isOccurences, file, line, col));
                }
                else if (m = match(cmd, /^navigationBarItems (.*)$/)) {
                    file = resolvePath(m[1]);
                    _this.output(_this.getNavigationBarItemsInfo(file));
                }
                else if (m = match(cmd, /^navigateToItems (.*)$/)) {
                    pattern = m[1];
                    return _this.getNavigateToItemsInfo(pattern);
                }
                else if (m = match(cmd, /^completions(-brief)?( true| false)? (\d+) (\d+) (.*)$/)) {
                    brief = m[1];
                    line = parseInt(m[3]);
                    col = parseInt(m[4]);
                    file = resolvePath(m[5]);
                    _this.output(_this.getCompletionsInfo(brief, file, line, col), ["displayParts", "documentation", "sortText"]);
                }
                else if (m = match(cmd, /^update( nocheck)? (\d+)( (\d+)-(\d+))? (.*)$/)) {
                    file = resolvePath(m[6]);
                    added = !_this.fileCache.getScriptInfo(file);
                    range = !!m[3];
                    check = !m[1];
                    if (!added || !range) {
                        collecting = parseInt(m[2]);
                        on_collected_callback = function () {
                            if (!range) {
                                _this.updateScript(file, lines);
                            }
                            else {
                                var startLine = parseInt(m[4]);
                                var endLine = parseInt(m[5]);
                                _this.editScript(file, startLine, endLine, lines);
                            }
                            var syn, sem;
                            if (check) {
                                syn = _this.ls.getSyntacticDiagnostics(file).length;
                                sem = _this.ls.getSemanticDiagnostics(file).length;
                            }
                            on_collected_callback = undefined;
                            lines = [];
                            _this.outputJSON((added ? '"added ' : '"updated ')
                                + (range ? 'lines' + m[3] + ' in ' : '')
                                + file + (check ? ', (' + syn + '/' + sem + ') errors' : '') + '"');
                        };
                    }
                    else {
                        _this.outputJSON('"cannot update line range in new file"');
                    }
                }
                else if (m = match(cmd, /^showErrors$/)) {
                    _this.output(_this.getErrorsInfo());
                }
                else if (m = match(cmd, /^files$/)) {
                    _this.output(_this.getScriptFileNames());
                }
                else if (m = match(cmd, /^lastError(Dump)?$/)) {
                    if (_this.lastError)
                        if (m[1])
                            console.log(JSON.parse(_this.lastError).stack);
                        else
                            _this.outputJSON(_this.lastError);
                    else
                        _this.outputJSON('"no last error"');
                }
                else if (m = match(cmd, /^dump (\S+) (.*)$/)) {
                    (function () {
                        var dump = m[1];
                        var file = resolvePath(m[2]);
                        var sourceText = _this.fileCache.getScriptInfo(file).content;
                        if (dump === "-") {
                            console.log('dumping ' + file);
                            console.log(sourceText);
                        }
                        else {
                            ts.sys.writeFile(dump, sourceText, false);
                            _this.outputJSON('"dumped ' + file + ' to ' + dump + '"');
                        }
                    })();
                }
                else if (m = match(cmd, /^reload$/)) {
                    // TODO: keep updated (in-memory-only) files?
                    _this.setup(_this.rootFiles, _this.compilerOptions);
                    _this.outputJSON(_this.listeningMessage('reloaded'));
                }
                else if (m = match(cmd, /^quit$/)) {
                    rl.close();
                }
                else if (m = match(cmd, /^prettyJSON (true|false)$/)) {
                    _this.prettyJSON = m[1] === 'true';
                    _this.outputJSON('"pretty JSON: ' + _this.prettyJSON + '"');
                }
                else if (m = match(cmd, /^help$/)) {
                    console.log(Object.keys(commands).join(EOL));
                }
                else {
                    _this.outputJSON('"TSS command syntax error: ' + cmd + '"');
                }
            }
            catch (e) {
                _this.lastError = (JSON.stringify({ msg: e.toString(), stack: e.stack })).trim();
                _this.outputJSON('"TSS command processing error: ' + e + '"');
            }
        }).on('close', function () {
            _this.outputJSON('"TSS closing"');
        });
        this.outputJSON(this.listeningMessage('loaded'));
    };
    TSSCmdListener.prototype.listeningMessage = function (prefix) {
        var count = this.rootFiles.length - 1;
        var more = count > 0 ? ' (+' + count + ' more)' : '';
        return '"' + prefix + ' ' + this.rootFiles[0] + more + ', TSS listening.."';
    };
    return TSSCmdListener;
})(TypescriptService);
module.exports = TSSCmdListener;
