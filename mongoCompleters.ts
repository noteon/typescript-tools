/// <reference path="./typings/tsd.d.ts" />

import aceUtils = require("./aceUtils");
import ts = require("./typescriptService");
_=require("lodash");

export var getFieldCompleter = (tsServ:ts.TypescriptService, scriptFileName:string, fieldsFetcher:(scriptFileName:string)=>{caption:string; value:string; meta:string}[]) => {

    var fieldsCompleter = {
        getCompletions: function(editor, session, pos: { row: number, column: number }, prefix, callback) {
            if (aceUtils.getParameterHelpItems(tsServ, scriptFileName, session, pos)) {
                return callback(null, [])
            }
            

            let score = -100000;
            
            let collectionName="";//unimplement, need to find it
            
            let fields=fieldsFetcher(scriptFileName).map((it)=>_.assign({score},it));

            // fields.push({
            //     caption: '_id',
            //     value: '_id',
            //     meta: "order-field",
            //     score: score
            // });

            // fields.push({
            //     caption: 'amount',
            //     value: 'amount',
            //     meta: "order-field",
            //     score: score
            // });

            // fields.push({
            //     caption: 'user.fname',
            //     value: 'user.fname',
            //     meta: "order-field",
            //     score: score
            // });

            // fields.push({
            //     caption: 'user.lname',
            //     value: 'user.lname',
            //     meta: "order-field",
            //     score: score
            // });


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
