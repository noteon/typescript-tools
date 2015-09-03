/// <reference path="./typings/tsd.d.ts" />
var aceUtils = require("./aceUtils");
var TokenTooltip = require("./aceTokenTooltip").TokenTooltip;
exports.setupTooltip = function (aceEditor, tsServ, scriptFileName) {
    aceEditor["tokenTooltip"] = new TokenTooltip(aceEditor, function (editor, token, pos) {
        var isModKeyPressed = function () {
            var commandKey = 91;
            var ctrlKey = 17;
            var os = require('os');
            var modKey = (os.platform() === 'darwin') ? commandKey : ctrlKey;
            var keymaster = require('keymaster');
            return keymaster.isPressed(modKey);
        };
        var posChar = tsServ.fileCache.lineColToPosition(scriptFileName, pos.row + 1, pos.column + 1);
        if (!isModKeyPressed()) {
            var quickInfo = tsServ.getQuickInfoByPos(scriptFileName, posChar);
            if (quickInfo && quickInfo.type && quickInfo.type !== "any") {
                return aceUtils.highlightTypeAndComment(quickInfo);
            }
        }
        else {
            var definitionInfo = tsServ.getDefinitionInfoByPos(scriptFileName, posChar);
            //console.log('definitionInfo',definitionInfo);
            if (definitionInfo && definitionInfo.content)
                return aceUtils.highLightCode(definitionInfo.content);
        }
    });
};
