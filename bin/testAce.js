/// <reference path="./typings/tsd.d.ts" />
var aceTs = require("./aceTypescript");
aceTs.setupAceEditor({
    fileName: "/tmp/testfile.ts",
    editorElem: 'editor'
});
