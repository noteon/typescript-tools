/// <reference path="./typings/tsd.d.ts" />
var aceUtils = require("./aceUtils");
_ = require("lodash");
exports.getFieldCompleter = function (tsServ, scriptFileName, fieldsFetcher) {
    var fieldsCompleter = {
        getCompletions: function (editor, session, pos, prefix, callback) {
            if (aceUtils.getParameterHelpItems(tsServ, scriptFileName, session, pos)) {
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
            if (aceUtils.getParameterHelpItems(tsServ, scriptFileName, session, pos)) {
                return callback(null, []);
            }
            var currentLine = session.getLine(pos.row).trim();
            if (currentLine && (!/^\b.*\b$/.test(currentLine)))
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
            if (aceUtils.getParameterHelpItems(tsServ, scriptFileName, session, pos)) {
                return callback(null, []);
            }
            var currentLine = session.getLine(pos.row);
            var hasDot = currentLine.indexOf('.') > -1;
            var posChar;
            var quickInfo;
            if (hasDot) {
                posChar = tsServ.fileCache.lineColToPosition(scriptFileName, pos.row + 1, pos.column + 1 - (prefix ? prefix.length : 0) - 1);
                quickInfo = tsServ.getQuickInfoByPos(scriptFileName, posChar);
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
                    var isCollectionType = function (type) {
                        return _.some(typeEnds, function (endStr) {
                            return _.endsWith(quickInfo.type, endStr);
                        });
                    };
                    if (quickInfo && isCollectionType(quickInfo.type)) {
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
                getCompletionsByMongoClass([": mongo.ICollection", ": ICollection"], "./mongoCollectionSnippets", 'db.getCollection("$1").'),
                getCompletionsByMongoClass([": mongo.ICursor", ": ICursor"], "./mongoCursorSnippets"),
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
