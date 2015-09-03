/// <reference path="./typings/tsd.d.ts" />
var aceUtils = require("./aceUtils");
_ = require("lodash");
exports.getFieldCompleter = function (tsServ, scriptFileName, fieldsFetcher) {
    var fieldsCompleter = {
        getCompletions: function (editor, session, pos, prefix, callback) {
            if (aceUtils.getParameterHelpItems(tsServ, scriptFileName, session, pos)) {
                return callback(null, []);
            }
            var score = -100000;
            var collectionName = ""; //unimplement, need to find it
            var fields = fieldsFetcher(scriptFileName).map(function (it) { return _.assign({ score: score }, it); });
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
