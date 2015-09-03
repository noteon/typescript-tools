/// <reference path="./typings/tsd.d.ts" />
exports.EOL = require("os").EOL;
exports.getLinesChars = function (lines) {
    var count = 0;
    lines.forEach(function (line) {
        return count += line.length + 1;
    });
    return count;
};
exports.getChars = function (doc, pos) {
    return exports.getLinesChars(doc.getLines(0, pos.row - 1)) + pos.column;
};
exports.getPosition = function (doc, chars) {
    var count, i, line, lines, row;
    lines = doc.getAllLines();
    count = 0;
    row = 0;
    for (i in lines) {
        line = lines[i];
        if (chars < (count + (line.length + 1))) {
            return {
                row: row,
                column: chars - count
            };
        }
        count += line.length + 1;
        row += 1;
    }
    return {
        row: row,
        column: chars - count
    };
};
//tsServ, typeScript Service, Session: aceSession
exports.getParameterHelpItems = function (tsServ, fileName, session, pos) {
    var doc = session.getDocument();
    var prevChar = session.getValue().charAt(exports.getChars(doc, { row: pos.row, column: pos.column - 1 }));
    if (!(prevChar === '(' || prevChar === ','))
        return;
    var posChar = tsServ.fileCache.lineColToPosition(fileName, pos.row + 1, pos.column + 1);
    return tsServ.getSignatureInfoByPos(fileName, posChar);
};
exports.highLightCode = function (code) {
    if (hljs) {
        return hljs.highlight('typescript', code, true).value;
    }
    else
        return code;
};
exports.highlightTypeAndComment = function (info, typeFirst) {
    if (typeFirst === void 0) { typeFirst = true; }
    var docComment = "";
    if (info.docComment) {
        docComment = "<p class='hljs-comment'>" + info.docComment + "</p>";
    }
    var type = "";
    if (info.type) {
        var matches = info.type.match(/^(\(method\)|\(property\)) ?(.*)$/);
        var prefix = "";
        var content = info.type;
        if (matches && matches.length === 3) {
            prefix = "<span class='hljs-name'>" + matches[1] + " </span>";
            content = matches[2];
        }
        type = prefix + exports.highLightCode(content);
    }
    return typeFirst ? type + docComment : docComment + type;
};
