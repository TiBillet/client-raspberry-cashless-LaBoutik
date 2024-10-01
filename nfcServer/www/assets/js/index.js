/* eslint-disable no-undef */
import {
  listenDevicesStatus, launchRender, frontstart, getConfigFromFile, getPinCode, checkPinCode, activeSpinner,
  listenNfcAndShow, getUrlServerFromPinCode, goLaboutik, deleteServer
} from './modules/machineActions.js'


window.socket = io(location.origin)
// init infos pi
window.piDevice = {
  ip: '127.0.0.1',
  model: 'unknown',
  uuid: 'unknown',
  manufacturer: 'Raspberry Pi',
  hostname: 'unknown',
}

const state = {
  idApp: '#app',
  currentStep: 'IDLE',
  saveFileName: 'configLaboutik.json',
  urlLogin: 'wv/login_hardware',
  logs: [],
  ip: null,
  configuration: {},
  spinner: false,
  pinCode: '',
  errorValuePinCode: '',
  devices: [
    { name: 'network', status: 'off' },
    { name: 'nfc', status: 'off' }
  ]
}

const machine = {
  INIT: {
    fromStep: 'IDLE',
    actions: ['listenDevicesStatus', 'launchRender', 'frontstart']
  },
  ALL_DEVICES_ON: {
    fromStep: 'INIT',
    actions: 'getConfigFromFile',
  },
  LIST_SERVERS: {
    fromStep: ['ALL_DEVICES_ON', 'GET_SERVER_FROM_PIN_CODE', 'GET_PIN_CODE', 'CONFIRM_DELETE_SERVER', 'DELETE_SERVER'],
    actions: ['launchRender', 'listenNfcAndShow']
  },
  GET_PIN_CODE: {
    fromStep: ['LIST_SERVERS', 'CHECK_PIN_CODE', 'GET_SERVER_FROM_PIN_CODE'],
    actions: 'getPinCode'
  },
  CHECK_PIN_CODE: {
    fromStep: 'GET_PIN_CODE',
    actions: 'checkPinCode'
  },
  GET_SERVER_FROM_PIN_CODE: {
    fromStep: 'CHECK_PIN_CODE',
    actions: ['activeSpinner', 'getUrlServerFromPinCode']
  },
  GO_SERVER: {
    fromStep: 'LIST_SERVERS',
    actions: ['activeSpinner', 'goLaboutik']
  },
  CONFIRM_DELETE_SERVER: {
    fromStep: 'LIST_SERVERS',
    actions: 'launchRender'
  },
  DELETE_SERVER: {
    fromStep: ['CONFIRM_DELETE_SERVER'],
    actions: 'deleteServer'
  },
  actions: {
    listenDevicesStatus,
    launchRender,
    frontstart,
    getConfigFromFile,
    listenNfcAndShow,
    getPinCode,
    checkPinCode,
    activeSpinner,
    getUrlServerFromPinCode,
    goLaboutik,
    deleteServer
  }
}

// manage steps
class ManageSteps {
  constructor() {
    this.state = state
    this.steps = machine
  }

  getStep() {
    return this.state.currentStep
  }

  setStep(step) {
    this.state.currentStep = step
  }

  // run
  async run(step, data) {
    // console.log('-> run, step =', step)
    const currentStep = this.state.currentStep
    const stepToManage = this.steps[step]
    // console.log('currentStep =', currentStep)
    // console.log('stepToManage =', JSON.stringify(stepToManage, null, 2))
    // console.log('type stepToMage.fromStep =', typeof (stepToManage.fromStep))
    let origineStep = false

    // provenant de plusieurs états
    if (typeof (stepToManage.fromStep) === 'object') {
      if (stepToManage.fromStep.includes(currentStep)) origineStep = true
    } else {
      // provenant d'un seul état
      if (currentStep === stepToManage.fromStep) origineStep = true
    }

    // console.log('origineStep =', origineStep);

    // lance les actions si transition bonne
    if (origineStep) {
      // params
      if (data !== undefined || data !== null) {
        this.state.params = data
      }
      // maj étape
      this.setStep(step)
      // plusieurs actions
      if (typeof (stepToManage.actions) === 'object') {
        stepToManage.actions.forEach(action => {
          this.steps.actions[action](this.state)
        })
      } else {
        // une seule action
        this.steps.actions[stepToManage.actions](this.state)
      }
    } else {
      console.log('-> Etape(s) impossible(s) !')
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  window.ma = new ManageSteps()
  ma.run('INIT')
}, false)
