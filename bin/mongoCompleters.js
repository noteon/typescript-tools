/// <reference path="./typings/app.d.ts" />
var aceUtils = require("./aceUtils");
_ = require("lodash");
exports.getFieldCompleter = function (tsServ, scriptFileName, fieldsFetcher) {
    var fieldsCompleter = {
        getCompletions: function (editor, session, pos, prefix, callback) {
            if (session.__paramHelpItems || session.__includeShellCmdSpaceChar) {
                return callback(null, []);
            }
            var prevChar = aceUtils.getPrevChar(session, pos);
            var getFields = function () {
                if (prevChar === ".") {
                    var currentLine = session.getLine(pos.row);
                    var colName = aceUtils.getCollectionName(currentLine);
                    if (colName)
                        fieldsFetcher(aceUtils.getCollectionName(currentLine));
                    else {
                        var posChar = tsServ.fileCache.lineColToPosition(scriptFileName, pos.row + 1, pos.column + 1);
                        var quickInfo = tsServ.getQuickInfoByPos(scriptFileName, posChar - 2);
                        //console.log("quickInfo",quickInfo);
                        if (quickInfo && quickInfo.type && /^.*\: any$/.test(quickInfo.type)) {
                            return fieldsFetcher('');
                        }
                    }
                    return [];
                }
                else {
                    return fieldsFetcher('');
                }
            };
            var score = -100000;
            var fields = getFields().map(function (it) {
                var fieldValue = prefix[0] === "$" ? "$" + it.fieldName : it.fieldName;
                return {
                    caption: fieldValue,
                    value: fieldValue,
                    meta: it.collection,
                    score: score
                };
            });
            // console.log(
            //     "fields", fields
            // );
            callback(null, fields);
        }
    };
    return fieldsCompleter;
};
exports.operatorsCompleter = {
    getCompletions: function (editor, session, pos, prefix, callback) {
        if (prefix[0] === '$') {
            var mongoOperators = require('./mongoOperators');
            mongoOperators.map(function (it) {
                it.isMongoOperator = true;
                return it;
            });
            return callback(null, mongoOperators);
        }
    },
    getDocTooltip: function (item) {
        if (item.isMongoOperator)
            item.docHTML = aceUtils.highlightTypeCommentAndHelp(item.example, item.comment, item.docUrl);
    }
};
exports.getShellCmdCompleter = function (tsServ, scriptFileName) {
    var shellCmdCompleter = {
        getCompletions: function (editor, session, pos, prefix, callback) {
            session.__includeShellCmdSpaceChar = undefined;
            if (session.__paramHelpItems) {
                return callback(null, []);
            }
            var currentLine = session.getLine(pos.row).trim();
            // if (currentLine && (!/^\b.*\b$/.test(currentLine)))
            //     return callback(null, []);
            session.__includeShellCmdSpaceChar = _.any(["show ", "use ", "help "], function (it) {
                return _.startsWith(currentLine, it);
            });
            if (session.__includeShellCmdSpaceChar)
                return callback(null, []);
            var mongoShellCommands = require('./mongoShellCommands');
            mongoShellCommands.map(function (it) {
                it.isMongoShellCommand = true;
                return it;
            });
            return callback(null, mongoShellCommands);
        },
        getDocTooltip: function (item) {
            if (item.isMongoShellCommand)
                item.docHTML = aceUtils.highlightTypeCommentAndHelp(item.example, item.comment, item.docUrl);
        }
    };
    return shellCmdCompleter;
};
var docUrlAssigned = false;
exports.getCollectionMethodsCompleter = function (tsServ, scriptFileName, helpUrlFetcher) {
    var collectionMethodsCompleter = {
        getCompletions: function (editor, session, pos, prefix, callback) {
            if (session.__paramHelpItems || session.__includeShellCmdSpaceChar) {
                return callback(null, []);
            }
            var currentLine = session.getLine(pos.row);
            var hasDot = currentLine.indexOf('.') > -1;
            var posChar;
            var methodType = "";
            if (hasDot) {
                posChar = tsServ.fileCache.lineColToPosition(scriptFileName, pos.row + 1, pos.column + 1 - (prefix ? prefix.length : 0) - 1);
                methodType = session.__firstCompletionEntry && session.__firstCompletionEntry.type;
            }
            var getCompletionsByMongoClass = function (typeEnds, requireJsPath, helpDotPrefix) {
                if (helpDotPrefix === void 0) { helpDotPrefix = ""; }
                var templates = require(requireJsPath);
                if (!docUrlAssigned) {
                    templates = templates.map(function (it) {
                        if (it.docUrl)
                            return it;
                        if (helpUrlFetcher)
                            it.docUrl = helpUrlFetcher(it.methodDotName);
                        return it;
                    });
                    docUrlAssigned = true;
                }
                if (hasDot) {
                    var isSnippetsType = function (type) {
                        return _.some(typeEnds, function (endStr) {
                            return type.indexOf(endStr) > -1;
                        });
                    };
                    if (methodType && isSnippetsType(methodType)) {
                        return templates;
                    }
                    else
                        return [];
                }
                else {
                    if (!helpDotPrefix)
                        return [];
                    var completions = templates.map(function (it) {
                        var cloneIt = _.clone(it);
                        cloneIt.snippet = helpDotPrefix + cloneIt.snippet;
                        return cloneIt;
                    });
                    return completions;
                }
            };
            var concatTmpls = [];
            [
                getCompletionsByMongoClass([" mongo.ICollection.", " ICollection."], "./mongoCollectionSnippets", 'db.getCollection("$1").'),
                getCompletionsByMongoClass([" mongo.ICursor.", " ICursor."], "./mongoCursorSnippets"),
                getCompletionsByMongoClass([" mongo.IDatabase.", " IDatabase."], "./mongoDatabaseSnippets", 'db.'),
                getCompletionsByMongoClass([" mongo.IBulkFindOp.", " IBulkFindOp."], "./mongoBulkFindOpSnippets"),
                getCompletionsByMongoClass([" mongo.IReplication.", " IReplication."], "./mongoRsSnippets"),
            ].forEach(function (it) {
                if (it)
                    concatTmpls = concatTmpls.concat(it);
            });
            //console.log("concat", concatTmpls);
            callback(null, concatTmpls);
        },
        getDocTooltip: function (item) {
            if (item.isMongoTemplateCommand)
                item.docHTML = aceUtils.highlightTypeCommentAndHelp(item.example, item.comment, item.docUrl);
        }
    };
    return collectionMethodsCompleter;
};
exports.dateRangeCompleter = {
    getCompletions: function (editor, session, pos, prefix, callback) {
        if (session.__paramHelpItems || session.__includeShellCmdSpaceChar) {
            return callback(null, []);
        }
        var templates = require("./mongoDateRangeSnippets");
        // let currentLine = session.getLine(pos.row);
        // let hasDot = currentLine.indexOf('.') > -1;
        // if (!hasDot)
        //     return callback(null, templates);
        // let prevChar = aceUtils.getPrevChar(session, pos);
        // if (prevChar === ":" || prevChar === " ")
        //     return callback(null, templates);
        return callback(null, templates);
    },
    getDocTooltip: function (item) {
        if (item.isMongoOperator)
            item.docHTML = aceUtils.highlightTypeCommentAndHelp(item.example, item.comment, item.docUrl);
    }
};
