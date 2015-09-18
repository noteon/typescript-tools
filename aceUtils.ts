/// <reference path="./typings/tsd.d.ts" />
declare var hljs: any;

export var EOL = require("os").EOL;

export var getLinesChars = function(lines) {
  var count = 0;
  lines.forEach(function(line) {
    return count += line.length + 1;
  });
  return count;
};

export var getChars = function(docOrSession, pos: AceAjax.Position) {
  return getLinesChars(docOrSession.getLines(0, pos.row - 1)) + pos.column;
}

export var isStringChar=(char)=>{
   return char && ["'",'"','`'].indexOf(char)>-1;
}

export var getPrevChar = function(docOrSession, pos: AceAjax.Position) {
  return docOrSession.getValue().charAt(getChars(docOrSession, { row: pos.row, column: pos.column - 1 }));
}

export var getCurChar = function(docOrSession, pos: AceAjax.Position) {
  return docOrSession.getValue().charAt(getChars(docOrSession, { row: pos.row, column: pos.column }));
}

export var getPosition = function(doc, chars) {
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
export var getParameterHelpItems = (tsServ, fileName, session, pos) => {
  let prevChar = getPrevChar(session, pos);

  if (!(prevChar === '(' || prevChar === ',')) return;

  var posChar = tsServ.fileCache.lineColToPosition(fileName, pos.row + 1, pos.column + 1);

  return tsServ.getSignatureInfoByPos(fileName, posChar);
}


export var highLightCode = (code) => {
  if (hljs) {
    return hljs.highlight('typescript', code, true).value;
  } else
    return code;
};


export var highlightTypeAndComment = (info, typeFirst: boolean = true) => {
  var docComment = "";
  if (info.docComment) {
    docComment = `<p class='hljs-comment'>${info.docComment}</p>`
  }

  var type = "";
  if (info.type) {
    var matches = info.type.match(/^(\(method\)|\(property\)) ?(.*)$/);
    var prefix = "";
    var content = info.type;
    if (matches && matches.length === 3) {
      prefix = `<span class='hljs-name'>${matches[1]} </span>`;
      content = matches[2];
    }

    type = prefix + highLightCode(content);
    // console.log('typeHtml',type);
  }


  return typeFirst ? type + docComment : docComment + type;
};

export var highlightTypeCommentAndHelp = (type, docComment, docUrl?: string) => {
  if (!docUrl)
    return highlightTypeAndComment({ type: type, docComment: docComment }, true)
  else
    return highlightTypeAndComment({ type: type, docComment: docComment }, false) + `<p><a href='#' onmousedown="require('shell').openExternal('${docUrl}')">view online help</a></p>`;
}

export var getCollectionName = (currentLine: string) => {
  let colMatches = currentLine.match(/[^\w]?db\.getCollection\((.*?)\).*$/);
  if (colMatches && colMatches[1])
    return colMatches[1].substring(1, colMatches[1].length - 1);

  let dotMatches = currentLine.match(/[^\w]?db\.(.*?)\..*$/)
  if (dotMatches && dotMatches[1]){
    let colName=<any>dotMatches[1]
    if (colName && [")","}"].indexOf(<any>_.last(colName))>-1) return;
    
    return colName
  }
    

}

