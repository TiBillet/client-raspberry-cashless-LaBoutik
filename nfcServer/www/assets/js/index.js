import { Keyboard } from '../virtualKeyboard/vk.js'
// branche multiServeur

// initialisation
window.store = {}
window.keyboard = new Keyboard(90)

let socket = io(location.origin)
let configuration
let devicesStatus = [
  { name: 'network', status: 'off', method: 'networkTest' },
  { name: 'nfc', status: 'off', method: 'nfcTest' }
]
// let pinCodeLimit = 6, proprioLimit = 3, step = 0
const urlLogin = 'wv/login_hardware'

function showNoNetwork() {
  let frag = `
  <div id="alert-network" class="ligne-alerte BF-col">
    <div class="message-icon">
      <div class="BF-ligne">- Aucune connexion</div>
    </div>
    <span>
      <svg xmlns="http://www.w3.org/2000/svg" width="134.39999" height="106.56" fill="#ff0000" class="bi bi-router-fill" viewBox="0 0 16 16">
        <path d="M5.525 3.025a3.5 3.5 0 0 1 4.95 0 .5.5 0 1 0 .707-.707 4.5 4.5 0 0 0-6.364 0 .5.5 0 0 0 .707.707"/>
        <path d="M6.94 4.44a1.5 1.5 0 0 1 2.12 0 .5.5 0 0 0 .708-.708 2.5 2.5 0 0 0-3.536 0 .5.5 0 0 0 .707.707Z"/>
        <path d="M2.974 2.342a.5.5 0 1 0-.948.316L3.806 8H1.5A1.5 1.5 0 0 0 0 9.5v2A1.5 1.5 0 0 0 1.5 13H2a.5.5 0 0 0 .5.5h2A.5.5 0 0 0 5 13h6a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5h.5a1.5 1.5 0 0 0 1.5-1.5v-2A1.5 1.5 0 0 0 14.5 8h-2.306l1.78-5.342a.5.5 0 1 0-.948-.316L11.14 8H4.86zM2.5 11a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m4.5-.5a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0m2.5.5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m1.5-.5a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0m2 0a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0"/>
        <path d="M8.5 5.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"/>
      </svg>

    </span>
  </div>
`
  document.querySelector('#affichage-alertes').insertAdjacentHTML('beforeend', frag)
}

function showNoNfc() {
  // insérez l'icon pas de nfc + message
  let frag = `
  <div  id="alert-nfc" class="ligne-alerte BF-col">
    <div class="message-icon">
      <div class="BF-ligne">- no NFC </div>
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
  document.querySelector('#affichage-alertes').insertAdjacentHTML('beforeend', frag)
}

/**
 * insert/affiche des messages dans l'élément #app-log
 * const response = await fetch('/config_file')
 * @param {string} message - votre message
 * @param {string} typeMessage - '' ou 'danger', modifie la couleur du message
 */
function afficherMessage(message, typeMessage) {
  let styleMessage = `style="color:#000;"`
  if (typeMessage === 'danger') {
    styleMessage = `style="color:#F00;"`
  }
  document.querySelector('#tag-id').insertAdjacentHTML('afterend', `<div ${styleMessage}>${message}</div>`)
}

function generatePassword(length) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let password = ""
  const array = new Uint32Array(length)
  window.crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length] // % operator returns remainder of division
  }
  return password
}


async function readFromFile() {
  try {
    const response = await fetch('/config_file')
    return await response.json()
  } catch (error) {
    createUuidPiFromMacAddress
    console.log('readFromFile,', error)
    return null
  }
}

async function writeToFile(configuration) {
  // console.log('-> writeToFile, configuration =', configuration)
  try {
    const response = await fetch('/write_config_file', {
      mode: 'cors',
      method: 'POST',
      body: JSON.stringify(configuration)
    })
    const retour = await response.json()
    if(retour.status === false) {
        console.log('writeToFile,', retour.msg)    
    }
    return retour.status
  } catch (error) {
    console.log('writeToFile,', error)
    return false
  }
}

window.showStep1 = function () {
  // console.log('-> showStep1, configuration.current_server =', configuration.current_server)
  // effache interface step2
  document.querySelector('#step-2').style.display = 'none'
  // affiche interface step1
  document.querySelector('#step-1').style.display = 'flex'
  // efface message
  document.querySelector('#retour-pin-code').innerText = ''
  // fichier de configuration présent
  if (configuration.current_server !== '') {
    // affichage du bouton annuler de l'interface #step-1 pour une futurecreateUuidPiFromMacAddress utilisation
    document.querySelector('#step1-bt-annuler').style.display = 'flex'
  }
}

window.showStep2 = function () {
  // effache interface step1
  document.querySelector('#step-1').style.display = 'none'
  // affiche interface step2
  document.querySelector('#step-2').style.display = 'flex'
  // affiche le serveur en cours
  document.querySelector('#info-server').innerText = configuration.current_server
}

window.hideModalConfirm = function () {
  document.querySelector('#modal-confirm').style.display = 'none'
}

window.confirmReset = function () {
  document.querySelector('#modal-confirm-infos').innerHTML = `<div>Confirmer la suppression</div>
  <div>de la configuration</div>
  <div>du serveur ${configuration.current_server}.</div>`
  document.querySelector('#modal-confirm-valider').setAttribute('onclick', 'reset(); hideModalConfirm()')
  document.querySelector('#modal-confirm').style.display = 'flex'
}

/**
 * Find specific server in configuration
 * @param {string} urlServer - server to find 
 * @param {object} configuration - app configuration 
 * @returns {undefined|object}
 */
function findDataServerFromConfiguration(urlServer, configuration) {
  if (urlServer === undefined) {
    return undefined
  }
  return configuration.servers.find(item => item.server === urlServer)
}

/**
 * Update configuration file
 * @param {object} retour 
 * @returns {boolean}
 */
async function updateConfigurationFile(options) {
  console.log('-> updateConfigurationFile, configuration =', JSON.stringify(configuration, null, 2))
  console.log('options =', JSON.stringify(options, null, 2))

  configuration['hostname'] = options.hostname
  configuration['uuidDevice'] = configuration.piDeviceUuid
  configuration['pin_code'] = options.pinCode
  configuration.client = {
    password: generatePassword(30),
    username: options.username
  }

  const testServerIn = findDataServerFromConfiguration(options.retour.server_url, configuration)
  const newServer = {
    server: options.retour.server_url,
    // locale: options.retour.locale,
    publicKeyPem: options.retour.server_public_pem
  }

  // serveur inéxistant dans le fichier de conf, ajouter le
  if (testServerIn === undefined) {
    configuration.servers.push(newServer)
  } else {
    const filterServers = configuration.servers.filter(item => item.server !== options.retour.server_url)
    configuration.servers = filterServers
    configuration.servers.push(newServer)
  }

  configuration.current_server = options.retour.server_url
  return await writeToFile(configuration)
}

/**
 * get pin code from "server pinCode"
 */
window.getUrlServerFromPinCode = async function () {
  console.log('-> getUrlServerFromPinCode, configuration =', configuration)
  const valueElement = document.querySelector('#pinCode').value
  let errorMsg = ''
  // validation nombre et taille = 6
  if (isNaN(valueElement) === true) {
    errorMsg += 'Un nombre'
  }
  if (valueElement.length != 6) {
    if (errorMsg !== '') {
      errorMsg += ' de '
    }
    errorMsg += '6 chiffres'
  }

  if (errorMsg === '') {
    const pinCode = parseInt(valueElement)
    const hostname = slugify('pi-' + configuration.piDevice.hostname + '-' + configuration.piDevice.uuid)
    // client/app
    let username
    if (window.crypto.randomUUID) {
      username = slugify(hostname + '-' + window.crypto.randomUUID())
    } else {
      username = slugify(hostname + '-' + (window.URL.createObjectURL(new Blob([])).substring(31)))
    }

    // console.log('pinCode =', pinCode)
    // curl -X POST https://discovery.filaos.re/pin_code/ -H "Content-Type: application/x-www-form-urlencoded" -d "pin_code=695610" -v
    try {
      let data = new URLSearchParams()
      data.append('pin_code', pinCode)
      data.append('hostname', hostname)
      data.append('username', username)
      const response = await fetch(configuration.server_pin_code + '/pin_code/', {
        mode: 'cors',                         
        method: 'POST',
        body: data,
        headers: {
            "Content-Type" : "application/x-www-form-urlencoded"
        }
      })
      const retour = await response.json()
      // console.log('-> getUrlServerFromPinCode, retour =', retour)
      if (response.status === 200) {
        const retourUpdate = await updateConfigurationFile({ retour, pinCode, hostname, username })
        // console.log('retourUpdate =', retourUpdate)
        if (retourUpdate === false) {
          afficherMessage('Erreur lors de mise à jour de la configuration.', 'danger')
        } else {
          afficherMessage('Mise à jour de la configuration.')
        }

        showStep2()
        // info
        document.querySelector('#info-server').innerText = configuration.current_server
      } else {
        throw new Error('No server from this pinCode')
      }
    } catch (err) {
      console.log('-> getUrlServerFromPinCode, error :', err)
      afficherMessage(err.message, 'danger')
      document.querySelector('#retour-pin-code').innerText = err.message
    }
  } else {
    document.querySelector('#retour-pin-code').innerText = errorMsg
  }
}


// supprime la configuration du serveur courant
window.reset = async function () {
  // supprime le serveur courrant
  const newServers = configuration.servers.filter(item => item.server !== configuration.current_server)
  configuration.servers = newServers
  configuration.client = null
  configuration.current_server = ''
  const retour = await writeToFile(configuration)
  // console.log('-> reset, retour =', retour)
  if (retour === true) {
    afficherMessage(`Reset: serveur supprimé.`)
  } else {
    afficherMessage(`Erreur, lors du reset.`, 'danger')
  }
  showStep1()
}

/**
 * Launches the app
 */
window.startApp = async function () {
  // console.log('-> startApp, configuration =', configuration)
  window.location = configuration.current_server + urlLogin
}

socket.on('tagIdChange', (retour) => {
  document.querySelector('#tag-id').innerHTML = retour
  // console.log('-> msg "tagIdChange", retour =', retour)
})

socket.on('returnIp', (retour) => {
  document.querySelector('#ip').innerHTML = retour
  // console.log('-> msg "returnIp", retour =', retour)
})

document.addEventListener('DOMContentLoaded', async function () {

  // efface le conteneur des alertes
  document.querySelector('#affichage-alertes').style.display = 'none'

  // affiche le conteneur d'informations
  document.querySelector('#app-log').style.display = 'block'

  // affiche l' interface principale
  document.querySelector('#entree-des-donnees').style.display = 'flex'
  //socket.emit('askConfigurationAppFile')

  let resolution = document.body.clientWidth + 'x' + document.body.clientHeight
  document.querySelector('#info-resolution-ecran').innerText = resolution

  keyboard.run()

  // récupérer la configuration
  configuration = await readFromFile()
  console.log('-> init app, configuration =', JSON.stringify(configuration, null, 2))
  if (configuration.current_server === '') {
    // entrer code pin
    showStep1()
  } else {
    // lancer application / modifier server / reset serveur courant
    showStep2()
  }

})