/// <reference path="./typings/tsd.d.ts" />

import aceUtils = require("./aceUtils");
import ts = require("./typescriptService");
_ = require("lodash");

export var getFieldCompleter = (tsServ: ts.TypescriptService, scriptFileName: string, fieldsFetcher: (scriptFileName: string) => { fieldName: string; collection: string }[]) => {

    var fieldsCompleter = {
        getCompletions: function(editor: AceAjax.Editor, session: AceAjax.IEditSession, pos: { row: number, column: number }, prefix, callback) {
            if (aceUtils.getParameterHelpItems(tsServ, scriptFileName, session, pos)) {
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
                return {
                    caption: it.fieldName,
                    value: it.fieldName,
                    meta: it.collection,
                    score
                }
            });

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
            if (aceUtils.getParameterHelpItems(tsServ, scriptFileName, session, pos)) {
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

let docUrlAssigned:boolean=false;

export var getCollectionMethodsCompleter = (tsServ: ts.TypescriptService, scriptFileName: string,  helpUrlFetcher?: (methodDotName: string) => string) => {

    var collectionMethodsCompleter = {
        getCompletions: function(editor, session, pos: { row: number, column: number }, prefix, callback) {
            if (aceUtils.getParameterHelpItems(tsServ, scriptFileName, session, pos)) {
                return callback(null, [])
            }

            let currentLine = session.getLine(pos.row);
            let hasDot = currentLine.indexOf('.') > -1;
            
            
            let templates = require('./mongoCodeTemplates');
            
            if (!docUrlAssigned){
                templates=templates.map((it)=>{
                    if (helpUrlFetcher)
                        it.docUrl=helpUrlFetcher(it.methodDotName);
                        
                    return it;
                });
                docUrlAssigned=true;
            }

            if (hasDot) {
                let posChar = tsServ.fileCache.lineColToPosition(scriptFileName, pos.row + 1, pos.column + 1 - (prefix ? prefix.length : 0) - 1);
                let quickInfo = tsServ.getQuickInfoByPos(scriptFileName, posChar);

                let isCollectionType = (type) => {
                    if (_.endsWith(quickInfo.type, ": mongo.ICollection")) return true;

                    if (_.endsWith(quickInfo.type, ": ICollection")) return true;

                    return false;

                }

                if (quickInfo && isCollectionType(quickInfo.type)) {
                    return callback(null, templates)
                } else
                    return callback(null, []);
            } else {
                let completions = templates.map((it) => {
                    let cloneIt = _.clone(it);
                    cloneIt.snippet = 'db.getCollection("$1").' + cloneIt.snippet;

                    return cloneIt;
                });

                return callback(null, completions)
            }

        },

        getDocTooltip: function(item) {
            if (item.isMongoTemplateCommand)
                item.docHTML = aceUtils.highlightTypeCommentAndHelp(item.example, item.comment, item.docUrl);
        }
    }

    return collectionMethodsCompleter
}

