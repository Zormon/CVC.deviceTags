import { App } from "electron"

export type Rotation = 0 | 90 | 180 | 270

export type AppConf = {
    printer: {
        ip: string
        port: number
        enabled: boolean
        previewDelay: number
    }
    debug: {
        autoOpenDevTools: boolean
    }
}

export type PrinterConf = {
    ip: string
    port: number
}

type DeviceType = 'canal' | 'canal+m' | 'turnos' | 'turnos+m' | 'totem' | 'tablet' | 'LED' | 'otro'
export type TagData = {
    id:number
    client:string
    shop:string
    ip:[number,number,number,number]|0
    subnet:number
    router:[number,number,number,number]|0
    deviceType:DeviceType
    notes?:string
}


export type WindowOptions = {
    width?: number
    height?: number
    icon?: string
    autoHideMenuBar: boolean
    resizable: boolean
    show: boolean
    fullscreen: boolean
    frame: boolean
    alwaysOnTop: boolean
    webPreferences: {
        contextIsolation: boolean
        preload: string
        parent?: BrowserWindow
    }
}


declare global {
    interface Window {
        ipc: {
            get: {
                appConf: () => AppConf
            },
            save: {
                appConf: (data:AppConf) => void
            },
            printer: {
                printPreview: (page:string,width:number,height:number, delay?:number) => void
            }
        }

    }
}