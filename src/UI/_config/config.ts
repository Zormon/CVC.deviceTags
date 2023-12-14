import {$} from '../exports.web.js'
import {AppConf} from '../../types'

var CONF:AppConf = window.ipc.get.appConf()

function savePreferences() {
    CONF.printer.ip = (<HTMLInputElement>$('printerIp')).value
    CONF.printer.port = parseInt( (<HTMLInputElement>$('printerPort')).value )
    CONF.printer.enabled = (<HTMLInputElement>$('printerEnabled')).checked
    CONF.printer.previewDelay = parseInt( (<HTMLInputElement>$('printerPreviewDelay')).value )
    CONF.debug.autoOpenDevTools = (<HTMLInputElement>$('autoOpenDevTools')).checked

    window.ipc.save.appConf( CONF )
}

let el:HTMLElement|null

if (el = $('save')) {
    el.onclick = (e)=> {
        e.preventDefault()
        const form = <HTMLFormElement|null>$('config')
        if (form) {
            if ( form.checkValidity() )     { savePreferences() }
            else                            { form.reportValidity() }
        }
    }
}


// Initialization
if (el = $('printerIp'))    { (<HTMLInputElement>el).value = CONF.printer.ip }
if (el = $('printerPort'))    { (<HTMLInputElement>el).value =  CONF.printer.port.toString() }
if (el = $('printerEnabled'))    { (<HTMLInputElement>el).checked =  CONF.printer.enabled }
if (el = $('printerPreviewDelay'))    { (<HTMLInputElement>el).value =  CONF.printer.previewDelay.toString() }

if (el = $('autoOpenDevTools'))  { (<HTMLInputElement>el).checked = CONF.debug.autoOpenDevTools }