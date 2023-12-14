const { contextBridge, ipcRenderer } = require("electron")

import type {AppConf} from '../types'

contextBridge.exposeInMainWorld (
    "ipc", {
        get: {
            appConf: () => ipcRenderer.sendSync('getGlobal', 'appConf')
        },
        save: {
            appConf: (data:AppConf) => ipcRenderer.send('saveAppConf', data )
        },
        printer: {
            printPreview: (page:string, width:number, height:number, delay?:number) => { ipcRenderer.send('printPreview', page, width, height, delay) }
        }
    }
)