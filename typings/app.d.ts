/// <reference path="tsd.d.ts" />

declare module AceAjax {
  export interface IEditSession{
	  __paramHelpItems:any;
	  __includeShellCmdSpaceChar:boolean;
	  __isInStringToken:boolean;
    __prevChar:string;
    //除firstCompletionEntry,其它的参数皆在placeHolderCompleter里assign.
	  __firstCompletionEntry:any;
    
    __collectionNames:string[];
  } 
}