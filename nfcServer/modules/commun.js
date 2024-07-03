import * as fs from "node:fs"
import * as IP from "ip"
import { spawn } from "child_process"
import * as process from "node:process"
import * as os from 'node:os'

const root = process.cwd()
const config = readJson(root + "/.env.json")
const pathLogs = root + "/logs.txt"

export function deleteFile(path) {
  try {
    fs.unlinkSync(path)
  } catch (error) {
    console.log('-> deleteFile:', error)
  }
}

export function memoryStat(unit) {
  const mu = process.memoryUsage().heapUsed
  // # bytes / KB / MB / GB
  const gbNow = mu / 1024 / 1024 / 1024
  const gbRounded = Math.round(gbNow * 100) / 100

  const mbNow = mu / 1024 / 1024
  const mbRounded = Math.round(mbNow * 100) / 100

  console.log(`App using ${gbRounded} GB -- ${mbRounded} MB of memory.`)
}

export function logs(msg) {
  try {
    console.log('-> logs, pathLogs =', pathLogs)
    let content
    const fileExists = fs.existsSync(pathLogs)
    const newRecord = {
      time: new Date().getTime(),
      msg,
      mu: process.memoryUsage().heapUsed
    }

    if (fileExists) {
      const rawdata = fs.readFileSync(pathLogs)
      content = JSON.parse(rawdata)
      content.push(newRecord)
      fs.writeFileSync(pathLogs, JSON.stringify(content, null, 2))
    } else {
      content = []
      content.push(newRecord)
      fs.writeFileSync(pathLogs, JSON.stringify(content))
    }
  } catch (error) {
    console.log("Logs,", error.message)
  }
}

export function readJson(path) {
  try {
    const fileExists = fs.existsSync(path)
    if (fileExists) {
      const rawdata = fs.readFileSync(path, { encoding: 'utf8' })
      return JSON.parse(rawdata)
    } else {
      throw new Error("The file doesn't exist")
    }
  } catch (error) {
    console.log("Lecture fichier de configuration,", error.message)
    return null
  }
}

export function writeJson(path, data) {
  try {
    fs.writeFileSync(path, JSON.stringify(data), { encoding: 'utf8' })
    return { status: true, msg: '' }
  } catch (error) {
    console.log("sauvegarde fichier de configuration,", error.message)
    return { status: false, msg: 'error.message' }
  }
}

export function getInfosServerNfc(url) {
  try {
    const data = url.split("//")[1].split(":")
    return { adresse: data[0].trim(), port: data[1].trim() }
  } catch (err) {
    console.log("Erreur dans l'extraction de l'adresse et du port du serveur nfc !")
  }
}

export function getIp(typeReseau, famille) {
  try {
    const ip = IP.default.address(typeReseau, famille)
    if (ip !== "127.0.0.1" && ip !== "0.0.0.0") {
      return ip
    } else {
      return "127.0.0.1"
    }
  } catch (err) {
    console.log("-> getIp,", err)
    return "127.0.0.1"
  }
}

export function createUuidPiFromMacAddress() {
  const obj = os.networkInterfaces()
  const ip = getIp('public', 'ipv4')
  let retour = 'xxxxxxxxxxxx'
  for (let [key, value] of Object.entries(obj)) {
    const result = value.find(item => item.address === ip)
    if (result !== undefined) {
      retour = result.mac.replace(/:/g, '')
      break
    }
  }
  return retour
}

export function startBrowser(env) {
  // env.dev = false
  console.log('-> launchWebBrowser, env =', env)
  let optionsBrowser
  try {
    // dev
    if (env.dev === true) {
      optionsBrowser = [
        "--allow-running-insecure-content",
        "--disable-features=Translate",
        "--disable-pinch",
        "--remote-debugging-port=9222",
        "--check-for-update-interval=31536000",
        "--noerrdialogs", "--disable-infobars",
        "http://" + env.nfc_server_address + ":" + env.nfc_server_port
      ]
    } else {
      // prod
      optionsBrowser = ["--allow-running-insecure-content", "--disable-features=Translate", "--disable-pinch", "--noerrdialogs", "--disable-infobars", "--check-for-update-interval=31536000", "http://" + env.nfc_server_address + ":" + env.nfc_server_port]
    }

    // mode kiosk uniquement pi
    if (env.front_type === "FPI" && env.dev === false) {
      optionsBrowser.push("--kiosk")
    }

    console.log('optionsBrowser =', optionsBrowser)

    // Lance chromium
    const demChromium = spawn(env.exeChromium, optionsBrowser, { uid: 1000, gid: 1000 })

    demChromium.stdout.on("data", (data) => {
      console.log(`chromium - stdout: ${data}`)
    })

    demChromium.stderr.on("data", (data) => {
      console.error(`chromium - stderr: ${data}`)
    })

    demChromium.on("close", (code) => {
      console.log(`chromium - child process exited with code ${code}`)
      if (code === 0) {
        console.log("--> Chromium démarrer !")
      }
    })

  } catch (error) {
    console.log('-> launchWebBrowser,', error)
  }
}
