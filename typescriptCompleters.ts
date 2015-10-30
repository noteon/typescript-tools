/// <reference path="./typings/tsd.d.ts" />

import aceUtils = require('./aceUtils');
import ts = require('./typescriptService');

export var getTypeScriptAutoCompleters = (tsServ: ts.TypescriptService, scriptFileName: string, methodHelpUrlGetter?:(methodDotName:string)=>string) => {
    
    var getCompletionEntries=(posChar, prefix)=>{
            let completionsInfo = tsServ.getCompletionsInfoByPos(true, scriptFileName, posChar);
            if (!completionsInfo) {
                return [];
            }
               
            //console.log("completionsInfo",completionsInfo.entries);
            let isMethodOrFunction=(kind)=>{
                return (kind==="method") || (kind==="function")
            }
            
            let completions = completionsInfo.entries.map((it) => {
                return {
                    caption: it.name,
                    snippet: it.name+(isMethodOrFunction(it.kind)?"($2)":""),
                    meta: it.kind,
                    pos: posChar,
                    srcProps: it,
                    isAutoComplete: true
                }
            });
            
            


            var matchFunc = function(elm) {
                return elm.caption.indexOf(prefix) == 0 ? 1 : 0;
            };

            var matchCompare = function(a, b) {
                return matchFunc(b) - matchFunc(a);
            };

            var textCompare = function(a, b) {
                if (a.caption == b.caption) {
                    return 0;
                } else {
                    return (a.caption > b.caption) ? 1 : -1;
                }
            };
            var compare = function(a, b) {
                var ret = matchCompare(a, b);
                return (ret != 0) ? ret : textCompare(a, b);
            };

            completions = completions.sort(compare);
            
            return completions;
        
    }
    
    // uses http://rhymebrain.com/api.html
    var typescriptAutoCompleter = {
        getCompletions: function(editor: AceAjax.Editor, session: AceAjax.IEditSession, pos: { row: number, column: number }, prefix, callback) {
            var curPos = tsServ.fileCache.lineColToPosition(scriptFileName, pos.row + 1, pos.column + 1);
            
            session.__isInStringToken= aceUtils.isStringChar(aceUtils.getCurChar(session,pos));
            
            session.__paramHelpItems=aceUtils.getParameterHelpItems(tsServ, scriptFileName, session, pos);

            if (session.__paramHelpItems || session.__includeShellCmdSpaceChar) {
                return callback(null, [])
            }
            
            if (prefix && aceUtils.isAllNumberStr(prefix)){
                return callback(null,[]);
            }

            let completionEntries=getCompletionEntries(curPos,prefix);
            
            if (!prefix){
               session.__firstCompletionEntry=completionEntries[0] && tsServ.getCompletionEntryDetailsInfo(scriptFileName, curPos, completionEntries[0].caption); 
            }
            
           // console.log("prefix",prefix,completionEntries[0], session.__firstCompletionEntry);
            
            callback(null, completionEntries)
        },

        getDocTooltip: function(item) {
            if (item.isAutoComplete) {
                var detailInfo: any = tsServ.getCompletionEntryDetailsInfo(scriptFileName, item.pos, item.caption) || { type: "" };
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
    

export var getTypescriptParameterCompleter=(tsServ: ts.TypescriptService, scriptFileName: string)=>{
    var typeScriptParameterCompleter = {
        getCompletions: function(editor: AceAjax.Editor, session: AceAjax.IEditSession, pos: { row: number, column: number }, prefix, callback) {
            var helpItems =(session.__paramHelpItems);

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

