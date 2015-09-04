// Copyright (c) Claus Reinke. All rights reserved.
// Licensed under the Apache License, Version 2.0.
// See LICENSE.txt in the project root for complete license information.
///<reference path='typings/node/node.d.ts'/>
///<reference path='node_modules/typescript/bin/typescript.d.ts'/>
var ts = require("typescript");
function createDefaultFormatCodeOptions() {
    "use strict";
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
}
// from https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#pretty-printer-using-the-ls-formatter
// Note: this uses ts.formatting which is part of the typescript 1.4 package but is not currently
//       exposed in the public typescript.d.ts. The typings should be exposed in the next release.
function format(fileName, text, options) {
    "use strict";
    if (options === void 0) { options = createDefaultFormatCodeOptions(); }
    // Parse the source text
    var sourceFile = ts.createSourceFile(fileName, text, 2 /* Latest */, "0");
    fixupParentReferences(sourceFile);
    // Get the formatting edits on the input sources
    var edits = ts.formatting.formatDocument(sourceFile, getRuleProvider(options), options);
    // Apply the edits on the input code
    return applyEdits(text, edits);
    function getRuleProvider(options) {
        // Share this between multiple formatters using the same options.
        // This represents the bulk of the space the formatter uses.
        var ruleProvider = new ts.formatting.RulesProvider();
        ruleProvider.ensureUpToDate(options);
        return ruleProvider;
    }
    function applyEdits(text, edits) {
        // Apply edits in reverse on the existing text
        var result = text;
        for (var i = edits.length - 1; i >= 0; i--) {
            var change = edits[i];
            var head;
            if (typeof change.span.start === "number") {
                head = result.slice(0, change.span.start);
            }
            else {
                // backward compat for typescript-1.4.1
                head = result.slice(0, change.span.start());
            }
            var tail;
            if (typeof change.span.start === "number") {
                tail = result.slice(change.span.start + change.span.length);
            }
            else {
                // backward compat for typescript-1.4.1
                tail = result.slice(change.span.start() + change.span.length());
            }
            result = head + change.newText + tail;
        }
        return result;
    }
}
function fixupParentReferences(sourceFile) {
    "use strict";
    var parent = sourceFile;
    function walk(n) {
        n.parent = parent;
        var saveParent = parent;
        parent = n;
        ts.forEachChild(n, walk);
        parent = saveParent;
    }
    ts.forEachChild(sourceFile, walk);
}
module.exports = format;
