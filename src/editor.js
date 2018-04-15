const fs = require('fs');
const { BrowserWindow, dialog } = require('electron').remote;

let inputArea = null;
let inputTxt = null;
let footerArea = null;

let currentPath = '';
let editor = null;

window.addEventListener('DOMContentLoaded', onLoad);

function onLoad() {
    inputArea = document.getElementById('input_area');
    inputTxt = document.getElementById('input_txt');
    footerArea = document.getElementById('footer_fixed');

    editor = ace.edit('input_txt');
    editor.setTheme('ace/theme/dracula');
    editor.focus();
    editor.gotoLine(1);
    editor.renderer.setShowPrintMargin(false);

    setEditorTheme();

    document.addEventListener('dragover', (event) => {
        event.preventDefault();
    });
    document.addEventListener('drop', (event) => {
        event.preventDefault();
    });

    inputArea.addEventListener('dragover', (event) => {
        event.preventDefault();
    });
    inputArea.addEventListener('dragleave', (event) => {
        event.preventDefault();
    });
    inputArea.addEventListener('dragend', (event) => {
        event.preventDefault();
    });
    inputArea.addEventListener('drop', (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        readFile(file.path);
    });

    document.querySelector('#btnLoad').addEventListener('click', () => {
        openLoadFile();
    });
    document.querySelector('#btnSave').addEventListener('click', () => {
        saveFile();
    });
};

function openLoadFile() {
    const win = BrowserWindow.getFocusedWindow();

    dialog.showOpenDialog(
        win,
        {
            properties: ['openFile'],
            filters: [
                {
                    name: 'Documents',
                    extensions: ['*']
                }
            ]
        },
        (fileNames) => {
            if (fileNames) {
                readFile(fileNames[0]);
            }
        });
}

function readFile(path) {
    currentPath = path;
    fs.readFile(path, (error, text) => {
        if (error != null) {
            alert('error : ' + error);
            return;
        }
        footerArea.innerHTML = path;
        editor.setValue(text.toString(), -1);
        setEditorTheme(path);
    });
}

function saveFile() {
    if (currentPath === '') {
        saveNewFile();
        return;
    }

    const win = BrowserWindow.getFocusedWindow();

    dialog.showMessageBox(win, {
        title: 'ファイルの上書き保存を行います。',
        type: 'info',
        buttons: ['OK', 'Cancel'],
        detail: '本当に保存しますか？'
    },
        (response) => {
            if (response === 0) {
                const data = editor.getValue();
                writeFile(currentPath, data);
            }
        }
    );
}

function writeFile(path, data) {
    fs.writeFile(path, data, (error) => {
        if (error != null) {
            alert('error : ' + error);
        } else {
            setEditorTheme(path);
        }
    });
}

function saveNewFile() {
    const win = BrowserWindow.getFocusedWindow();
    dialog.showSaveDialog(
        win,
        {
            properties: ['openFile'],
            filters: [
                {
                    name: 'Documents',
                    extensions: ['*']
                }
            ]
        },
        (fileName) => {
            if (fileName) {
                const data = editor.getValue();
                currentPath = fileName;
                writeFile(currentPath, data);
            }
        }
    );
}

function setEditorTheme(fileName = '') {
    const type = fileName.split('.');
    const ext = type[type.length - 1].toLowerCase()
    switch (ext) {
        case 'txt':
            editor.getSession().setMode('ace/mode/plain_text');
            break;
        case 'py':
            editor.getSession().setMode('ace/mode/python');
            break;
        case 'rb':
            editor.getSession().setMode('ace/mode/ruby');
            break;
        case 'c':
        case 'cpp':
        case 'h':
            editor.getSession().setMode('ace/mode/c_cpp');
            break
        case 'html':
            editor.getSession().setMode('ace/mode/html');
            break;
        case 'js':
            editor.getSession().setMode('ace/mode/javascript');
            break;
        case 'md':
            editor.getSession().setMode('ace/mode/markdown');
            break;
        default:
            editor.getSession().setMode('ace/mode/plain_text');
            break;
    }
}
