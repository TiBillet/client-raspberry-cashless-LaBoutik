import * as fs from "node:fs"

const root = process.cwd()
const pathLogs = root + "/logs.txt"

function showLogs() {
  try {
    let content
    console.log('pathLogs =', pathLogs)
    const fileExists = fs.existsSync(pathLogs)
    console.log('fileExists =', fileExists)

    if (fileExists) {
      console.log(`Read the log file "${pathLogs}".`)
      const rawdata = fs.readFileSync(pathLogs)
      content = JSON.parse(rawdata)
      
      for (let i = 0; i < content.length; i++) {
        const element = content[i]
        const quand = new Date(element.time).toLocaleString()
        // mu = bytes / KB / MB / GB
        const mbNow = element.mu / 1024 / 1024
        const memory = Math.round(mbNow * 100) / 100
        console.log('--------------------------------------------------------------------------')
        console.log('Date: ',quand, '  --  memory =', memory, 'MG')
        console.log(element.msg)
      }
      
    } else {
      throw new Error(`The file "${pathLogs}" doesn't exist.`)
    }
  } catch (error) {
    console.log("Lecture fichier de configuration,", error.message)
  }
}

showLogs()
