/// <reference path="./typings/tsd.d.ts" />

import aceUtils = require("./aceUtils");
import ts = require("./typescriptService");
_ = require("lodash");

export var getFieldCompleter = (tsServ: ts.TypescriptService, scriptFileName: string, fieldsFetcher: (scriptFileName: string) => { fieldName: string; collection: string }[]) => {

    var fieldsCompleter = {
        getCompletions: function(editor: AceAjax.Editor, session: AceAjax.IEditSession, pos: { row: number, column: number }, prefix, callback) {
            if (session["__paramHelpItems"]) {
                return callback(null, [])
            }

            let prevChar = aceUtils.getPrevChar(session, pos);

            var getFields = () => {
                if (prevChar === ".") {
                    let currentLine = session.getLine(pos.row);
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

                    return []
                } else {
                    return fieldsFetcher('');
                }
            }

            let score = -100000;

            let fields = getFields().map((it) => {
                let fieldValue = prefix[0] === "$" ? "$" + it.fieldName : it.fieldName;
                return {
                    caption: fieldValue,
                    value: fieldValue,
                    meta: it.collection,
                    score
                }
            });
            
            // console.log(
            //     "fields", fields
            // );

            callback(null, fields);
        }
    }

    return fieldsCompleter
}


export var operatorsCompleter = {
    getCompletions: function(editor, session, pos: { row: number, column: number }, prefix, callback) {
        if (prefix[0] === '$') {//load mongo completeors
            let mongoOperators = require('./mongoOperators');

            mongoOperators.map((it) => {
                it.isMongoOperator = true;
                return it
            });

            return callback(null, mongoOperators)
        }
    },

    getDocTooltip: function(item) {
        if (item.isMongoOperator)
            item.docHTML = aceUtils.highlightTypeCommentAndHelp(item.example, item.comment, item.docUrl);
    }
}


export var getShellCmdCompleter = (tsServ: ts.TypescriptService, scriptFileName: string) => {

    var shellCmdCompleter = {
        getCompletions: function(editor, session, pos: { row: number, column: number }, prefix, callback) {
            if (session["__paramHelpItems"]) {
                return callback(null, [])
            }

            let currentLine = session.getLine(pos.row).trim();

            if (currentLine && (!/^\b.*\b$/.test(currentLine)))
                return callback(null, []);


            let mongoShellCommands = require('./mongoShellCommands');

            mongoShellCommands.map((it) => {
                it.isMongoShellCommand = true;
                return it
            });

            return callback(null, mongoShellCommands)
        },

        getDocTooltip: function(item) {
            if (item.isMongoShellCommand)
                item.docHTML = aceUtils.highlightTypeCommentAndHelp(item.example, item.comment, item.docUrl);
        }
    }

    return shellCmdCompleter
}

let docUrlAssigned: boolean = false;

export var getCollectionMethodsCompleter = (tsServ: ts.TypescriptService, scriptFileName: string, helpUrlFetcher?: (methodDotName: string) => string) => {


    var collectionMethodsCompleter = {
        getCompletions: function(editor, session, pos: { row: number, column: number }, prefix, callback) {
            if (session["__paramHelpItems"]) {
                return callback(null, [])
            }

            let currentLine = session.getLine(pos.row);
            let hasDot = currentLine.indexOf('.') > -1;

            let posChar;
            let methodType = "";
            if (hasDot) {
                posChar = tsServ.fileCache.lineColToPosition(scriptFileName, pos.row + 1, pos.column + 1 - (prefix ? prefix.length : 0) - 1);

                methodType = session.__firstCompletionEntry && session.__firstCompletionEntry.type;

                //console.log("firstEntry methodType", session.__firstCompletionEntry);
            }

            var getCompletionsByMongoClass = (typeEnds: string[], requireJsPath, helpDotPrefix = ""): any[]=> {
                let templates = require(requireJsPath);

                if (!docUrlAssigned) {
                    templates = templates.map((it) => {
                        if (it.docUrl) return it;

                        if (helpUrlFetcher)
                            it.docUrl = helpUrlFetcher(it.methodDotName);

                        return it;
                    });
                    docUrlAssigned = true;
                }

                if (hasDot) {
                    let isSnippetsType = (type) => {
                        return _.some(typeEnds, (endStr) => {
                            return type.indexOf(endStr) > -1;
                        })
                    }

                    if (methodType && isSnippetsType(methodType)) {
                        return templates
                    } else
                        return [];
                } else {
                    if (!helpDotPrefix) return [];

                    let completions = templates.map((it) => {
                        let cloneIt = _.clone(it);
                        cloneIt.snippet = helpDotPrefix + cloneIt.snippet;

                        return cloneIt;
                    });

                    return completions
                }

            }

            let concatTmpls = [];
            [  // ICursor.
                getCompletionsByMongoClass([" mongo.ICollection.", " ICollection."], "./mongoCollectionSnippets", 'db.getCollection("$1").'),
                getCompletionsByMongoClass([" mongo.ICursor.", " ICursor."], "./mongoCursorSnippets"),
                getCompletionsByMongoClass([" mongo.IDatabase.", " IDatabase."], "./mongoDatabaseSnippets", 'db.'),
                getCompletionsByMongoClass([" mongo.IBulkFindOp.", " IBulkFindOp."], "./mongoBulkFindOpSnippets"),
                getCompletionsByMongoClass([" mongo.IReplication.", " IReplication."], "./mongoRsSnippets"),
            ].forEach((it) => {
                if (it)
                    concatTmpls = concatTmpls.concat(it);
            })     
            //console.log("concat", concatTmpls);
                
            callback(null, concatTmpls)
        },

        getDocTooltip: function(item) {
            if (item.isMongoTemplateCommand)
                item.docHTML = aceUtils.highlightTypeCommentAndHelp(item.example, item.comment, item.docUrl);
        }
    }

    return collectionMethodsCompleter
}


export var dateRangeCompleter = {
    getCompletions: function(editor: AceAjax.Editor, session: AceAjax.IEditSession, pos: { row: number, column: number }, prefix, callback) {
        if (session["__paramHelpItems"]) {
            return callback(null, [])
        }
        let templates = require("./mongoDateRangeSnippets");

        // let currentLine = session.getLine(pos.row);
        // let hasDot = currentLine.indexOf('.') > -1;
        // if (!hasDot)
        //     return callback(null, templates);

        // let prevChar = aceUtils.getPrevChar(session, pos);
        // if (prevChar === ":" || prevChar === " ")
        //     return callback(null, templates);


        return callback(null, templates);
    },

    getDocTooltip: function(item) {
        if (item.isMongoOperator)
            item.docHTML = aceUtils.highlightTypeCommentAndHelp(item.example, item.comment, item.docUrl);
    }
}
