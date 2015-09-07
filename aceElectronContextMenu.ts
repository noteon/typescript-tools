/// <reference path="./typings/tsd.d.ts" />

function setupContextMenu(aceEditor:AceAjax.Editor) {
    let editor=aceEditor;
    
    var remote = require('remote');
    if (!remote)
        return console.error("require electron remote module");

    var Menu = remote.require('menu');
    var MenuItem = remote.require('menu-item');

    var template = [
        {
            label: "Format Code",
            accelerator: 'Alt+Shift+F',
            click: function(e) {
                editor.execCommand("Format Code");
            }
        },
        {
            label: "Toggle Comment",
            accelerator: 'CmdOrCtrl+/',
            click: function(e) {
                editor.execCommand("Toggle comment");
            }
        },
        {
            type: "separator"
        },
        // {
        //     label: 'Folding',
        //     submenu: [
        //     {
        //         label: 'Fold selection',
        //         accelerator: 'CmdOrCtrl+F1',
        //         click: function() { editor.execCommand("Fold selection");}
        //     },
        //     {
        //         label: 'Unfold',
        //         accelerator: 'CmdOrCtrl+Shift+F1',
        //         click: function() { editor.execCommand("Unfold");}
        //     },
        //     {
        //         type:"separator"
        //     },
        //     {
        //         label: 'Fold all',
        //         accelerator: 'Alt-0 | Cmd+Options+0',
        //         click: function() { editor.execCommand("Fold all");}
        //     },
        //     {
        //         label: 'Unfold all',
        //         accelerator: 'Alt-Shift-0 | Command-Option-Shift-0',
        //         click: function() { editor.execCommand("Unfold all");}
        //     },
        //     ]
        // },
        {
            type: 'separator'
        },
        {
            label: 'Cut',
            accelerator: 'CmdOrCtrl+X',
            selector: 'cut:'
        },
        {
            label: 'Copy',
            accelerator: 'CmdOrCtrl+C',
            selector: 'copy:'
        },
        {
            label: 'Paste',
            accelerator: 'CmdOrCtrl+V',
            selector: 'paste:'
        }
    ];    
    // contextMenu.append(new MenuItem({ label: 'Format Code', click: function() { console.log('item 1 clicked'); } }));
    // contextMenu.append(new MenuItem({ type: 'separator' }));

    var contextMenu = Menu.buildFromTemplate(template);
    
    editor.container.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        contextMenu.popup(remote.getCurrentWindow());
    });
}

export = setupContextMenu;