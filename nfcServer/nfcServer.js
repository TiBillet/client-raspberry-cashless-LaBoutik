// sudo apt install -y lsof
// sudo lsof -nP -iTCP:3000 -sTCP:LISTEN
// test 2

import { MTE } from './httpServer/index.js'
import { readJson, writeJson, getIp, createUuidPiFromMacAddress, startBrowser, deleteFile } from './modules/commun.js'
import * as Sentry from '@sentry/node'
import { ProfilingIntegration } from "@sentry/profiling-node"
import { env } from './.env.js'
import * as crypto from 'node:crypto'
import * as SLUGIFY from 'slugify'
import * as os from 'node:os'
import { cors } from './modules/cors.js'

const root = process.cwd()
const saveFileName = 'configLaboutik.json'
const slugify = SLUGIFY.default
let retour = null, client_globale, appDeviceEmitter = null

// 1 - affiche messages des appels socket.io et leurs méthodes uniquement
// 2 - url et méthodes affiliées
// 10 - tous les logs
const logLevel = env.logLevel

/*
// sentry
Sentry.init({
  dsn: "https://75f6f3caea6cecf15133aab782274ec4@o262913.ingest.us.sentry.io/4506881173684224",
  integrations: [
    new ProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
})


const transaction = Sentry.startTransaction({
  op: "test",
  name: "My First Test Transaction",
})
*/

function readConfigFile(req, res, headers) {
  console.log('-> readConfigFile, headers =', headers)
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


try {
  env['nfcStatusOn'] = false

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

  function recordNfcStatusOn() {
    env.nfcStatusOn = true
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

  // --- socket.io handler ---
  const socketHandler = (client) => {
    client_globale = client

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

    client_globale.on("disconnect", () => {
      console.log("Client déconnecté !!")
    })
  }

  // lance l'écoute du serveur nfc
  initNfcDevice()

  const optionsServer = {
    socketHandler,
    config: {
      PORT: env.nfc_server_port,
      // TODO: remettre en 127.0.0.1 pour la prod
      HOST: env.nfc_server_address,
      // racine du projet = process.cwd()
      PUBLIQUE: process.cwd() + '/www',
      DEBUG: true,
      PROXY: [
        { url: "/pin_code/", domain: env.server_pin_code }
      ]
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
  // Sentry.captureException(error)
} finally {
  // transaction.finish()
}
