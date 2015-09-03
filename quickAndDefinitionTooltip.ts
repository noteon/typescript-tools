/// <reference path="./typings/tsd.d.ts" />

import aceUtils = require("./aceUtils");
import ts = require("./typescriptService");


var TokenTooltip = require("./aceTokenTooltip").TokenTooltip;

export var setupTooltip = (aceEditor, tsServ: ts.TypescriptService, scriptFileName: string) => {
    aceEditor["tokenTooltip"] = new TokenTooltip(aceEditor, (editor, token, pos) => {
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

            if (quickInfo && quickInfo.type && quickInfo.type !== "any") {//any is invalid tooltip                
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

