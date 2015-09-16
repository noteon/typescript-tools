/// <reference path="./typings/tsd.d.ts" />
var aceUtils = require('./aceUtils');
exports.getTypeScriptAutoCompleters = function (tsServ, scriptFileName, methodHelpUrlGetter) {
    var getCompletionEntries = function (posChar, prefix) {
        var completionsInfo = tsServ.getCompletionsInfoByPos(true, scriptFileName, posChar);
        if (!completionsInfo) {
            return [];
        }
        //console.log("completionsInfo",completionsInfo.entries);
        var isMethodOrFunction = function (kind) {
            return (kind === "method") || (kind === "function");
        };
        var completions = completionsInfo.entries.map(function (it) {
            return {
                caption: it.name,
                snippet: it.name + (isMethodOrFunction(it.kind) ? "($2)" : ""),
                meta: it.kind,
                pos: posChar,
                srcProps: it,
                isAutoComplete: true
            };
        });
        var matchFunc = function (elm) {
            return elm.caption.indexOf(prefix) == 0 ? 1 : 0;
        };
        var matchCompare = function (a, b) {
            return matchFunc(b) - matchFunc(a);
        };
        var textCompare = function (a, b) {
            if (a.caption == b.caption) {
                return 0;
            }
            else {
                return (a.caption > b.caption) ? 1 : -1;
            }
        };
        var compare = function (a, b) {
            var ret = matchCompare(a, b);
            return (ret != 0) ? ret : textCompare(a, b);
        };
        completions = completions.sort(compare);
        return completions;
    };
    // uses http://rhymebrain.com/api.html
    var typescriptAutoCompleter = {
        getCompletions: function (editor, session, pos, prefix, callback) {
            var posChar = tsServ.fileCache.lineColToPosition(scriptFileName, pos.row + 1, pos.column + 1);
            // if (/^[0-9]$/.test(prefix[0]))
            //   return callback(null,[]);
            session.__paramHelpItems = aceUtils.getParameterHelpItems(tsServ, scriptFileName, session, pos);
            if (session.__paramHelpItems) {
                return callback(null, []);
            }
            var completionEntries = getCompletionEntries(posChar, prefix);
            if (!prefix) {
                session.__firstCompletionEntry = completionEntries[0] && tsServ.getCompletionEntryDetailsInfo(scriptFileName, posChar, completionEntries[0].caption);
            }
            // console.log("prefix",prefix,completionEntries[0], session.__firstCompletionEntry);
            callback(null, completionEntries);
        },
        getDocTooltip: function (item) {
            if (item.isAutoComplete) {
                var detailInfo = tsServ.getCompletionEntryDetailsInfo(scriptFileName, item.pos, item.caption) || { type: "" };
                if (detailInfo && detailInfo.type) {
                    var helpUrl = "";
                    if (methodHelpUrlGetter) {
                        var getMethodDotName = function () {
                            if (detailInfo.kind === "method" || detailInfo.kind === "property") {
                                var parts = detailInfo.type.split(" ");
                                if (parts.length >= 2) {
                                    var subParts = parts[1].split("(");
                                    return (subParts[0] || "").trim();
                                }
                            }
                            return "";
                        };
                        var methodDotName = getMethodDotName();
                        if (methodDotName) {
                            helpUrl = methodHelpUrlGetter(methodDotName);
                        }
                    }
                    item.docHTML = aceUtils.highlightTypeCommentAndHelp(detailInfo.type, detailInfo.docComment, helpUrl);
                }
                else
                    item.docHTML = '';
            }
        }
    };
    return typescriptAutoCompleter;
};
exports.getTypescriptParameterCompleter = function (tsServ, scriptFileName) {
    var typeScriptParameterCompleter = {
        getCompletions: function (editor, session, pos, prefix, callback) {
            var helpItems = (session["__paramHelpItems"]);
            if (!helpItems)
                return callback(null, []);
            var completionsItems = helpItems.items.map(function (it, idx) {
                var currentParam = undefined;
                var paramsText = (it.parameters.map(function (param, paramIdx) {
                    if (paramIdx === helpItems.argumentIndex) {
                        currentParam = param;
                        return param.type;
                    }
                    else
                        return param.type;
                }).join(it.separator));
                var value = it.prefix + paramsText + it.suffix;
                return {
                    caption: value,
                    value: " ",
                    meta: "",
                    toolTip: currentParam && aceUtils.highlightTypeAndComment(currentParam),
                    isHelpItem: true,
                    score: (idx === helpItems.selectedItemIndex) ? 1 : 0
                };
            });
            // setTimeout(() => {
            //     if (editor.completer && editor.completer.completions) {
            //         console.log("setFilterText",filterText);
            //         editor.completer.completions.setFilter(filterText)
            //         editor.completer.openPopup(editor, filterText, true);
            //     }
            // }, 0)
            return callback(null, completionsItems);
        },
        getDocTooltip: function (item) {
            if (item.isHelpItem)
                item.docHTML = item.toolTip;
        }
    };
    return typeScriptParameterCompleter;
};
