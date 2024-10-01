/* eslint-disable no-undef */
import { render } from './templateRender.js'

// ---- méthodes dépendances ----
window.log = function (typeMsg, msg, state) {
  console.log('-> log, typeMsg =', typeMsg, '  --  msg =', msg)
  state.logs.push({ typeMsg, msg })
  render(state)
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
 * Write configuration file
 * @param {object} state
 * @returns {boolean}
 */
async function writeToFile(state) {
  // console.log('-> writeToFile, configuration =', configuration)
  const rawData = state.configuration
  try {
    const response = await fetch('/write_config_file', {
      mode: 'cors',
      method: 'POST',
      body: JSON.stringify(rawData)
    })
    const retour = await response.json()
    if(retour.status === false) {
        log('error', 'writeToFile, ' + retour.msg, state)
    }
    return retour.status
  } catch (error) {
    console.log('writeToFile,', error)
    return false
  }
}

/**
 * Update configuration file
 * @param {object} retour 
 * @returns {boolean}
 */
async function updateConfigurationFile(options, state) {
  // console.log('-> updateConfigurationFile, configuration =', state.configuration)
  const password = generatePassword(30)

  state.configuration['hostname'] = options.hostname
  state.configuration['uuidDevice'] = piDevice.uuid
  state.configuration['piDevice'] = piDevice
  state.configuration['pin_code'] = options.pinCode
  state.configuration.client = {
    password,
    username: options.username,
    pin_code: options.pinCode
  }

  const testServerIn = findDataServerFromConfiguration(options.retour.server_url, state.configuration)

  // serveur inéxistant dans le fichier de conf, ajouter le
  if (testServerIn === undefined) {
    const newServer = {
      server: options.retour.server_url,
      // locale: options.retour.locale,
      publicKeyPem: options.retour.server_public_pem,
      locale: options.retour.locale,
      client: state.configuration.client
    }
    state.configuration.servers.push(newServer)
  } else {
    const filterServers = state.configuration.servers.filter(item => item.server !== options.retour.server_url)
    state.configuration.servers = filterServers
    state.configuration.servers.push(newServer)
  }

  state.configuration.current_server = options.retour.server_url
  // console.log('-> avant maj fichier, configuration =', state.configuration)
  return await writeToFile(state)
}

// ---- métodes de la machine ----

// attention listenDevices must start before all tests devices
export function listenDevicesStatus(state) {
  // console.log('-> listenDevicesStatus');
  // update state with devices status && get infos host(pi)
  socket.on('returnDevicesStatus', (options) => {
   piDevice = options.piDevice
    state.ip = piDevice.ip
    let allDevicesOn = true
    state.devices = options.devicesStatus
    state.devices.forEach(itemDevice => {
      // détermine allDevicesOn
      if (itemDevice.status === 'off') {
        allDevicesOn = false
      }
    })

    // go step 'ALL_DEVICES_ON' 
    if (allDevicesOn) {
      ma.run('ALL_DEVICES_ON')
    } else {
      render(state)
    }
  })
}

export function launchRender(state) {
  render(state)
}

export function frontstart(state) {
  socket.emit('frontStart')
}

export function activeSpinner(state) {
  state.spinner = true
  render(state)
}

export function disableSpinner(state) {
  state.spinner = false
  render(state)
}

export async function getConfigFromFile(state) {
  try {
    activeSpinner(state)
    const response = await fetch('/config_file')
    state.configuration = await response.json()
    disableSpinner(state)
    ma.run('LIST_SERVERS')
  } catch (error) {
    log('error', 'readFromFile, ' + error, state)
    disableSpinner(state)
  }  
}

export function listenNfcAndShow() {
  socket.on('tagIdChange', (tagId) => {
    document.querySelector('#rep-tag-id').innerHTML = tagId
  })
}

export function getPinCode(state) {
  state.pinCode = ''
  render(state)
}

export function checkPinCode(state) {
  // console.log('-> checkPinCode, state =', state);
  // valeur pin code (string)
  const valueElement = document.querySelector('#pin-code').value

  state.errorValuePinCode = ''
  if (valueElement === '') {
    state.errorValuePinCode = 'no pin code !'
  }

  if ((valueElement.length > 6 || valueElement.length < 6) && valueElement !== '') {
    state.errorValuePinCode = 'Il faut 6 chiffres pour le pin code.'
  }

  // maj pinCode
  state.pinCode = parseInt(valueElement)
  if (state.errorValuePinCode === '') {
    ma.run('GET_SERVER_FROM_PIN_CODE')
  } else {
    ma.run('GET_PIN_CODE')
  }
}

export async function getUrlServerFromPinCode(state) {
  // console.log('-> getUrlServerFromPinCode, state =', state)
  try {
    const pinCode = state.pinCode
    const hostname = slugify(piDevice.manufacturer + '-' + piDevice.model + '-' + piDevice.uuid)
    // client/app
    let username
    if (window.crypto.randomUUID) {
      username = slugify(piDevice.manufacturer + '-' + piDevice.model + '-' + piDevice.uuid + '-' + window.crypto.randomUUID())
    } else {
      username = slugify(piDevice.manufacturer + '-' + piDevice.model + '-' + piDevice.uuid + '-' + (window.URL.createObjectURL(new Blob([])).substring(31)))
    }

    log('info', 'hostname = ' + hostname, state)
    log('info', 'username = ' + username, state)

    // curl -X POST https://discovery.filaos.re/pin_code/ -H "Content-Type: application/x-www-form-urlencoded" -d "pin_code=695610" -v

    let data = new URLSearchParams()
    data.append('pin_code', pinCode)
    data.append('hostname', hostname)
    data.append('username', username)
    const response = await fetch(state.configuration.server_pin_code + '/pin_code/', {
      mode: 'cors',
      method: 'POST',
      body: data
    })
    const retour = await response.json()
    disableSpinner(state)
    // console.log('-> getUrlServerFromPinCode, retour =', retour)
    if (response.status === 200) {
      const retourUpdate = await updateConfigurationFile({ retour, pinCode, hostname, username }, state)
      // console.log('retourUpdate =', retourUpdate)
      if (retourUpdate === false) {
        log('error', 'Erreur lors de mise à jour de la configuration.', state)
      } else {
        log('info', 'Mise à jour de la configuration.', state)
      }
      log('success', 'Current server = ' + state.configuration.current_server, state)
      ma.run('LIST_SERVERS')
    } else {
      throw new Error('No server from this pinCode')
    }
  } catch (error) {
    // console.log('-> getUrlServerFromPinCode,', error)
    log('error', '-> ' + error, state)
    disableSpinner(state)
    ma.run('GET_PIN_CODE')
  }
  render(state)
}

export async function deleteServer(state) {
  const server = state.params
  // console.log('-> deleteServer, server =', server)
  // change current server and client if url is the current server
  if (state.configuration.current_server === server) {
    state.configuration.current_server = ''
    state.configuration.client = null
    state.configuration.pin_code = ''
  }
  // delete server data from servers list
  const newServers = state.configuration.servers.filter(item => item.server !== server)
  state.configuration.servers = newServers

  // update configuration file
  const result = await writeToFile(state)

  if (result === true) {
    ma.run('LIST_SERVERS')
  } else {
    log('error', '-> Delete server error.', state)
  }
}

// Update current server and go LaBoutik
// @param {object} state - application state 
export async function goLaboutik(state) {
  const server = state.params
  console.log('-> goLaboutik, server =', server)
  const client = state.configuration.servers.find(item => item.server === server).client
  console.log('-> client =', client)
  // change current server
  state.configuration.current_server = server
  // change client of the new current server
  state.configuration.client = client
  // change le pin code of the new current server
  state.configuration.pin_code = client.pin_code
  // update configuration file
  const result = await writeToFile(state)
  console.log('result =', result)

  if (result === true) {
    window.location = server + state.urlLogin
  } else {
    log('error', '-> Change current server error.', state)
    disableSpinner(state)
  }
}
