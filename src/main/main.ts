import {AppConf, WindowOptions} from '../types'


const appName = 'tagPrinter'
import { app, BrowserWindow, Menu, ipcMain, dialog, screen, MessageBoxOptions } from 'electron'
const fs = require("fs")
const path = require('path')
import {sleep, DEFAULT_CONFIG, i18n} from './exports.js'

const isLinux = process.platform === "linux"
const restartCommandShell =  `~/system/scripts/appsCvc restart ${appName} &`

var appWin:Electron.BrowserWindow
var configWin:Electron.BrowserWindow | null
var APPCONF:AppConf

const CONFIG_FILE = `${app.getPath('userData')}/_custom/CONF.json`
APPCONF = loadConfigFile(CONFIG_FILE)


/*=============================================
=            Menu            =
=============================================*/

  const menu:Electron.MenuItemConstructorOptions[] = [
    {
        role: 'appMenu',
        label: 'Aplicación',
        submenu: [
            {label:'Reiniciar', accelerator: 'CmdOrCtrl+R', click() { restart() } },
            {label:'Refrescar', role: 'forceReload' },
            {label:'Salir', role: 'quit'}
        ]
    },
    {
        label: 'Configuración',
        submenu: [
            {label:'Ajustes', accelerator: 'CmdOrCtrl+E',  click() {
              if (configWin == null)  { config() } 
              else                    { configWin.focus() } 
            }}
        ]
    },
    {
      role: 'help',
      label: 'Ayuda',
      submenu: [
          {label:'Información',     click() { about() } },
          {label:'Consola Web', role: 'toggleDevTools'}
      ]
    }
  ]

/*=====  End of Menu  ======*/



/*=============================================
=            Funciones            =
=============================================*/

  function restart() {
    if (isLinux) {
      let exec = require('child_process').exec
      exec(restartCommandShell)
    } else {
      app.relaunch()
      app.quit()
    }
  }

  function saveConfFile(prefs:AppConf, file:string) {
    fs.mkdirSync( path.dirname(file), { recursive: true } )
    fs.writeFileSync(file, JSON.stringify(prefs), 'utf8')
  }

  function loadConfigFile(file:string):AppConf {
    if (fs.existsSync(file)) {
      try {
        let data = JSON.parse(fs.readFileSync(file, 'utf8'))
        return data
      } catch (error) { return DEFAULT_CONFIG }
    } else { return DEFAULT_CONFIG}
  }


/*=====  End of Funciones  ======*/



/*=============================================
=            Ventanas            =
=============================================*/

  function initApp() {
    let windowOptions:WindowOptions = {
      autoHideMenuBar: true,
      fullscreen: false,
      frame: true,
      width: 305, height: 590,
      alwaysOnTop: false,
      resizable:false,
      show: false,
      icon: `${app.getAppPath()}/icon64.png`,
      webPreferences: { 
        contextIsolation: true, 
        preload: path.join(__dirname, "preload.js") 
      }
    }
    appWin = new BrowserWindow(windowOptions)

    appWin.loadFile(`${__dirname}/index.html`)
    appWin.loadFile(`${__dirname}/../UI/_index/index.html`)
    appWin.setTitle(appName)
    appWin.on('page-title-updated', (e)=>{ e.preventDefault()})
    Menu.setApplicationMenu( Menu.buildFromTemplate(menu) )
    appWin.show()
    appWin.on('closed', () => { app.quit() })

    screen.on('display-metrics-changed', restart )


    appWin.webContents.on('did-fail-load', async (e, code, desc)=> {
      await sleep(8000)
      appWin.reload()
    })
    if (APPCONF.debug.autoOpenDevTools) { appWin.webContents.openDevTools() }
  }

  function config() {
    let windowOptions:WindowOptions = {
      width: 350, height: 400,
      autoHideMenuBar: false,
      resizable: false,
      fullscreen: false,
      show: false,
      frame: true,
      alwaysOnTop: false,
      webPreferences: {
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js"),
        parent: appWin
      }
    }
    configWin = new BrowserWindow(windowOptions)
    configWin.loadFile(`${__dirname}/../UI/_config/config.html`)
    configWin.setMenu( null )
    configWin.show()
    
    configWin.on('closed', () => { configWin = null })
    if (APPCONF.debug.autoOpenDevTools) { configWin.webContents.openDevTools() }
  }

  function about() {
    const options:MessageBoxOptions  = {
      type: 'info',
      buttons: [i18n.actions.accept],
      message: i18n.aboutMessage
     }
    dialog.showMessageBox(appWin, options)
  }

/*=====  End of Ventanas  ======*/


app.on('ready', ()=>{
  if (isLinux) { app.importCertificate({certificate:"cvc.p12", password:"cvc"}, ()=>{}) }
  initApp()
})


/*=============================================
=                 IPC signals                 =
=============================================*/

ipcMain.on('saveAppConf', (_e, arg) => { 
  APPCONF = arg
  saveConfFile(arg, CONFIG_FILE)
  restart()
})

ipcMain.on('getGlobal', (e, type) => {
  switch(type) {
    case 'appConf':
      e.returnValue = APPCONF
    break
  }
})

ipcMain.on('printPreview', (e, page, width, height, delay=5000) => {
  let printWin = new BrowserWindow({ show: false, frame:false, resizable:false, webPreferences: { spellcheck:false}})
  printWin.setMenu(null)
  printWin.loadURL("data:text/html;charset=utf-8," + encodeURI(page))
  
  printWin.webContents.on('did-finish-load', () => {
    printWin.setBounds( {width: width+20, height: height+43})
    printWin.show()
    if (delay>0) {
      setTimeout( ()=>{ if (!!printWin) { printWin.close() } }, delay)
    }
    if (APPCONF.debug.autoOpenDevTools) { printWin.webContents.openDevTools() }
  })
})


/*=====  End of IPC signals  ======*/