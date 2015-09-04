/// <reference path="./typings/tsd.d.ts" />

import aceUtils = require("./aceUtils");
import ts = require("./typescriptService");
_=require("lodash");

export var getFieldCompleter = (tsServ:ts.TypescriptService, scriptFileName:string, fieldsFetcher:(scriptFileName:string)=>{fieldName:string; collection:string}[]) => {

    var fieldsCompleter = {
        getCompletions: function(editor:AceAjax.Editor, session:AceAjax.IEditSession, pos: { row: number, column: number }, prefix, callback) {
            if (aceUtils.getParameterHelpItems(tsServ, scriptFileName, session, pos)) {
                return callback(null, [])
            }
            
            let prevChar = aceUtils.getPrevChar(session, pos);
            
            var getCollectionName=()=>{
                let currentLine= session.getLine(pos.row);
                let  colMatches=currentLine.match(/[^\w]?db\.getCollection\((.*)\)/);
                if (colMatches && colMatches[1])
                   return colMatches[1].substring(1,colMatches[1].length-1);
                   
                let  dotMatches=currentLine.match(/[^\w]?db\.(.*)\.$/)
                if (dotMatches && dotMatches[1])
                   return colMatches[1];
                       
            }
            
            var getFields=()=>{
                if (prevChar==="."){
                   return fieldsFetcher(getCollectionName());
                }else{
                   return fieldsFetcher('');
                }
            }
               
            let score = -100000;
            
            let fields=getFields().map((it)=>{
                return {
                    caption:it.fieldName,
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
            item.docHTML = aceUtils.highlightTypeAndComment({ type: item.example, docComment: item.comment }, false) +
               `<p><a href='#' onmousedown="require('shell').openExternal('${item.docUrl}')">view online help</a></p>`;
    }
}
