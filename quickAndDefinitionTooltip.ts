/// <reference path="./typings/tsd.d.ts" />

import aceUtils = require("./aceUtils");
import ts = require("./typescriptService");


var TokenTooltip = require("./aceTokenTooltip").TokenTooltip;


export var setupTooltip = (aceEditor, tsServ: ts.TypescriptService, scriptFileName: string,helpUrlFetcher?: (methodDotName: string) => string) => {
    aceEditor["tokenTooltip"] = new TokenTooltip(aceEditor, (editor, token, pos) => {
        aceEditor["tokenTooltip"].__currentDocUrl="";
        var isModKeyPressed = () => {
            const commandKey = 91;
            const ctrlKey = 17;
            var os = require('os');
            var modKey = (os.platform() === 'darwin') ? commandKey : ctrlKey;
            var keymaster = require('keymaster');
            return keymaster.isPressed(modKey);
        }

        var posChar = tsServ.fileCache.lineColToPosition(scriptFileName, pos.row + 1, pos.column + 1);

        if (!isModKeyPressed()) {
            var quickInfo = tsServ.getQuickInfoByPos(scriptFileName, posChar);
            //"(property) mongo.ICollection.find: () => void"
            //"(method) mongo.IDatabase.getCollection(name:string): mongo.ICollection"

            if (quickInfo && quickInfo.type && quickInfo.type !== "any") {//any is invalid tooltip
                if (helpUrlFetcher){
                    let methodDotName=aceUtils.getMethodDotName(quickInfo.type);
                    let docUrl=methodDotName && helpUrlFetcher(methodDotName); 
                    
                    if (docUrl){
                        aceEditor["tokenTooltip"].__currentDocUrl=docUrl;
                        return aceUtils.highlightTypeCommentAndTip(quickInfo.type, quickInfo.docComment,"<p class='hljs-name'>Press <span class='hljs-string'><b>F1</b></span> to view online help</p>")
                    }
                }
                
                return aceUtils.highlightTypeAndComment(quickInfo)
            }
        } else {
            var definitionInfo = tsServ.getDefinitionInfoByPos(scriptFileName, posChar);
            //console.log('definitionInfo',definitionInfo);
        
            if (definitionInfo && definitionInfo.content)
                return aceUtils.highLightCode(definitionInfo.content)
        }
    });
}

