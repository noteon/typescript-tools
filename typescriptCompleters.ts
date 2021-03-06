/// <reference path="./typings/tsd.d.ts" />

import aceUtils = require('./aceUtils');
import ts = require('./typescriptService');

//置顶，仅用于获取前置的参数
export var fetchParamsPlaceHolderCompleter=(tsServ: ts.TypescriptService, scriptFileName: string) => {
    // uses http://rhymebrain.com/api.html
    
    var placeHolderAutoCompleter = {
        getCompletions: function(editor: AceAjax.Editor, session: AceAjax.IEditSession, pos: { row: number, column: number }, prefix, callback) {
            session.__isInStringToken= aceUtils.isStringChar(aceUtils.getCurChar(session,pos));
            session.__paramHelpItems=aceUtils.getParameterHelpItems(tsServ, scriptFileName, session, pos);
            session.__prevChar= aceUtils.getPrevChar(session, {row:pos.row, column:pos.column- ((prefix||"").length) });
            
            session.__includeShellCmdSpaceChar=undefined;

            if (session.__paramHelpItems || session.__isInStringToken) {
                return callback(null, [])
            }


            let currentLine = session.getLine(pos.row).trim();

            session.__includeShellCmdSpaceChar=_.some(["show ","use ","help "],(it)=>{
                return _.startsWith(currentLine,it)
            })
            

            return callback(null,[]);
        }
    }

    
    return placeHolderAutoCompleter;
}

export var getTypeScriptAutoCompleters = (params:{tsServ: ts.TypescriptService, scriptFileName: string, methodHelpUrlGetter?:(methodDotName:string)=>string, userSnippets?:IAutoCompleteItem[]|Function}) => {
    var tsServ=params.tsServ;
    var scriptFileName=params.scriptFileName;
    var methodHelpUrlGetter=params.methodHelpUrlGetter;
    
    var getCompletionEntries=(posChar)=>{
            let completionsInfo = tsServ.getCompletionsInfoByPos(true, scriptFileName, posChar);
            
            if (!completionsInfo) {
                return [];
            }
               
            //console.log("completionsInfo",completionsInfo.entries);
            let isMethodOrFunction=(kind)=>{
                return (kind==="method") || (kind==="function")
            }
            
            let completions = completionsInfo.entries.map((it) => {
               //console.log("completionsInfo",it); 
                    
                return {
                    caption: it.name,
                    snippet: _.replace(it.name,'$','\\$')+(isMethodOrFunction(it.kind)?"($2)":""),
                    meta: it.kind,
                    pos: posChar,
                    srcProps: it,
                    isAutoComplete: true
                }
            });
            
            return completions;
    } 
    // uses http://rhymebrain.com/api.html
    var typescriptAutoCompleter = {
        
        getCompletions: function(editor: AceAjax.Editor, session: AceAjax.IEditSession, pos: { row: number, column: number }, prefix, callback) {
            if (session.__paramHelpItems || session.__includeShellCmdSpaceChar) {
                return callback(null, [])
            }
            
            var curPos = tsServ.fileCache.lineColToPosition(scriptFileName, pos.row + 1, pos.column + 1);
            
            if (prefix && aceUtils.isAllNumberStr(prefix)){
                return callback(null,[]);
            }
            
            if (session.__prevChar!==".")
                session.__firstCompletionEntry=undefined;
                
                
             if (!prefix && ["{","["].indexOf(session.__prevChar)>-1)
                return callback(null, []);

            let completionEntries=getCompletionEntries(curPos);
           
                
            if (!prefix){
                session.__firstCompletionEntry=completionEntries[0] && tsServ.getCompletionEntryDetailsInfo(scriptFileName, curPos, completionEntries[0].caption); 
            };
            
            
            let isMongoDatabaseMethod=(()=>{//mongoDatabase 需要将属性（collection）置顶
                if (!session.__firstCompletionEntry) return;
                
                return session.__firstCompletionEntry.type.indexOf("(method) mongo.IDatabase.")===0;
            })();
            
            if (isMongoDatabaseMethod){
                let cols=[];
                completionEntries=completionEntries.map((it)=>{
                    if ((it.meta==="property") && (it.caption!=="$cmd")){
                        it.score=10;
                        it.meta="collection";
                        cols.push(it.caption);
                        //console.log("set top", it);
                    }else{
                        if (it.caption==="$cmd"){
                            delete it.snippet;
                            it.value=it.caption;
                        }
                        
                        it.score=1;
                    }
                    return it;
                });
                
                if (!_.isEmpty(cols))
                    session.__collectionNames=cols;
            }            
            
            
            let userSnippets=(()=>{
                if (!params.userSnippets) return;
                let lineBefore=aceUtils.getLineTextBeforePos(editor.session, pos);
                
                if (!/^[A-Za-z0-9_-]+$/.test(lineBefore)) return;
                
                return _.isFunction(params.userSnippets)? (params.userSnippets as Function)():params.userSnippets;
            })()
           
            let entries=_.union(userSnippets,completionEntries)
            callback(null, entries)
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
            } //user snippets may include item.docHTML
        }
    }

    return typescriptAutoCompleter;
}
    

export var getTypescriptParameterCompleter=(tsServ: ts.TypescriptService, scriptFileName: string)=>{
    var typeScriptParameterCompleter = {
        getCompletions: function(editor: AceAjax.Editor, session: AceAjax.IEditSession, pos: { row: number, column: number }, prefix, callback) {
            var helpItems =(session.__paramHelpItems);

            if (!helpItems) return callback(null, [])
            
            let lineBefore=aceUtils.getLineTextBeforePos(editor.session, pos);
            
            let canShowHelpItems=(()=>{
                if (lineBefore.indexOf("(")>-1) return true;
                
                if (lineBefore.indexOf("{")>-1 && lineBefore.indexOf("}")>-1) return false;
                
                return true;
            })();
            if (!canShowHelpItems)
               return callback(null,[]);
            
            let trimType=(type)=>{
                if (!type) return type;
                
                let rst=type.replace(/: any$/,'');
               
                rst=rst.replace(/ |\t|\n/g,'');
                
                if (rst && rst.length>30){
                    rst=rst.split(":")[0];                    
                }
                   
                return rst;

            }
            //console.log({helpItems});
            
            var completionsItems = helpItems.items.map((it, idx) => {
                var currentParam = undefined;
                var paramsText = (it.parameters.map((param, paramIdx) => {
                    if (paramIdx === helpItems.argumentIndex) {
                        currentParam = param;
                        return trimType(param.type)
                    }
                    else
                        return trimType(param.type);
                }
                    ).join(it.separator.trim()));

                var value = (it.prefix + paramsText + it.suffix).replace(/ |\t|\n/g,'');
                
                var curParamType=currentParam && trimType(currentParam.type);
                
                return {
                    caption: value,
                    value: " ",
                    meta: "",
                    toolTip: currentParam && currentParam.docComment &&  aceUtils.highlightTypeAndComment(currentParam),
                    currentParam:curParamType,
                    isHelpItem: true,
                    score: (idx === helpItems.selectedItemIndex) ? 1 : 0
                }
            });
                

            return callback(null, completionsItems)
        },

        getDocTooltip: function(item) {
            if (item.isHelpItem)
                item.docHTML = item.toolTip;
        }

    }
    
    return typeScriptParameterCompleter;
}

