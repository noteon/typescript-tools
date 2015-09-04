// Copyright (c) Claus Reinke. All rights reserved.
// Licensed under the Apache License, Version 2.0.
// See LICENSE.txt in the project root for complete license information.
///<reference path='typings/node/node.d.ts'/>
///<reference path='node_modules/typescript/bin/typescript.d.ts'/>
var ts = require("typescript");
var FileCache = require("./fileCache");
var path = require("path");
function resolvePath(rpath) {
    return switchToForwardSlashes(path.resolve(rpath));
}
function switchToForwardSlashes(path) {
    return path.replace(/\\/g, "/");
}
var EOL = require("os").EOL;
/** TypeScript Services Server,
    an interactive commandline tool
    for getting info on .ts projects */
var TypescriptService = (function () {
    function TypescriptService(prettyJSON) {
        if (prettyJSON === void 0) { prettyJSON = false; }
        this.prettyJSON = prettyJSON;
    } // NOTE: call setup
    /** collect syntactic and semantic diagnostics for all project files */
    TypescriptService.prototype.getErrors = function () {
        var _this = this;
        var addPhase = function (phase) { return function (d) { d.phase = phase; return d; }; };
        var errors = [];
        this.fileCache.getFileNames().map(function (file) {
            var syntactic = _this.ls.getSyntacticDiagnostics(file);
            var semantic = _this.ls.getSemanticDiagnostics(file);
            // this.ls.languageService.getEmitOutput(file).diagnostics;
            errors = errors.concat(syntactic.map(addPhase("Syntax")), semantic.map(addPhase("Semantics")));
        });
        return errors;
    };
    /** flatten messageChain into string|string[] */
    TypescriptService.prototype.messageChain = function (message) {
        if (typeof message === "string") {
            return [message];
        }
        else {
            return [message.messageText].concat(message.next ? this.messageChain(message.next) : []);
        }
    };
    /** load file and dependencies, prepare language service for queries */
    TypescriptService.prototype.setup = function (files, options) {
        var _this = this;
        this.fileCache = new FileCache();
        this.rootFiles = files.map(function (file) { return resolvePath(file.name); });
        this.compilerOptions = options;
        this.compilerHost = ts.createCompilerHost(options);
        //TODO: diagnostics
        // prime fileCache with root files and defaultLib
        var seenNoDefaultLib = options.noLib;
        files.forEach(function (file) {
            var fullFileName = resolvePath(file.name);
            if (!file.content) {
                var source = _this.compilerHost.getSourceFile(fullFileName, options.target);
                if (source) {
                    seenNoDefaultLib = seenNoDefaultLib || source.hasNoDefaultLib;
                    _this.fileCache.addFile(fullFileName, source.text);
                }
                else {
                    throw ("tss cannot find file: " + file);
                }
            }
            else {
                //seenNoDefaultLib = seenNoDefaultLib || source.hasNoDefaultLib;
                _this.fileCache.addFile(fullFileName, file.content);
            }
        });
        if (!seenNoDefaultLib) {
            var defaultLibFileName = this.compilerHost.getDefaultLibFileName(options);
            var source = this.compilerHost.getSourceFile(defaultLibFileName, options.target);
            this.fileCache.addFile(defaultLibFileName, source.text);
        }
        // Get a language service
        // internally builds programs from root files,
        // chases dependencies (references and imports), ...
        // (NOTE: files are processed on demand, loaded via lsHost, cached in fileCache)
        this.lsHost = {
            getCompilationSettings: function () { return _this.compilerOptions; },
            getScriptFileNames: function () { return _this.fileCache.getFileNames(); },
            getScriptVersion: function (fileName) { return _this.fileCache.getScriptInfo(fileName).version.toString(); },
            //comment by qinghai
            //getScriptIsOpen : (fileName: string)=>this.fileCache.getScriptInfo(fileName).isOpen,
            getScriptSnapshot: function (fileName) { return _this.fileCache.getScriptSnapshot(fileName); },
            getCurrentDirectory: function () { return ts.sys.getCurrentDirectory(); },
            getDefaultLibFileName: function (options) { return ts.getDefaultLibFileName(options); },
            log: function (message) { return undefined; },
            trace: function (message) { return undefined; },
            error: function (message) { return console.error(message); } // ??
        };
        this.ls = ts.createLanguageService(this.lsHost, ts.createDocumentRegistry());
        this.fileCache.ls = this.ls;
    };
    /** recursively prepare navigationBarItems for JSON output */
    TypescriptService.prototype.handleNavBarItem = function (file, item) {
        var _this = this;
        // TODO: under which circumstances can item.spans.length be other than 1?
        return { info: [item.kindModifiers, item.kind, item.text].filter(function (s) { return s !== ""; }).join(" "),
            kindModifiers: item.kindModifiers,
            kind: item.kind,
            text: item.text,
            min: this.fileCache.positionToLineCol(file, item.spans[0].start),
            lim: this.fileCache.positionToLineCol(file, item.spans[0].start + item.spans[0].length),
            childItems: item.childItems.map(function (item) { return _this.handleNavBarItem(file, item); })
        };
    };
    TypescriptService.prototype.getSignatureInfo = function (file, line, col) {
        var pos = this.fileCache.lineColToPosition(file, line, col);
        return this.getSignatureInfoByPos(file, pos);
    };
    TypescriptService.prototype.getSignatureInfoByPos = function (file, pos) {
        var info = this.ls.getSignatureHelpItems(file, pos);
        var param = function (p) { return ({ name: p.name,
            isOptional: p.isOptional,
            type: ts.displayPartsToString(p.displayParts) || "",
            docComment: ts.displayPartsToString(p.documentation) || ""
        }); };
        info && (info.items = info.items
            .map(function (item) { return ({ prefix: ts.displayPartsToString(item.prefixDisplayParts) || "",
            separator: ts.displayPartsToString(item.separatorDisplayParts) || "",
            suffix: ts.displayPartsToString(item.suffixDisplayParts) || "",
            parameters: item.parameters.map(param),
            docComment: ts.displayPartsToString(item.documentation) || ""
        }); }));
        return info;
    };
    TypescriptService.prototype.getQuickInfo = function (file, line, col) {
        var pos = this.fileCache.lineColToPosition(file, line, col);
        return this.getQuickInfoByPos(file, pos);
    };
    TypescriptService.prototype.getQuickInfoByPos = function (file, pos) {
        //console.log('getQuickInfo',pos,this.ls.getQuickInfoAtPosition(file, pos)); 
        var info = (this.ls.getQuickInfoAtPosition(file, pos) || {});
        info.type = ((info && ts.displayPartsToString(info.displayParts)) || "");
        info.docComment = ((info && ts.displayPartsToString(info.documentation)) || "");
        return info;
    };
    TypescriptService.prototype.getDefinitionInfo = function (file, line, col) {
        var pos = this.fileCache.lineColToPosition(file, line, col);
        return this.getDefinitionInfoByPos(file, pos);
    };
    TypescriptService.prototype.getDefinitionInfoByPos = function (file, pos) {
        var _this = this;
        var locs = this.ls.getDefinitionAtPosition(file, pos); // NOTE: multiple definitions
        var info = locs && locs.map(function (def) {
            var snapshot = def && _this.fileCache.getScriptSnapshot(def.fileName);
            return {
                def: def,
                file: def && def.fileName,
                min: def && _this.fileCache.positionToLineCol(def.fileName, def.textSpan.start),
                lim: def && _this.fileCache.positionToLineCol(def.fileName, ts.textSpanEnd(def.textSpan)),
                content: snapshot && snapshot.getText(def.textSpan.start, def.textSpan.length + def.textSpan.start)
            };
        });
        // TODO: what about multiple definitions?
        return ((locs && info[0]) || null);
    };
    //occurences:false, to getReferences  
    TypescriptService.prototype.getReferencesOrOccurrencesInfo = function (occurences, file, line, col) {
        var _this = this;
        var pos = this.fileCache.lineColToPosition(file, line, col);
        var refs = occurences ? this.ls.getOccurrencesAtPosition(file, pos) : this.ls.getReferencesAtPosition(file, pos);
        var info = (refs || []).map(function (ref) {
            var start, end, fileName, lineText;
            if (ref) {
                start = _this.fileCache.positionToLineCol(ref.fileName, ref.textSpan.start);
                end = _this.fileCache.positionToLineCol(ref.fileName, ts.textSpanEnd(ref.textSpan));
                fileName = resolvePath(ref.fileName);
                lineText = _this.fileCache.getLineText(fileName, start.line);
            }
            return {
                ref: ref,
                file: ref && ref.fileName,
                lineText: lineText,
                min: start,
                lim: end
            };
        });
        return info;
    };
    TypescriptService.prototype.getNavigationBarItemsInfo = function (file) {
        var _this = this;
        return this.ls.getNavigationBarItems(file)
            .map(function (item) { return _this.handleNavBarItem(file, item); });
    };
    TypescriptService.prototype.getCompletionEntryDetailsInfo = function (file, pos, name) {
        var d = this.ls.getCompletionEntryDetails(file, pos, name);
        if (d) {
            d["type"] = ts.displayPartsToString(d.displayParts);
            d["docComment"] = ts.displayPartsToString(d.documentation);
            return d;
        }
    };
    TypescriptService.prototype.getCompletionsInfoByPos = function (brief, file, pos) {
        var _this = this;
        var startTime = Date.now();
        //console.log("getCompletionsInfoByPos", pos);
        var info = this.ls.getCompletionsAtPosition(file, pos) || null;
        if (info) {
            // fill in completion entry details, unless briefness requested
            !brief && (info.entries = info.entries.map(function (e) {
                var d = _this.getCompletionEntryDetailsInfo(file, pos, e.name);
                if (d) {
                    return d;
                }
                else {
                    return e;
                }
            }));
            // NOTE: details null for primitive type symbols, see TS #1592
            (function () {
                var languageVersion = _this.compilerOptions.target;
                var source = _this.fileCache.getScriptInfo(file).content;
                var startPos = pos;
                var idPart = function (p) { return /[0-9a-zA-Z_$]/.test(source[p])
                    || ts.isIdentifierPart(source.charCodeAt(p), languageVersion); };
                var idStart = function (p) { return /[a-zA-Z_$]/.test(source[p])
                    || ts.isIdentifierStart(source.charCodeAt(p), languageVersion); };
                while ((--startPos >= 0) && idPart(startPos))
                    ;
                if ((++startPos < pos) && idStart(startPos)) {
                    var prefix = source.slice(startPos, pos);
                    info["prefix"] = prefix;
                    var len = prefix.length;
                    info.entries = info.entries.filter(function (e) { return e.name.substr(0, len) === prefix; });
                }
            })();
        }
        return info;
    };
    TypescriptService.prototype.getCompletionsInfo = function (brief, file, line, col) {
        var pos = this.fileCache.lineColToPosition(file, line, col);
        return this.getCompletionsInfoByPos(brief, file, pos);
    };
    TypescriptService.prototype.getNavigateToItemsInfo = function (pattern) {
        var _this = this;
        return this.ls.getNavigateToItems(pattern)
            .map(function (item) {
            item['min'] = _this.fileCache.positionToLineCol(item.fileName, item.textSpan.start);
            item['lim'] = _this.fileCache.positionToLineCol(item.fileName, item.textSpan.start
                + item.textSpan.length);
            return item;
        });
    };
    TypescriptService.prototype.updateScript = function (file, content) {
        this.fileCache.updateScript(file, content);
    };
    TypescriptService.prototype.editScript = function (file, startLine, endLine, lines) {
        var script = this.fileCache.getScriptInfo(file);
        var maxLines = this.ls.getSourceFile(file).getLineStarts().length;
        var startPos = startLine <= maxLines
            ? (startLine < 1 ? 0 : this.fileCache.lineColToPosition(file, startLine, 1))
            : script.content.length;
        var endPos = endLine < maxLines
            ? (endLine < 1 ? 0 : this.fileCache.lineColToPosition(file, endLine + 1, 0) - 1) //??CHECK
            : script.content.length;
        this.fileCache.editScript(file, startPos, endPos, lines.join(EOL));
    };
    TypescriptService.prototype.editScriptByPos = function (file, startPos, endPos, newLines) {
        this.fileCache.editScript(file, startPos, endPos, newLines.join(EOL));
    };
    TypescriptService.prototype.getErrorsInfo = function () {
        var _this = this;
        return this.ls.getProgram().getGlobalDiagnostics()
            .concat(this.getErrors())
            .map(function (d) {
            if (d.file) {
                var file = resolvePath(d.file.fileName);
                var lc = _this.fileCache.positionToLineCol(file, d.start);
                var len = _this.fileCache.getScriptInfo(file).content.length;
                var end = Math.min(len, d.start + d.length);
                // NOTE: clamped to end of file (#11)
                var lc2 = _this.fileCache.positionToLineCol(file, end);
                return {
                    file: file,
                    start: { line: lc.line, character: lc.character },
                    end: { line: lc2.line, character: lc2.character },
                    text: _this.messageChain(d.messageText).join(EOL),
                    code: d.code,
                    phase: d["phase"],
                    category: ts.DiagnosticCategory[d.category]
                };
            }
            else {
                return {
                    text: _this.messageChain(d.messageText).join(EOL),
                    code: d.code,
                    phase: d["phase"],
                    category: ts.DiagnosticCategory[d.category]
                };
            }
        });
    };
    TypescriptService.prototype.getScriptFileNames = function () {
        return this.lsHost.getScriptFileNames(); // TODO: files are pre-resolved
    };
    TypescriptService.prototype.reload = function () {
        // TODO: keep updated (in-memory-only) files?
        var files = this.rootFiles.map(function (it) { return { name: it }; });
        return this.setup(files, this.compilerOptions);
    };
    TypescriptService.prototype.transpile = function (fileName) {
        var tsRst = this.ls.getEmitOutput(fileName);
        return tsRst && tsRst.outputFiles && tsRst.outputFiles[0] && tsRst.outputFiles[0].text;
    };
    TypescriptService.prototype.createDefaultFormatCodeOptions = function () {
        return {
            IndentSize: 4,
            TabSize: 4,
            NewLineCharacter: '\r\n',
            ConvertTabsToSpaces: true,
            InsertSpaceAfterCommaDelimiter: true,
            InsertSpaceAfterSemicolonInForStatements: true,
            InsertSpaceBeforeAndAfterBinaryOperators: true,
            InsertSpaceAfterKeywordsInControlFlowStatements: true,
            InsertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
            InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
            PlaceOpenBraceOnNewLineForFunctions: false,
            PlaceOpenBraceOnNewLineForControlBlocks: false
        };
    };
    TypescriptService.prototype.format = function (fileName, options) {
        return require('./tsFormatter')(fileName, this.fileCache.getScriptInfo(fileName).content);
    };
    return TypescriptService;
})();
exports.TypescriptService = TypescriptService;
