import type {AppConf, TagData, DeviceType} from '../../types'

import {$} from '../exports.web.js'
import {Printer} from './printer.class.js'


var CONF:AppConf = window.ipc.get.appConf()

const printer = new Printer({
    ip: CONF.printer.ip,
    port: CONF.printer.port
})

function printTag() {
    const form = $<HTMLFormElement>('tagData')
    if (!form) { return }
    if ( !form.checkValidity() ) { form.reportValidity(); return}

    const data:TagData = {
        id: parseInt( $<HTMLInputElement>('id')?.value || '' ),
        client: $<HTMLInputElement>('client')?.value || '',
        shop: $<HTMLInputElement>('shop')?.value || '',
        ip: $<HTMLInputElement>('ip')?.value.split('.').map( Number ) as [number, number, number, number],
        subnet: parseInt( $<HTMLInputElement>('subnet')?.value || '' ),
        router: $<HTMLInputElement>('router')?.value.split('.').map( Number ) as [number, number, number, number],
        deviceType: $<HTMLInputElement>('deviceType')?.value as DeviceType,
        notes: $<HTMLInputElement>('notes')?.value || ''
    }

    const print = CONF.printer.enabled
    printer.createTagCanvas(data, print?90:0).then( (canvas)=> {
        if (print) {
            printer.printCanvas(canvas)
        } else {
            let printPage = '<!DOCTYPE html><html><head><title></title><style>body, html { margin:0; padding:0; overflow:hidden; } img{border: 2px solid green;}</style>'
            printPage += `</head><body><img width="${canvas.width}" height="${canvas.height}" src="${canvas.toDataURL("image/png")}"></body></html>`
            window.ipc.printer.printPreview(printPage, canvas.width, canvas.height, CONF.printer.previewDelay*1000)
        }
    })
}


document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'p') {
        printTag()
    }
})

let el:HTMLElement|null
if (el = $('print')) {
    el.onclick = ()=> { printTag() }
}