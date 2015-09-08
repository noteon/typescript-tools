/// <reference path="./typings/tsd.d.ts" />

import aceUtils = require('./aceUtils');
import ts = require('./typescriptService');

export var getTypescriptParameterCompleter=(tsServ: ts.TypescriptService, scriptFileName: string)=>{
    var typeScriptParameterCompleter = {
        getCompletions: function(editor, session, pos: { row: number, column: number }, prefix, callback) {
            var helpItems = aceUtils.getParameterHelpItems(tsServ, scriptFileName, session, pos);

            if (!helpItems) return callback(null, [])

            var completionsItems = helpItems.items.map((it, idx) => {
                var currentParam = undefined;
                var paramsText = (it.parameters.map((param, paramIdx) => {
                    if (paramIdx === helpItems.argumentIndex) {
                        currentParam = param;
                        return param.type
                    }
                    else
                        return param.type;
                }
                    ).join(it.separator));

                var value = it.prefix + paramsText + it.suffix;
                return {
                    caption: value,
                    value: " ",
                    meta: "",
                    toolTip: currentParam && aceUtils.highlightTypeAndComment(currentParam),
                    isHelpItem: true,
                    score: (idx === helpItems.selectedItemIndex) ? 1 : 0
                }
            });
                
            // setTimeout(() => {
            //     if (editor.completer && editor.completer.completions) {
            //         console.log("setFilterText",filterText);
            //         editor.completer.completions.setFilter(filterText)
            //         editor.completer.openPopup(editor, filterText, true);
            //     }
            // }, 0)

            return callback(null, completionsItems)
        },

        getDocTooltip: function(item) {
            if (item.isHelpItem)
                item.docHTML = item.toolTip;
        }

    }
    
    return typeScriptParameterCompleter;
}

export var getTypeScriptAutoCompleters = (tsServ: ts.TypescriptService, scriptFileName: string, methodHelpUrlGetter?:(methodDotName:string)=>string) => {
    
    // uses http://rhymebrain.com/api.html
    var typescriptAutoCompleter = {
        getCompletions: function(editor, session, pos: { row: number, column: number }, prefix, callback) {
            var posChar = tsServ.fileCache.lineColToPosition(scriptFileName, pos.row + 1, pos.column + 1);
            
            if (/^[0-9]$/.test(prefix[0]))
              return callback(null,[]);

            if (aceUtils.getParameterHelpItems(tsServ, scriptFileName, session, pos)) { //parameter hint
                return callback(null, [])
            }

            let completionsInfo = tsServ.getCompletionsInfoByPos(true, scriptFileName, posChar);
            if (!completionsInfo) {
                return callback(null, [])
            }
               
            //console.log("completionsInfo",completionsInfo.entries);
            let completions = completionsInfo.entries.map((it) => {
                return {
                    name: it.name,
                    value: it.name,
                    meta: it.kind,
                    pos: posChar,
                    srcProps: it,
                    isAutoComplete: true
                }
            });


            var matchFunc = function(elm) {
                return elm.name.indexOf(prefix) == 0 ? 1 : 0;
            };

            var matchCompare = function(a, b) {
                return matchFunc(b) - matchFunc(a);
            };

            var textCompare = function(a, b) {
                if (a.name == b.name) {
                    return 0;
                } else {
                    return (a.name > b.name) ? 1 : -1;
                }
            };
            var compare = function(a, b) {
                var ret = matchCompare(a, b);
                return (ret != 0) ? ret : textCompare(a, b);
            };

            completions = completions.sort(compare);

            callback(null, completions)
        },

        getDocTooltip: function(item) {
            if (item.isAutoComplete) {
                var detailInfo: any = tsServ.getCompletionEntryDetailsInfo(scriptFileName, item.pos, item.name) || { type: "" };
                if (detailInfo && detailInfo.type) {
                    let helpUrl="";
                    if (methodHelpUrlGetter){
                        let getMethodDotName=():string=>{
                            if (detailInfo.kind==="method" || detailInfo.kind==="property"){
                            let parts=detailInfo.type.split(" ");
                            if (parts.length>=2){
                                let subParts=parts[1].split("(")
                                return (subParts[0] || "").trim();
                            }
                            }
                            
                            return "";
                        }
                    
                        let methodDotName=getMethodDotName();
                        
                        if (methodDotName){
                            helpUrl=methodHelpUrlGetter(methodDotName);                         
                        }
                    }
                    
                    item.docHTML = aceUtils.highlightTypeCommentAndHelp(detailInfo.type, detailInfo.docComment, helpUrl);
                }
                else item.docHTML = '';
            }

        }
    }

    return typescriptAutoCompleter;
}
    