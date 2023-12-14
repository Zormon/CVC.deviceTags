import { AppConf } from "../types"

export function sleep(ms:number) {return new Promise(r=>setTimeout(r,ms))}

export const DEFAULT_CONFIG:AppConf = { 
    printer: {
      ip: '127.0.0.1',
      port: 8008,
      enabled: true,
      previewDelay: 5000
    },
    debug: {
      autoOpenDevTools: false
    }
}


export const i18n = {
  actions: {
    accept: 'Aceptar',
    cancel: 'Cancelar',
    save: 'Guardar',
    restart: 'Reiniciar',
    refresh: 'Refrescar',
    exit: 'Salir',
    settings: 'Ajustes',
    about: 'Información',
    help: 'Ayuda',
    openDevTools: 'Consola Web'
  },

  aboutMessage: 'Impresora de etiquetas \nComunicacion Visual Canarias 2024\nContacto: 928 67 29 81'
}