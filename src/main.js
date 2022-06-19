const { app, dialog, ipcMain, Menu, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: `${__dirname}/preload.js`,
            enableRemoteModule: true,
            nodeIntegration: true,
            contextIsolation: false
        },
        'icon': __dirname + '/shimarin.ico'
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // 開発ツールを有効化
    // mainWindow.webContents.openDevTools();

    Menu.setApplicationMenu(null)

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.handle('open-read-dialog', async (e, arg) => {
    const win = BrowserWindow.getFocusedWindow();
    return await dialog.showOpenDialog(win, {
        properties: ['openFile'],
        filters: [
            {
                name: 'Documents',
                extensions: ['*']
            }
        ]
    }).then(result => {
        return result.canceled ? "" : result.filePaths[0];
    }).catch(err => {
        console.log(err)
    });
});

ipcMain.handle('open-save-dialog', async (e, arg) => {
    const win = BrowserWindow.getFocusedWindow();
    return await dialog.showSaveDialog(win, {
        properties: ['openFile'],
        filters: [
            {
                name: 'Documents',
                extensions: ['*']
            }
        ]
    }).then(result => {
        return result.canceled ? "" : result.filePath;
    }).catch(err => {
        console.log(err)
    });
});

ipcMain.handle('show-message-box', async (e, arg) => {
    const win = BrowserWindow.getFocusedWindow();
    return await dialog.showMessageBox(win, {
        title: 'ファイルの上書き保存を行います。',
        type: 'info',
        buttons: ['OK', 'Cancel'],
        detail: '本当に保存しますか？'
    }).then(result => {
        return result.response === 0;
    }).catch(err => {
        console.log(err)
    })
});
