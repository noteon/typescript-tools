declare module AceAjax {
        export interface ITypeScriptServ {
                ts: any;
                transpile: (transferFunc?: (src: string) => string) => string;
                format: () => string;

                appendScriptContent: (scriptFile, lines: string[]) => void;

                updateScript: (scriptFile, content: string) => void;

                reloadDocument: () => void;

                getOriginPos: (pos: { row: number, column: number }) => { row: number; column: number }
        }

        export interface Editor {
                typescriptServ: ITypeScriptServ;
        }
}