// Copyright (c) Claus Reinke. All rights reserved.
// Licensed under the Apache License, Version 2.0.
// See LICENSE.txt in the project root for complete license information.
///<reference path='typings/node/node.d.ts'/>
///<reference path='node_modules/typescript/bin/typescript.d.ts'/>
var ts = require("typescript");
var harness = require("./harness");
/** holds list of fileNames, ScriptInfos and ScriptSnapshots for LS host */
var FileCache = (function () {
    function FileCache() {
        this.fileNames = [];
        this.snapshots = {};
        this.fileNameToScript = {};
    }
    FileCache.prototype.getFileNames = function () { return this.fileNames; };
    /**
     * @param fileName resolved name of possibly cached file
     */
    FileCache.prototype.getScriptInfo = function (fileName) {
        if (!this.fileNameToScript[fileName]) {
            throw new Error("Not Found ScriptInfo");
        }
        return this.fileNameToScript[fileName];
    };
    /**
     * @param fileName resolved name of possibly cached file
     */
    FileCache.prototype.getScriptSnapshot = function (fileName) {
        // console.log("getScriptSnapshot",fileName);
        if (!this.snapshots[fileName]) {
            throw new Error("Not Found ScriptSnapshot " + fileName);
        }
        return this.snapshots[fileName];
    };
    /**
     * @param fileName resolved file name
     * @param text file contents
     * @param isDefaultLib should fileName be listed first?
     */
    FileCache.prototype.addFile = function (fileName, text, isDefaultLib) {
        if (isDefaultLib === void 0) { isDefaultLib = false; }
        if (isDefaultLib) {
            this.fileNames.push(fileName);
        }
        else {
            this.fileNames.unshift(fileName);
        }
        this.fileNameToScript[fileName] = new harness.ScriptInfo(fileName, text);
        this.snapshots[fileName] = new harness.ScriptSnapshot(this.getScriptInfo(fileName));
    };
    /**
     * @param fileName resolved file name
     */
    FileCache.prototype.fetchFile = function (fileName) {
        // console.log("fetchFile:",fileName);
        if (ts.sys.fileExists(fileName)) {
            this.addFile(fileName, ts.sys.readFile(fileName));
        }
        else {
        }
    };
    /**
     * @param fileName resolved name of cached file
     * @param line 1 based index
     * @param col 1 based index
     */
    FileCache.prototype.lineColToPosition = function (fileName, line, col) {
        var script = this.getScriptInfo(fileName);
        return ts.getPositionOfLineAndCharacter(this.ls.getSourceFile(fileName), line - 1, col - 1);
    };
    /**
     * @param fileName resolved name of cached file
     * @returns {line,character} 1 based indices
     */
    FileCache.prototype.positionToLineCol = function (fileName, position) {
        var script = this.getScriptInfo(fileName);
        var lineChar = ts.getLineAndCharacterOfPosition(this.ls.getSourceFile(fileName), position);
        return { line: lineChar.line + 1, character: lineChar.character + 1 };
    };
    /**
     * @param fileName resolved name of cached file
     * @param line 1 based index
     */
    FileCache.prototype.getLineText = function (fileName, line) {
        var source = this.ls.getSourceFile(fileName);
        var lineStart = ts.getPositionOfLineAndCharacter(source, line - 1, 0);
        var lineEnd = ts.getPositionOfLineAndCharacter(source, line, 0) - 1;
        var lineText = source.text.substring(lineStart, lineEnd);
        return lineText;
    };
    /**
     * @param fileName resolved name of possibly cached file
     * @param content new file contents
     */
    FileCache.prototype.updateScript = function (fileName, content) {
        var script = this.getScriptInfo(fileName);
        if (script) {
            script.updateContent(content);
            this.snapshots[fileName] = new harness.ScriptSnapshot(script);
        }
        else {
            this.addFile(fileName, content);
        }
    };
    /**
     * @param fileName resolved name of cached file
     * @param minChar first char of edit range
     * @param limChar first char after edit range
     * @param newText new file contents
     */
    FileCache.prototype.editScript = function (fileName, minChar, limChar, newText) {
        var script = this.getScriptInfo(fileName);
        if (script) {
            script.editContent(minChar, limChar, newText);
            this.snapshots[fileName] = new harness.ScriptSnapshot(script);
            return;
        }
        throw new Error("No script with name '" + fileName + "'");
    };
    return FileCache;
})();
module.exports = FileCache;
