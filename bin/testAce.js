/// <reference path="./typings/tsd.d.ts" />
function setupAceEditor() {
    var langTools = ace.require("ace/ext/language_tools");
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/twilight");
    editor.getSession().setMode("ace/mode/typescript");
    editor.setOptions({ enableBasicAutocompletion: true });
    // uses http://rhymebrain.com/api.html
    var typescriptCompleter = {
        getCompletions: function (editor, session, pos, prefix, callback) {
            console.log(session.getValue());
            if (prefix.length === 0) {
                callback(null, []);
                return;
            }
            callback(null, [
                // {
                //     caption:"caption",
                //     snippet: "snippet",
                //     meta: "snippet",
                //     type: "snippet"
                // },
                {
                    caption: "name",
                    value: "value",
                    meta: "test",
                    score: 100
                }
            ]);
            //                    callback(null, wordList.map(function(ea) {
            //return {caption:ea.word, name: ea.word, snippet: value, value: ea.word, score: ea.score, meta: "rhyme"}
            //}));
        },
        getDocTooltip: function (item) {
            item.docHTML = "<b>" + item.caption + "</b>";
        }
    };
    langTools.addCompleter(typescriptCompleter);
}
exports.setupAceEditor = setupAceEditor;
