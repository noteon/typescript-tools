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
            var getCollectionName = function () {
                var currentLine = session.getLine(pos.row);
                var colMatches = currentLine.match(/[^\w]?db\.getCollection\((.*)\)/);
                if (colMatches && colMatches[1])
                    return colMatches[1].substring(1, colMatches[1].length - 1);
                var dotMatches = currentLine.match(/[^\w]?db\.(.*)\.$/);
                if (dotMatches && dotMatches[1])
                    return dotMatches[1];
            };
            var getFields = function () {
                if (prevChar === ".") {
                    var colName = getCollectionName();
                    if (colName)
                        fieldsFetcher(getCollectionName());
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
                return {
                    caption: it.fieldName,
                    value: it.fieldName,
                    meta: it.collection,
                    score: score
                };
            });
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
            item.docHTML = aceUtils.highlightTypeAndComment({ type: item.example, docComment: item.comment }, false) +
                ("<p><a href='#' onmousedown=\"require('shell').openExternal('" + item.docUrl + "')\">view online help</a></p>");
    }
};
