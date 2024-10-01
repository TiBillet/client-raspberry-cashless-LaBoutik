import { MTE } from './httpServer/index.js'
import { readJson, writeJson, getModelPi, createUuidPiFromMacAddress, startBrowser, deleteFile, getIp } from './modules/commun.js'
import { env } from './.env.js'
import * as os from 'node:os'
import { cors } from './modules/cors.js'

const root = process.cwd()
const saveFileName = 'configLaboutik.json'
let retour = null, client_globale = null, appDeviceEmitter = null
let devices = null

// 1 - affiche messages des appels socket.io et leurs méthodes uniquement
// 2 - url et méthodes affiliées
// 10 - tous les logs
const logLevel = env.logLevel

// infos pi
const piDevice = {
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
  if (piDevice.ip !== '127.0.0.1') {
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
    client_globale.emit('returnDevicesStatus', { devicesStatus: devices, piDevice })
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


function readConfigFile(req, res, headers) {
  // console.log('-> readConfigFile, headers =', headers)
  let retour
  headers["Content-Type"] = "application/json"
  const configFromFile = readJson(root + '/' + saveFileName)
  if (configFromFile !== null) {
    retour = JSON.parse(configFromFile)
  } else {
    retour = env
  }
  retour['version'] = env.version
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

// encapsulate all errors
try {

  // --- socket.io handler ---
  const socketHandler = (client) => {
    client_globale = client
    console.log("Client connecté !")
    resetDevicesStatus()
    initNfcDevice()

    client_globale.on("demandeTagId", (data) => {
      retour = data
      console.log("-> demandeTagIdg = " + JSON.stringify(retour))
    })

    client_globale.on("AnnuleDemandeTagId", () => {
      retour = null
    })

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
  app.addRoute('/config_file', readConfigFile)
  app.addRoute('/write_config_file', writeConfigFile)

  app.listen((host, port) => {
    console.log(`Lancement du serveur à l'adresse : ${port === 443 ? 'https' : 'http'}://${host}:${port}/`)
    console.log(`Single server version ${app.version} (c) filaos974`)
  })

  startBrowser(env)

} catch (error) {
  console.log('error', error)
}
