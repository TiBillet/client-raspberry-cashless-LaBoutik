import { MTE } from './httpServer/index.js'
import { readJson, writeJson, getModelPi, getIp, createUuidPiFromMacAddress, startBrowser, deleteFile } from './modules/commun.js'
import { env } from './.env.js'
import * as crypto from 'node:crypto'
import * as SLUGIFY from 'slugify'
import * as os from 'node:os'
import { cors } from './modules/cors.js'

const root = process.cwd()
const saveFileName = 'configLaboutik.json'
const slugify = SLUGIFY.default
let retour = null, client_globale = null, appDeviceEmitter = null
let devices = null

// 1 - affiche messages des appels socket.io et leurs méthodes uniquement
// 2 - url et méthodes affiliées
// 10 - tous les logs
const logLevel = env.logLevel

// infos pi
const devicePi = {
    ip: getIp(),
    model: await getModelPi(),
    uuid: createUuidPiFromMacAddress(),
    manufacturer: 'Raspberry Pi',
    hostname: os.hostname(),
}

// reset initial devices status
function resetDevicesStatus() {
  devices = [
    { name: 'network', status: 'off' },
    { name: 'nfc', status: 'off' },
  ]
  // status devices
  if (devicePi.ip !== '127.0.0.1') {
    let network = devices.find(device => device.name === 'network')
    network.status = 'on'
  }
  // dev test network off
  // devices.find(device => device.name === 'network').status = 'off'
}

function recordNfcStatusOn() {
  let nfcDevice = devices.find(device => device.name === 'nfc')
  // attention le lecteur nfc a un redémarrage cyclique, on teste uniquement le bon fonctionnement du nfc
  if (nfcDevice.status === 'off') {
    console.log('-> emit "returnDevicesStatus"');
    nfcDevice.status = 'on'
    client_globale.emit('returnDevicesStatus', { devicesStatus: devices, devicePi })
  }
}

// --- load and listen nfc device ---
function manageTagId(tagId) {
  // n'emmet que  si une connexion existe
  if (client_globale !== undefined) {
    if (retour !== null) {
      retour["tagId"] = tagId.toUpperCase()
      client_globale.emit("envoieTagId", retour)
      console.log("--> demande carte, envoi tag id = " + tagId.toUpperCase())
      retour = null
    } else {
      client_globale.emit("tagIdChange", tagId)
    }
  }
  console.log("tagId =", tagId, "  --  retour =", retour)
}

function showNfcMsg(msg) {
  console.log("msg =", msg)
}

function initNfcDevice() {
  console.log('')
  try {
    const pathDevice = root + '/modules/devices/' + env.device + '.js'
    if (appDeviceEmitter !== null) {
      appDeviceEmitter.removeListener("nfcReaderTagId", manageTagId)
      appDeviceEmitter.removeListener("nfcReader", showNfcMsg)
      appDeviceEmitter.removeListener("nfcReaderOn", recordNfcStatusOn)
      appDeviceEmitter.removeListener("nfcReaderReStart", initNfcDevice)
    }
    import(pathDevice).then(module => {
      const { deviceEmitter } = module
      appDeviceEmitter = deviceEmitter
      // --- nfc écoutes ---
      appDeviceEmitter.addListener("nfcReaderTagId", manageTagId)
      appDeviceEmitter.addListener("nfcReader", showNfcMsg)
      appDeviceEmitter.addListener("nfcReaderOn", recordNfcStatusOn)
      appDeviceEmitter.addListener("nfcReaderReStart", initNfcDevice)
    })
  } catch (error) {
    console.log('-> initNfcDevice,', error)
  }
}

/*
function readConfigFile(req, res, headers) {
  // console.log('-> readConfigFile, headers =', headers)
  let retour
  headers["Content-Type"] = "application/json"
  const configFromFile = readJson(root + '/' + saveFileName)
  if (configFromFile !== null) {
    retour = JSON.parse(configFromFile)
    // console.log('-----------------------------------------------------');
    // console.log('retour.server_pin_code =', retour.server_pin_code);
    // console.log('env.server_pin_code =', env.server_pin_code);
    // console.log('-----------------------------------------------------');
    if (retour.server_pin_code !== env.server_pin_code) {
      retour = env  
      deleteFile(root + '/' + saveFileName)
    }
  } else {
    retour = env
  }
  retour['piDevice'] = {
    ip: getIp(),
    uuid: createUuidPiFromMacAddress(),
    hostname: os.hostname()
  }
  res.writeHead(200, headers)
  res.write(JSON.stringify(retour))
  res.end()
}

function writeConfigFile(req, res, rawBody, headers) {
  // console.log('-> writeConfigFile, rawBody =', rawBody)
  headers["Content-Type"] = "application/json"
  try {
    const result = writeJson(root + '/' + saveFileName, rawBody)
    if (result.status === true) {
      res.writeHead(200, headers)
      res.write(JSON.stringify(result))
      res.end()
    } else {
      res.writeHead(400, headers)
      res.write(JSON.stringify(result))
      res.end()
    }
  } catch (error) {
    // writeJson(path, data)
    res.writeHead(400, headers)
    res.write(JSON.stringify({ error }))
    res.end()
  }
}

function readConfigurationApp() {
  client_globale.emit("returnConfigurationApp", getConfigurationApp())
}


// Find specific server in configuration
// @param {string} urlServer - server to find 
 //@param {object} configuration - app configuration 
 // @returns {undefined|object}
 //
function findDataServerFromConfiguration(urlServer, configuration) {
  if (urlServer === undefined) {
    return undefined
  }
function generatePassword(length) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let password = ""
  const array = new Uint32Array(length)
  crypto.getRandomValues(a
  return configuration.servers.find(item => item.server === urlServer)
}


function generatePassword(length) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let password = ""
  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length] // % operator returns remainder of division
  }
  return password
}
*/

// encapsulate all errors
try {

  // --- socket.io handler ---
  const socketHandler = (client) => {
    client_globale = client
    console.log("Client connecté !")
    resetDevicesStatus()
    initNfcDevice()

    /*
    client_globale.on('askUpdateConfigurationFile', (data) => {
      // TODO: valider data
      console.log('->  askUpdateConfigurationFile')
      writeConfigurationApp(data)
    })


    client_globale.on("resetNfc", () => {
      console.log("-> resetNfc")
      initNfcDevice()
    })

    client_globale.on("demandeTagId", (data) => {
      retour = data
      console.log("-> demandeTagIdg = " + JSON.stringify(retour))
    })

    client_globale.on("AnnuleDemandeTagId", () => {
      retour = null
    })

    client_globale.on('requestedIp', () => {
      console.log('-> msg "requestedIp" !')
      client_globale.emit('returnIp', getIp())
    })
    */

    client_globale.on("disconnect", () => {
      console.log("Client déconnecté !!")
    })
  }

  const optionsServer = {
    socketHandler,
    config: {
      PORT: env.nfc_server_port,
      // TODO: remettre en 127.0.0.1 pour la prod
      HOST: env.nfc_server_address,
      // racine du projet = process.cwd()
      PUBLIQUE: process.cwd() + '/www',
      DEBUG: true
    }
  }
  const app = new MTE(optionsServer)

  // ajout du midleware cors
  app.use(cors, {
    origin: '*',
    headers: 'Sentry-trace, Baggage, Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 204,
    maxAge: 2592000,
    credentials: true
  })
  // routes
  // app.addRoute('/config_file', readConfigFile)
  // app.addRoute('/write_config_file', writeConfigFile)

  app.listen((host, port) => {
    console.log(`Lancement du serveur à l'adresse : ${port === 443 ? 'https' : 'http'}://${host}:${port}/`)
    console.log(`Single server version ${app.version} (c) filaos974`)
  })

  startBrowser(env)

} catch (error) {
  console.log('error', error)
}
