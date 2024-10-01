/* eslint-disable no-undef */
import { Keyboard } from './vk.js'

window.keyboard = new Keyboard(56)
const bgColors = {
  danger: '#FF0000',
  success: '#00FF00',
  normal: '#000000',
  info: '#0000FF',
  error: '#ffa600',
}

function showSpinner(state) {
  if (state.spinner === true) {
    return `<div class="spinner-container BF-col">
      <div class="spinner"></div>
    </div>`
  } else {
    return ""
  }
}

// show device off in step 'INIT'
function showDevicesOff(state) {
  // error
  if (state.currentStep === "INIT") {
    let mainContent = `<div class="BF-col devices-off">
      <div class="BF-ligne">`
    state.devices.forEach((device) => {
      // network off
      if (device.name === "network" && device.status === "off") {
        mainContent += alertNetwork
      }

      // nfc off
      if (device.name === "nfc" && device.status === "off") {
        mainContent += alertNfc
      }
    })
    mainContent += "</div></div>"
    return mainContent
  } else {
    return ""
  }
}

// dev
function mockServersList(nb) {
  let servers = []
  for (let i = 0; i < nb; i++) {
    servers.push( {server: `https://server${i}.test.tibillet.re/` })
  }
  return servers
}

function showListServer(state) {
  if (state.currentStep === "LIST_SERVERS") {
    let content = `<div class="BF-col h100">
      <div class="servers-list-content hide-scroll-bar">`
    // dev --- state.configuration.servers = mockServersList(10)
    state.configuration.servers.forEach(item => {
      const url = new URL(item.server)
      content += `<div class="BF-ligne servers-list-item">
        <div class="bt bt-delete-server" onclick="ma.run('CONFIRM_DELETE_SERVER', '${item.server}')">Delete</div> 
        <div class="bt bt-go-server" onclick="ma.run('GO_SERVER','${item.server}')">${url.hostname}</div>
      </div>`
    })
    // no servers
    if (state.configuration.servers.length < 1) {
      content += '<div class="BF-col h100 tibillet-font-size2 c-white">No place</div>'
    }
    // bt "Add place"
    content += `</div>
      <div class="BF-ligne servers-list-footer">
        <button class="action bgc-success c-black" type="button" onclick="ma.run('GET_PIN_CODE')">
          Add a place
        </button>
      </div>
    </div>`
    return content
  } else {
    return ''
  }
}

// bt "Return"
function showBtReturn(state) {
  if (state.configuration.servers.length >= 1) {
    return `<button class="action bgc-info" type="button" onclick="ma.run('LIST_SERVERS')">
    Return
  </button>`
  } else {
    return ''
  }
}

// enter code pin off in step 'GET_PIN_CODE'
function getPinCode(state) {
  if (state.currentStep === "GET_PIN_CODE") {
    return `<div class="BF-col h100">
      <div id="field-pin" class="ligne BF-col">
        <div class="label" for="pin">PIN code :</div>
        <input type="number" id="pin-code" class="entree keyboard-use" value="${state.pinCode}"/>
      </div >
      <div id="retour-pin-code" class="info-danger">${state.errorValuePinCode}</div>
      <div class="ligne BF-ligne" style="margin-top: 3rem;">
        ${showBtReturn(state)}
        <button class="action bgc-success c-black" type="button" onclick="ma.run('CHECK_PIN_CODE')">
          validate
        </button>
      </div>
    </div>`
  } else {
    return ""
  }
}

function showInfos(state) {
  return `<!-- <div class="log-msg" style="color:var(--info-color);"> current step = ${state.currentStep}</div> -->
  <div class="log-msg" style="color:var(--info-color);">tagId = <span id="rep-tag-id"></span></div>
  <div class="log-msg" style="color:var(--info-color);">version = ${state.configuration.version}</div>
  <div class="log-msg" style="color:var(--info-color);">ip = ${state.ip}</div>
  <div class="log-msg" style="color:var(--info-color);"> manufacturer = ${piDevice.manufacturer}</div>
  <div class="log-msg" style="color:var(--info-color);">model = ${piDevice.model}</div>
  <div class="log-msg bar-bottom" style="color:var(--info-color);">uuid = ${piDevice.uuid}</div>`
}

function showLOgs(state) {
  // console.log('-> showLOgs, state.logs =', state.logs);
  let content = ""
  for (let i = state.logs.length - 1; i > 0; i--) {
    const item = state.logs[i]
    content += `<div class="log-msg" style="color:var(--${item.typeMsg}-color);">${item.msg}</div>`
  }
  return content
}

function confirmDeleteServer(state) {
  if (state.currentStep === "CONFIRM_DELETE_SERVER") {
    const url = new URL(state.params)
    return `<div id="modal-confirm" class="BF-col">
      <div>
        <div id="modal-confirm-infos" class="BF-col">
          <div class="tibillet-font-size2 c-white">Delete</div>
          <div class="tibillet-font-size2 c-white">${url.hostname}</div>
        </div>
        <div class="ligne BF-ligne mt-2r">
          <button class="action bgc-info" type="button" onclick="ma.run('LIST_SERVERS')">
            Cancel
          </button>
          <button class="action bgc-success c-black" type="button" onclick="ma.run('DELETE_SERVER', '${state.params}')">
            validate
          </button>
        </div>
      </div>
    </div>`
  } else {
    return ""
  }
}

export const render = function (state) {
  // console.log('-> render =', state.currentStep);
  const template = `<section id="app-header" class="BF-col">
    <!-- show spinner -->
    ${showSpinner(state)}
    <div class="tibillet-font tibillet-font-size1">LaBoutik</div>
      <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 17.518 11.822" style="height:84px;fill:var(--ifm-font-color-base)">
        <g style="stroke-width:0.575231;stroke:none">
          <path d="M1278.635 53.267c-1.275 0-2.156.542-2.156.542-.039 0-.045.003-.045.038l-.01 3.673v.97l.01-.004s.515.062.704.219c.501.42.59 1.113.605 1.307v.055h.856a.45.45 0 0 1 .9 0h.857a.45.45 0 1 1 .9 0h.857a.45.45 0 0 1 .45-.45l.02.002.013-.001a.45.45 0 0 1 .416.28v-.013a.44.44 0 0 1 .041.182h.788c0-.25.203-.453.45-.454.243 0 .442.197.45.444q.427-.031.783-.241.43-.26.681-.69t.251-.95q0-.377-.143-.717a1.9 1.9 0 0 0-.404-.6q.243-.207.413-.538.18-.331.179-.717 0-.475-.233-.879a1.8 1.8 0 0 0-.636-.645 1.7 1.7 0 0 0-.914-.25h-1.721a27 27 0 0 1-1.53-.093c-.95-.107-.997-.47-2.83-.47zm3.282 1.22c.034.01.162.028.197.063q.07.066.07.203 0 .143-.085.254-.081.112-.264.112a.26.26 0 0 1-.184-.066q-.07-.07-.07-.204a.43.43 0 0 1 .08-.259c.04-.05.193-.087.256-.103zm-2.046.322s.163.015.194.046q.046.045.015.137l-.25.986h.641q.062 0 .086.05.026.047 0 .153a.3.3 0 0 1-.066.153.14.14 0 0 1-.106.05h-.66l-.26.987q-.056.209-.056.37c0 .11.02.199.046.27a.4.4 0 0 0 .122.163q.081.05.183.05h.01q.117 0 .264-.116.147-.117.34-.371.189-.26.448-.687.23-.379.523-.904l.021-.087q.03-.096.076-.127a.3.3 0 0 1 .153-.03q.147 0 .193.045.046.046.015.137l-.483 1.906a.5.5 0 0 0-.015.168q.015.05.081.05.047 0 .086-.03a.6.6 0 0 0 .091-.086q.056-.06.127-.157.036-.051.076-.056.046-.01.102.025.081.046.101.097.02.045-.01.096a1.4 1.4 0 0 1-.203.28.68.68 0 0 1-.483.218q-.27 0-.355-.203-.081-.208.03-.605l.144-.593-.077.136q-.28.477-.498.757-.219.28-.418.401a.84.84 0 0 1-.422.118l-.01-.001h-.01a.67.67 0 0 1-.38-.101.7.7 0 0 1-.224-.28 1.1 1.1 0 0 1-.081-.406c0-.153.015-.31.056-.473l.249-.96h-.386q-.062 0-.086-.051-.021-.051 0-.153a.3.3 0 0 1 .066-.152.15.15 0 0 1 .106-.051h.407l.26-1.012q.02-.096.07-.127a.3.3 0 0 1 .152-.03zm4.165.087h.682q.286 0 .493.215a.67.67 0 0 1 .205.493.72.72 0 0 1-.197.484.63.63 0 0 1-.501.215h-.682zm0 2.491h.547q.322 0 .556.233c.155.156.251.273.259.445a.49.49 0 0 1-.184.391c-.168.135-.416.14-.631.14h-.556z" style="fill-opacity:1;stroke:none;stroke-width:0.497575;stroke-linejoin:round;stroke-dasharray:none" transform="matrix(1.73843 0 0 1.73843 -2218.972 -92.601)"></path>
        </g>
      </svg>
  </section>
  <section id="app-main">
    <!-- devices off --> 
    ${showDevicesOff(state)}
    <!-- servers list -->
    ${showListServer(state)}
    <!-- enter pin code --> 
    ${getPinCode(state)}

  </section>
  <section id="app-infos-container">
    <div id="logs-led"></div>
    <div id="app-infos-container-scroll">
      <!-- infos devices -->
      <div id="app-infos-devices">
      ${showInfos(state)}
      </div>
      <!-- infos logs -->
      <div id="app-infos-logs">
        ${showLOgs(state)}
      </div>
    </div>
  </section>
  <!-- confirm delete server -->
  ${confirmDeleteServer(state)}
  <div class="keyboard keyboard-hidden"></div>`
  document.querySelector(state.idApp).innerHTML = template
  // activer le clavier virtuel
  if (state.currentStep === "GET_PIN_CODE") {
    keyboard.run()
  }
  // logs led
  const lastLog = (state.logs.length) - 1
  if (lastLog >= 0) {
    document.querySelector('#logs-led').style.background = bgColors[state.logs[lastLog].typeMsg]
  }
}

const alertNetwork = `<div id="alert-network" class="devices-off-item BF-col">
  <div class="message-icon">
    <div class="BF-ligne">No connection.</div>
    <div class="BF-ligne">Activate wifi or rj45 network</div>
    <div class="BF-ligne">and restart pi.</div>
  </div>
  <svg xmlns="http://www.w3.org/2000/svg" width="100px" height="100px" style="color:#FF0000;" viewBox="0 0 24 24">
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
      <path d="M6.528 6.536a6 6 0 0 0 7.942 7.933m2.247-1.76A6 6 0 0 0 8.29 4.284"/>
      <path d="M12 3q2 .5 2 6q0 .506-.017.968m-.55 3.473Q12.934 14.766 12 15m0-12q-1.405.351-1.822 3.167m-.16 3.838Q10.192 14.549 12 15M6 9h3m4 0h5M3 20h7m4 0h7m-11 0a2 2 0 1 0 4 0a2 2 0 0 0-4 0m2-5v3M3 3l18 18"/>
    </g>
  </svg>
</div>`

const alertNfc = `
<div  id="alert-nfc" class="devices-off-item BF-col" onclick="nfc.showSettings()">
  <div class="message-icon">
    <div class="BF-ligne">NFC error, </div>
    <div class="BF-ligne">resolve the problem</div>
    <div class="BF-ligne">and restart application.</div>
  </div>
  <span>
    <svg version="1.1" width="134.39999" height="106.56" viewBox="0 0 84.480003 49.919998">
      <path
         style="fill:#ff0000;stroke-width:0.31197804"
         d="m 67.026441,48.808099 c -3.217794,-1.01314 -6.155593,-3.158105 -7.581157,-5.535201 -0.607787,-1.013467 -1.021555,-1.046548 -2.83539,-0.226691 -2.370349,1.071401 -3.997787,0.84986 -7.980097,-1.086329 -3.963681,-1.927132 -4.863684,-2.708172 -5.089504,-4.416767 -0.125397,-0.948767 0.01378,-1.449635 0.66844,-2.40563 l 0.826809,-1.207378 -1.736865,-1.542038 c -1.623677,-1.441547 -1.736861,-1.633894 -1.736861,-2.95162 0,-1.001904 -0.113009,-1.365216 -0.390731,-1.256176 -0.214902,0.08437 -7.618927,4.517288 -16.45339,9.850916 -8.834463,5.333631 -16.0958889,9.658262 -16.1365049,9.610298 -0.248585,-0.293577 -1.119431,-2.182796 -1.036009,-2.247527 0.05566,-0.04319 6.9936869,-4.186466 15.4178449,-9.207286 8.424158,-5.020818 15.561442,-9.293316 15.860629,-9.494438 0.449738,-0.302325 -0.173019,-0.509422 -3.594724,-1.195417 -2.276286,-0.456358 -5.259614,-0.972416 -6.629616,-1.146797 -4.835209,-0.615447 -6.105843,-1.313262 -6.104281,-3.352386 7.5e-4,-0.975683 1.066569,-6.537564 2.499678,-13.0443102 0.21258,-0.9651823 0.677924,-1.9348008 1.158123,-2.4131372 0.694208,-0.6915167 1.072449,-0.7996377 2.797379,-0.7996377 1.097045,0 3.293308,0.2729735 4.880585,0.6066079 1.587274,0.3336345 5.136564,0.9740365 7.887309,1.4231161 7.747887,1.2648998 10.545524,1.9367185 11.174903,2.6835203 0.357538,0.4242401 0.547024,1.1764228 0.547024,2.1714468 v 1.522367 l 3.985455,-8.72e-4 3.985455,-8.71e-4 9.374393,-5.5998918 9.374393,-5.5998912 0.773244,0.7702445 c 0.487629,0.4857383 0.66198,0.8755068 0.472025,1.0552217 -0.16567,0.1567376 -4.102093,2.5756775 -8.747608,5.3754223 l -8.446389,5.0904415 1.905654,1.868235 c 1.745989,1.711708 3.624598,4.397797 10.888454,15.568627 6.788252,10.439412 7.094588,11.053725 5.512141,11.053725 -0.715713,0 -1.025916,-0.412033 -4.922869,-6.538823 C 71.900212,27.236794 66.504534,19.280158 65.148451,17.83602 62.717296,15.246994 62.50952,15.242536 58.460742,17.692507 l -3.478568,2.104928 3.370679,1.950497 c 1.853872,1.072772 3.565514,2.068768 3.80365,2.213323 0.544197,0.330343 0.18364,1.641252 -0.451413,1.641252 -0.244854,0 -2.227829,-1.004177 -4.406607,-2.231503 -2.178778,-1.227327 -4.114074,-2.22988 -4.300662,-2.227895 -0.524586,0.0056 -6.779034,3.901825 -6.679238,4.160872 0.04856,0.12606 1.916916,1.730319 4.151897,3.56502 6.789534,5.573547 7.217156,6.049087 9.242461,10.278211 0.984157,2.055059 2.173773,4.189122 2.643588,4.742363 1.102014,1.297704 2.97309,2.379748 5.260416,3.042116 1.612137,0.466841 1.80111,0.604751 1.641376,1.197828 -0.09928,0.368631 -0.182437,0.77533 -0.184784,0.903771 -0.0057,0.310657 -0.527553,0.253249 -2.047096,-0.225191 z M 55.880018,41.14255 c 1.06491,-0.358234 1.936203,-0.713028 1.936203,-0.788433 0,-0.07541 -0.211895,-0.642271 -0.470878,-1.259701 l -0.470878,-1.122598 -2.038793,0.208072 c -2.549256,0.260164 -3.860383,-0.08994 -6.224533,-1.662125 -1.967612,-1.308484 -2.445951,-1.288018 -2.983753,0.127656 -0.323981,0.852831 0.122468,1.606461 1.335781,2.254879 2.103848,1.124332 6.027984,2.863466 6.494319,2.878206 0.267479,0.0085 1.357618,-0.277725 2.422532,-0.635956 z m -0.480674,-5.245877 c 0.132054,-0.119331 -0.360267,-0.693804 -1.094047,-1.276606 -0.733777,-0.582805 -1.82646,-1.501142 -2.428186,-2.040751 -2.791244,-2.503101 -6.282477,-5.108574 -6.845289,-5.108574 -0.687177,0 -1.594498,1.08881 -1.594498,1.913441 0,0.840468 5.748133,5.391007 8.222128,6.509093 1.258432,0.568728 3.112434,0.570412 3.739892,0.0034 z M 39.754385,22.606164 c -1.251967,-1.130432 -2.482769,-2.45304 -2.735116,-2.939129 -1.514488,-2.917343 0.875822,-6.573679 4.342727,-6.642847 1.040863,-0.02076 2.026881,0.381034 5.042517,2.054817 2.641303,1.466013 3.811817,1.968195 3.962483,1.700012 0.416025,-0.740507 1.245337,-5.887865 0.98889,-6.137791 C 51.212756,10.501738 47.860398,9.8226095 43.906201,9.1320515 39.952005,8.4414932 35.009543,7.5290764 32.922953,7.1044583 27.99558,6.1017444 27.493794,6.2190216 26.965092,8.4969228 25.725495,13.837697 24.369657,20.295454 24.369657,20.858789 c 0,0.541708 0.303409,0.715951 1.797362,1.032199 2.708302,0.573309 14.523561,2.693629 15.238505,2.734643 0.43684,0.02506 -0.06055,-0.583292 -1.651139,-2.019467 z m 7.570474,-0.972415 c 1.64413,-0.984032 2.989329,-1.862435 2.989329,-1.952005 0,-0.396251 -7.775267,-4.43857 -8.81543,-4.583095 -0.985936,-0.13699 -1.298055,-0.02037 -2.109947,0.788375 -0.984219,0.980402 -1.18096,1.858893 -0.64127,2.863402 0.368384,0.685664 4.895042,4.672473 5.305166,4.672473 0.155551,0 1.628022,-0.805117 3.272152,-1.78915 z m 8.303269,-5.022691 2.65697,-1.594028 -2.709216,-5.91e-4 -2.709212,-5.98e-4 -0.338489,1.572188 c -0.186166,0.864704 -0.338485,1.650342 -0.338485,1.745863 0,0.278872 0.618396,-0.03098 3.438432,-1.722834 z M 6.8775011,36.778586 C 4.8181151,34.056172 4.2398641,33.047558 3.0121401,30.036441 -0.11447485,22.368099 0.67084515,12.959847 5.0298781,5.8636091 c 1.288487,-2.0975768 3.780956,-5.16827782 4.196249,-5.16974302 0.380444,-0.00134 2.3275569,1.92752222 2.3275569,2.30574312 0,0.1393351 -0.53672,0.9033114 -1.192711,1.6977255 -3.7535049,4.5455414 -5.5040239,9.5586983 -5.4514169,15.6118393 0.04626,5.323327 1.469716,9.545999 4.70085,13.945074 0.8109199,1.10404 1.6116429,2.196961 1.7793839,2.428712 0.222088,0.306842 0.01426,0.720152 -0.764635,1.520653 -0.588289,0.604608 -1.2425299,1.099286 -1.4538689,1.099286 -0.211339,0 -1.243542,-1.13594 -2.293785,-2.524313 z M 11.066275,33.62035 C 7.9081841,29.462535 6.4186911,25.096678 6.4186911,19.997801 c 0,-3.743724 0.546953,-6.183778 2.12878,-9.496862 1.157049,-2.4234035 3.7876859,-6.0717646 4.3780219,-6.0717646 0.403596,0 2.379208,1.8944235 2.379208,2.2814344 0,0.1253262 -0.559733,0.9332342 -1.24385,1.7953516 -2.340142,2.9490206 -4.0700899,7.8335056 -4.0700899,11.4918406 0,3.658335 1.7299479,8.54282 4.0700899,11.491841 0.684117,0.862117 1.24385,1.68424 1.24385,1.826939 0,0.381114 -2.002519,2.249847 -2.410917,2.249847 -0.192145,0 -1.014523,-0.875735 -1.827509,-1.946078 z m 4.100819,-3.269412 c -3.481508,-4.761469 -4.440228,-10.42873 -2.656477,-15.703179 0.721814,-2.134365 3.143018,-6.084696 3.908788,-6.3774098 0.470557,-0.17987 2.636312,1.5726477 2.636312,2.1332898 0,0.136179 -0.480405,0.874521 -1.067566,1.640762 -1.799055,2.34775 -2.488209,4.550587 -2.488209,7.9534 0,3.402814 0.689154,5.605651 2.488209,7.953401 0.587161,0.76624 1.067566,1.504583 1.067566,1.640761 0,0.384522 -2.016112,2.237995 -2.434375,2.237995 -0.205047,0 -0.859459,-0.665559 -1.454248,-1.47902 z m 3.937544,-3.587799 c -1.425033,-2.063183 -1.963301,-3.606587 -2.142254,-6.142593 -0.130534,-1.849858 -0.03435,-2.702145 0.462712,-4.100108 0.713674,-2.007173 2.404725,-4.618323 2.99095,-4.618323 0.215898,0 0.873869,0.494678 1.462159,1.099285 0.911381,0.93666 1.011965,1.178493 0.679914,1.634706 -2.514316,3.454482 -2.514316,7.268908 0,10.72339 0.332051,0.456213 0.231467,0.698046 -0.679914,1.634706 -0.58829,0.604607 -1.246261,1.099285 -1.462159,1.099285 -0.215897,0 -0.806031,-0.598657 -1.311408,-1.330348 z"
         id="path3779"/>
    </svg>
  </span>
</div>
`