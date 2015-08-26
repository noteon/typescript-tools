// Copyright (c) Claus Reinke. All rights reserved.
// Licensed under the Apache License, Version 2.0.
// See LICENSE.txt in the project root for complete license information.
///<reference path='typings/node/node.d.ts'/>
///<reference path='node_modules/typescript/bin/typescript.d.ts'/>
var ts = require("typescript");
var TypescriptService = require("./typescriptService");
var path = require("path");
function extend(o1, o2) {
    var o = {};
    for (var p in o1) {
        o[p] = o1[p];
    }
    for (var p in o2) {
        if (!(p in o))
            o[p] = o2[p];
    }
    return o;
}
var fileNames;
var configFile, configObject, configObjectParsed;
// NOTE: partial options support only
var commandLine = ts.parseCommandLine(ts.sys.args);
if (commandLine.options.version) {
    console.log(require("../package.json").version);
    process.exit(0);
}
if (commandLine.fileNames.length > 0) {
    fileNames = commandLine.fileNames;
}
else if (commandLine.options.project) {
    configFile = path.join(commandLine.options.project, "tsconfig.json");
}
else {
    configFile = ts.findConfigFile(path.normalize(ts.sys.getCurrentDirectory()));
}
var options;
if (configFile) {
    configObject = ts.readConfigFile(configFile);
    if (!configObject) {
        console.error("can't read tsconfig.json at", configFile);
        process.exit(1);
    }
    //change by qinghai
    configObjectParsed = ts.parseConfigFile(configObject, ts.sys, path.dirname(configFile));
    if (configObjectParsed.errors.length > 0) {
        console.error(configObjectParsed.errors);
        process.exit(1);
    }
    fileNames = configObjectParsed.fileNames;
    options = extend(commandLine.options, configObjectParsed.options);
}
else {
    options = extend(commandLine.options, ts.getDefaultCompilerOptions());
}
if (!fileNames) {
    console.error("can't find project root");
    console.error("please specify root source file");
    console.error("  or --project directory (containing a tsconfig.json)");
    process.exit(1);
}
var tss = new TypescriptService();
try {
    tss.setup(fileNames, options);
    tss.listen();
}
catch (e) {
    console.error(e.toString());
    process.exit(1);
}
