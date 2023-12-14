import type {PrinterConf, TagData, Rotation} from '../../types.js'

export class Printer {
    ip:string
    port:number
    fetching:boolean = false
    eposURL:string
    w:number = 300
    h:number = 512
    template:HTMLImageElement
    
    constructor(conf:PrinterConf) {
        this.ip = conf.ip
        this.port = conf.port
        this.eposURL = `http://${this.ip}/cgi-bin/epos/service.cgi?devid=local_printer&timeout=3000`

        this.template = document.createElement('img')
        this.template.src = './tagTemplate.png' 
    }

    async createTagCanvas(data:TagData, rotation:Rotation=90):Promise<HTMLCanvasElement> {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext("2d"); if (!ctx) { return canvas }

        if (rotation==90 || rotation==270)  { 
            canvas.width = this.h; canvas.height = this.w 
            // rotate
            ctx.translate(canvas.width/2, canvas.height/2)
            ctx.rotate(rotation * Math.PI/180)
            ctx.translate(-canvas.height/2, -canvas.width/2)
        } else {
            canvas.width = this.w; canvas.height = this.h
            // rotate
            ctx.translate(canvas.width/2, canvas.height/2)
            ctx.rotate(rotation * Math.PI/180)
            ctx.translate(-canvas.width/2, -canvas.height/2)
        }

        ctx.drawImage(this.template,0,0,this.w,this.h)
        
        ctx.font = 'bold 16px Arial'
        // client
        ctx.fillText(data.client.toUpperCase(), 70, 124, 150)
        // id
        ctx.fillText(data.id.toString(), 245, 124, 45)
        // shop
        ctx.fillText(data.shop.toUpperCase(), 70, 187, 215)
        // ip
        const ip = data.ip==0? 'DHCP' : data.ip.map(e=>e.toString()).join('.')
        ctx.fillText(ip, 70, 250, 150)
        // subnet
        ctx.fillText(data.subnet.toString(), 245, 250, 45)
        // router
        const router = data.router==0? '' : data.router.map(e=>e.toString()).join('.')
        ctx.fillText(router, 70, 316, 215)
        // deviceType
        let type
        switch (data.deviceType) {
            case 'canal': type = 'TV publi + hilo musical'; break
            case 'turnos': type = 'TV turnos + hilo musical'; break
            case 'totem': type = 'Dispensador de turnos'; break
            case 'tablet': type = 'Tablet / pasaturnos'; break
            case 'LED': type = 'Pantalla LED'; break
            default: type = 'Otro'; break
        }
        ctx.fillText(type.toUpperCase(), 70, 376, 215)
        // notes
        ctx.fillText(data.notes?.toString().toUpperCase() || '', 20, 436, 265)

        return canvas
    }

    async printCanvas(canvas:HTMLCanvasElement) {
        const ctx = canvas.getContext("2d"); if (!ctx) { return }
        const imageData = ctx.getImageData(0,0,canvas.width,canvas.height)
        const raster = this.toMonoImage( imageData )
        let printData = '<?xml version="1.0" encoding="utf-8"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">'
        printData += `<image width="${canvas.width}" height="${canvas.height}" color="color_1" mode="mono">${btoa(raster)}</image>`
        printData += '<cut type="feed" />'
        printData += '</epos-print></s:Body></s:Envelope>'

        // Send to printer
        navigator.sendBeacon(this.eposURL, new Blob([printData], {type:'text/plain'}))
    }

    toMonoImage(imgdata:ImageData) {
        let m8 = [
            [2, 130, 34, 162, 10, 138, 42, 170],
            [194, 66, 226, 98, 202, 74, 234, 106],
            [50, 178, 18, 146, 58, 186, 26, 154],
            [242, 114, 210, 82, 250, 122, 218, 90],
            [14, 142, 46, 174, 6, 134, 38, 166],
            [206, 78, 238, 110, 198, 70, 230, 102],
            [62, 190, 30, 158, 54, 182, 22, 150],
            [254, 126, 222, 94, 246, 118, 214, 86]
        ]
        const d = imgdata.data, w = imgdata.width, h = imgdata.height
        let r = new Array((w + 7 >> 3) * h), n=0, p=0, q=0, t, b, v, i, j
        for (j = 0; j < h; j++) {
            i = 0
            while (i < w) {
                b = i & 7
                t = m8[j & 7][b]
                v = Math.pow(((d[p++] * 0.29891 + d[p++] * 0.58661 + d[p++] * 0.11448) * d[p] / 255 + 255 - d[p++]) / 255, 1) * 255 | 0
                if (v < t) { n |= 128 >> b }
                i++
                if (b == 7 || i == w) {
                    r[q++] = String.fromCharCode(n == 16 ? 32 : n)
                    n = 0
                }
            }
        }
        return r.join('')
    }
}