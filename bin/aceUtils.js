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
