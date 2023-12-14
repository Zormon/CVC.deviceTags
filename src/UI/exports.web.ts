
// Nombres de iconos de tipografia CVC Icons
const iconNames:string[] = [
    'ninguno',        // 0
    'carne',        // 1
    'pescado',      // 2
    'embutido',     // 3
    'fruta',        // 4
    'verdura',      // 5
    'pan',          // 6
    'comidas'       // 7
]

// Alias de selectores generales
function getById<T=HTMLElement>(id:string) { return document.getElementById(id) as T|null }
function querySel<T=HTMLElement>(sel:string) { return document.querySelector(sel) as T|null }
function querySelAll<T=HTMLElement>(sel:string) { return document.querySelectorAll(sel) as T|null }

// Otras funciones
function sleep(ms:number) { return new Promise(resolve => setTimeout(resolve, ms)) }
function isFunction(f:number) {return f && {}.toString.call(f)==='[object Function]'}

/**
 * Muestra un modal con multiples funciones
 * @param id Identificador del modal
 * @param template Id del template html para el contenido
 * @param tplvars Selectores para rellenar texto en plantillas
 * @param type Tipo de modal, para estilos CSS
 * @param accion Accion a realizar al pulsar el boton de aceptaar
 * @param buttons Textos alternativos para botones del modal
 */
function modalBox(
    id:number,
    template:string,
    tplvars:[string,string][]=[],
    type: string='',
    accion:Function|boolean=false,
    buttons: string[]=['Cancelar','Aceptar']
  ) {
    if ( template ) { // Añadir
      const templateEl = getById(template) as HTMLTemplateElement
      if (!!!templateEl) { return }

      if (!document.contains( getById(id as unknown as string) )) {
        // Modal Fullscreen Wrapper
        let modal = document.createElement('div')
        modal.id = id as unknown as string
        modal.className = 'modalBox ' + type
  
        // Modal
        let modalBox = document.createElement('div')
        let content = templateEl.content.cloneNode(true) as DocumentFragment
  
        // Template vars
        tplvars.forEach(item => {
          const el = content.querySelector(`[data-tpl="${item[0]}"]`)
          if (el) { el.innerHTML = item[1] }
        })
  
        modalBox.appendChild(content)
  
        // Botones
        if (typeof accion == 'function') { 
          let btnCancel = document.createElement('button')
          btnCancel.appendChild( document.createTextNode(buttons[0]) )
          btnCancel.id = 'cancel'
          btnCancel.onclick = ()=> { modal.remove() }
      
          let btnOk = document.createElement('button')
          btnOk.appendChild( document.createTextNode(buttons[1]) )
          btnOk.id = 'ok'
          btnOk.onclick = ()=> { accion(); modal.remove() }
  
          modalBox.appendChild(btnOk)
          modalBox.appendChild(btnCancel)
        }
  
        modal.appendChild(modalBox)
        document.body.appendChild(modal)
      } else {
        tplvars.forEach(item => {
          const elId = getById(id as unknown as string)
          if (elId) { 
            const el = elId.querySelector(`[data-tpl="${item[0]}"]`)
            if (el) { el.innerHTML = item[1] }
          }
        })
    }
    } else { // Si template es falso, es que se quiere destruir el modal
      const modal = getById(id as unknown as string)
      if (modal) { modal.remove() }
    }
  }

function renderHtmlToCanvas(canvas: HTMLCanvasElement, html: string): void {
  const ctx = canvas.getContext( '2d' );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
    <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">${html}</div>
    </foreignObject>
    </svg>`;

  const svgBlob = new Blob( [svg], { type: 'image/svg+xml;charset=utf-8' } );
  const svgObjectUrl = URL.createObjectURL( svgBlob );

  const tempImg = new Image();
  tempImg.addEventListener( 'load', function() {
      if (ctx) { ctx.drawImage( tempImg, 0, 0 ); }
      URL.revokeObjectURL( svgObjectUrl );
  } );

  tempImg.src = svgObjectUrl;
}


export { 
    iconNames,
    sleep,
    modalBox,
    isFunction,
    renderHtmlToCanvas,
    getById as $,
    querySel as $$,
    querySelAll as $$$
}