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



export function getMethodDotName(quickInfoType:string){
    if (!quickInfoType) return;
    if ((quickInfoType.indexOf('(property)')<0) && (quickInfoType.indexOf('(method)')<0)) return;
    
    let strs=quickInfoType.split(' ');
    if (strs.length<2) return;
    
    let theMethodStr=strs[1];
    strs=theMethodStr.split('(');
    if (strs.length>=2) return strs[0];
    
    strs=theMethodStr.split(':');
    if (strs.length>=2) return strs[0];
}

export function isAllNumberStr(n) {
    return /^\d+$/.test(n)
}

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
   if (!code) return code;
   
  if (hljs) {
    if (code.split('\n').length>1)
        return "<span class='mb_example_code'>"+hljs.highlight('typescript', code, true).value+"</span>";
    else
       return hljs.highlight('typescript', code, true).value
  } else
    return code;
};


export var highlightTypeAndComment = (info, typeFirst: boolean = true) => {
  var docComment = "";
  if (info.docComment) {
    let docCommentParts=info.docComment.split('e.g.');
    
    if (docCommentParts.length!==2){
      docComment = `<p class='hljs-comment'>${info.docComment}</p>`
    }else{
      
      docComment = `<p><span class='hljs-comment'>${docCommentParts[0]}</span>${highLightCode(docCommentParts[1])}</p>`
    }
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


  return "<pre class='mb_ace_doc_tooltip'>"+(typeFirst ? type + docComment : docComment + type)+"</pre>";
};

export var highlightTypeCommentAndHelp = (type, docComment, docUrl?: string) => {
  if (!docUrl)
    return highlightTypeAndComment({ type: type, docComment: docComment }, true)
  else
    return highlightTypeAndComment({ type: type, docComment: docComment }, false) + `<p><a href='#' onmousedown="require('shell').openExternal('${docUrl}')">view online help</a></p>`;
}

export var highlightTypeCommentAndTip = (type, docComment, tipHtml: string) => {
    return highlightTypeAndComment({ type: type, docComment: docComment }, true) + tipHtml;
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


export function calcTextWidth(text:string, font) {
  let f = font || '12px',
      o = $('<div>' + text + '</div>')
            .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
            .appendTo($('body')),
      w = o.width();

  o.remove();

  return w;
}

export function appendTooltipToBody(){
   let oldP=ace.require('ace/tooltip').Tooltip.prototype;
   
   ace.require('ace/tooltip').Tooltip=function(parentNode) {
      this.isOpen = false;
      this.$element = null;
      this.$parentNode = document.body;//parentNode;
   }
   
   ace.require('ace/tooltip').Tooltip.prototype=oldP;
}

export function injectCompleterToAdjustMethodParamWidth(){
    let proto=ace.require("ace/autocomplete").Autocomplete.prototype.openPopup;
    
    let widthChanged;
    let oldWidth;
    
     ace.require("ace/autocomplete").Autocomplete.prototype.openPopup = function(editor, prefix, keepPopupPosition) {
        let completions=editor && editor.completer && editor.completer.completions;
        if (completions && completions.filtered){
             completions.filtered.sort((a,b)=>compareCompletionItem(prefix,a,b));
        }
        
        let rst= proto.apply(this, arguments);
        
        if (!oldWidth) //only set once
             oldWidth=$('.ace_editor.ace_autocomplete').width();
        
        if (widthChanged){
             $('.ace_editor.ace_autocomplete').width(oldWidth);
             widthChanged=false;
        }
           
        if (!completions) return rst;
        if (_.isEmpty(completions.filtered)) return rst;
        
        
        let methodParamItem=completions.filtered[0];
        if (!methodParamItem.isHelpItem){
            return rst;
        } 
        
        let maxLengthItem=_.max(completions.filtered,(it:any)=>it.caption.length);
         
        let width=calcTextWidth(maxLengthItem.caption, $('.ace_editor.ace_autocomplete .ace_line.ace_selected').css('font'));
        
        $('.ace_editor.ace_autocomplete').width(width+10);
        
        widthChanged=true;
        //console.log(maxLengthItem.caption);
        //console.log(maxLengthItem.caption, width,$('.ace_editor.ace_autocomplete .ace_line.ace_selected').css('font'));
        
        if (methodParamItem.currentParam){
          _.delay(()=>{
            let $line=$('.ace_editor.ace_autocomplete').find('.ace_line.ace_selected');
            let start=methodParamItem.caption.indexOf(methodParamItem.currentParam);
            if (start>-1){
              let newHtml=(methodParamItem.caption.slice(0,start)||"")+ 
                  `<span class='ace_completion-highlight'>${methodParamItem.currentParam}</span>`+ 
                  (methodParamItem.caption.slice(start+methodParamItem.currentParam.length)||"");
                  
              $line.html(newHtml);      
            }
          },25)
        }
        
        return rst;
    }       
}

export function compareCompletionItem(filterText, a,b){
      var matchFunc = function(elm) {
          if (elm.caption===filterText) return 3;
          if (elm.caption.toLowerCase()===filterText.toLowerCase()) return 2;
          
          return elm.caption.indexOf(filterText) === 0 ? 1 : 0;
      };
      

      var matchCompare = function(a, b) {
          return matchFunc(b) - matchFunc(a);
      };
      
      var scoreCompare=function(a,b){
          let aScore=-1000;
          let bScore=-1000;
          if (_.isNumber(a.score)) aScore=a.score;
          if (_.isNumber(b.score)) bScore=b.score;
          
          
        if (aScore!== bScore){
          
           return (aScore-bScore)>0?-1:1;
        }else return 0;
        
      }
      
      var textCompare = function compare(a,b){
          let aCaption=a.caption;
          let bCaption=b.caption;
          
          if (_.isString(aCaption) && _.isString(bCaption)){
              return aCaption.toLowerCase().localeCompare(bCaption.toLowerCase());
          }
          
          if (aCaption===bCaption) return 0;
          
          return (aCaption>bCaption)?1:-1;
      }
      
      var metaCompare=function(a,b){
        const defaultWeight=0;
        let metaWeight={
          "code template":1,
        }
        let aWeight=metaWeight[a.meta]|| defaultWeight;
        let bWeight=metaWeight[b.meta]|| defaultWeight;
        return (aWeight-bWeight)?1:-1;
      }
      
      var compare = function(a, b) {
          let  ret = matchCompare(a, b);
          
          if (ret===0)
              ret=scoreCompare(a,b)
              
          if (ret===0)
              ret=textCompare(a,b)
           
          return (ret != 0) ? ret : metaCompare(a, b);
      };

     return compare(a,b)
}