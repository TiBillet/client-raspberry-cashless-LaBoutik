import * as fs from "node:fs"
import * as IP from "ip"
import { spawn } from "child_process"
import * as process from "node:process"

const root = process.cwd()
const config = readJson(root + "/.env.json")
const pathLogs = root + "/logs.txt"

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
      const rawdata = fs.readFileSync(path)
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
    fs.writeFileSync(path, JSON.stringify(data, null, 2))
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

export function launchBrowser(nameProcess, options) {
  let msgErreur = "", config, infoNfcServer

  try {
    config = readJson("./.env.json")
    urlServerNfc = config.urlServerNfc
  } catch (err) {
    msgErreur = err
  }

  // Lance prog
  const prog = spawn(nameProcess, options)

  prog.stdout.on("data", (data) => {
    console.log(`prog - stdout: ${data}`)
  })

  prog.stderr.on("data", (data) => {
    console.error(`prog - stderr: ${data}`)
  })

  prog.on("close", (code) => {
    console.log(`prog - child process exited with code ${code}`)
    if (code === 0) {
      console.log(`--> ${nameProcess} démarrer !`)
    }
  })

}


/*
export function launchWebBrowser(state) {
  // console.log("-> fonction lancerChromium !");

  let optionsChromium = [],
    msgErreur = "",
    config

  try {
    config = readJson("./.env.json")
  } catch (err) {
    msgErreur = err
  }

  if (msgErreur === "") {
    const infosServerNfc = getInfosServerNfc(config.urlServerNfc)
    const PORT = infosServerNfc.port
    const ADDR = infosServerNfc.adresse
    if (state === 1) {
      // dev
      if (config.dev === true) {
        optionsChromium = [
          "--allow-running-insecure-content",
          "--disable-features=Translate",
          "--disable-pinch",
          "--remote-debugging-port=9222",
          "--noerrdialogs",
          "--disable-infobars",
          "--check-for-update-interval=31536000",
          "http://" + ADDR + ":" + PORT
        ]
      } else {
        // prod
        optionsChromium = ["--allow-running-insecure-content", "--disable-features=Translate", "--disable-pinch", "--noerrdialogs", "--disable-infobars", "--check-for-update-interval=31536000", "http://localhost:" + PORT]
      }
    } else {
      // dev
      // console.log("-> etape 2, url = ", config.url);
      if (config.dev === true) {
        optionsChromium = ["--disable-features=Translate", "--disable-pinch", "--remote-debugging-port=9222", "--noerrdialogs", "--disable-infobars", "--check-for-update-interval=31536000", config.url]
      } else {
        // prod
        optionsChromium = ["--disable-features=Translate", "--disable-pinch", "--noerrdialogs", "--disable-infobars", "--check-for-update-interval=31536000", config.url]
      }
    }

    // mode kiosk uniquement pi
    if (config.fronType === "FPI") {
      optionsChromium.push("--kiosk")
    }

    if (msgErreur === "") {
      const userAgent = `{"hostname":"${config.hostname}", "token": "${config.token}", "password":"${config.password}","modeNfc":"${config.modeNfc}","front":"${config.frontType}","ip":"${getIp("public", "ipv4")}"}`
      // console.log('userAgent = ', userAgent)

      optionsChromium.push(`--user-agent=${userAgent}`)
      // console.log("optionsChromium = ", optionsChromium);

      // Lance chromium
      const demChromium = spawn(config.exeChromium, optionsChromium)

      demChromium.stdout.on("data", (data) => {
        console.log(`demChromium - stdout: ${data}`)
      })

      demChromium.stderr.on("data", (data) => {
        console.error(`demChromium - stderr: ${data}`)
      })

      demChromium.on("close", (code) => {
        console.log(`demChromium - child process exited with code ${code}`)
        if (code === 0) {
          console.log("--> Chromium démarrer !")
        }
      })
    }
  } else {
    console.log("Erreur: ", msgErreur)
  }
}
*/

export function launchWebBrowser(env) {
  console.log('-> launchWebBrowser, env =', env);
  /*
  // dev
  if (config.dev === true) {
    optionsBrowser = [
      "--allow-running-insecure-content",
      "--disable-features=Translate",
      "--disable-pinch",
      "--remote-debugging-port=9222",
      "--noerrdialogs",
      "--disable-infobars",
      "--check-for-update-interval=31536000",
      "http://" + ADDR + ":" + PORT
    ]
  } else {
    // prod
    optionsBrowser = ["--allow-running-insecure-content", "--disable-features=Translate", "--disable-pinch", "--noerrdialogs", "--disable-infobars", "--check-for-update-interval=31536000", "http://localhost:" + PORT]
  }
  */
}