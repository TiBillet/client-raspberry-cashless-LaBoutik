import * as fs from "node:fs";
import * as IP from "ip";
import { spawn } from "child_process";
import { log } from "node:console";

const root = process.cwd()
const config = readJson(root + "/.env.json");

export function readJson(url) {
  try {
    const rawdata = fs.readFileSync(url);
    return JSON.parse(rawdata);
  } catch (error) {
    console.log("Lecture fichier de configuration,", error);
    return null;
  }
}

export function getInfosServerNfc(url) {
  try {
    const data = url.split("//")[1].split(":");
    return { adresse: data[0].trim(), port: data[1].trim() };
  } catch (err) {
    console.log("Erreur dans l'extraction de l'adresse et du port du serveur nfc !");
  }
}

export function getIp(typeReseau, famille) {
  try {
    const ip = IP.default.address(typeReseau, famille);
    if (ip !== "127.0.0.1" && ip !== "0.0.0.0") {
      return ip;
    } else {
      return null;
    }
  } catch (err) {
    console.log("-> getIp,", err);
    return null;
  }
}

export function launchBrowser(nameProcess, options) {
  let msgErreur = "", config, infoNfcServer

  try {
    config = readJson("./.env.json")
    urlServerNfc = config.urlServerNfc
  } catch (err) {
    msgErreur = err;
  }

  // Lance prog
  const prog = spawn(nameProcess, options);

  prog.stdout.on("data", (data) => {
    console.log(`prog - stdout: ${data}`);
  });

  prog.stderr.on("data", (data) => {
    console.error(`prog - stderr: ${data}`);
  });

  prog.on("close", (code) => {
    console.log(`prog - child process exited with code ${code}`);
    if (code === 0) {
      console.log(`--> ${nameProcess} démarrer !`);
    }
  });

}

/** @function
 * Teste l'url du serveur avec curl
 * @param {Sring} url - url à tester
 * @param {Number} nbMaxStderr - nombre maxi d'évènement Stderr avant de sortir de la fonction
 */
export async function urlResponseServerOk() {
  const myPromise = new Promise((resolve, reject) => {
    let msgErreur = "", config

    try {
      config = readJson("./.env.json")
    } catch (err) {
      msgErreur = err;
    }

    if (msgErreur === "") {
      const url = config.url
      const prog = spawn('curl', ['-I', url])
      prog.nbStderr = 0
      prog.resultatRequete = "404"
      prog.stdout.on('data', (data) => {
        let premiereLigne = data.toString().split('\n')[0]
        prog.resultatRequete = premiereLigne.split(' ')[1]
      })

      prog.stderr.on('data', (data) => {
        // console.log('-> ', data.toString())
        prog.nbStderr++
        if (prog.nbStderr >= 12) {
          prog.kill()
        }
      })

      prog.on('close', (code) => {
        // header 307 = redirection temporaire
        // header 308 = redirection permanente
        if (prog.resultatRequete === '200' || prog.resultatRequete === '307' || prog.resultatRequete === '308') {
          resolve({ error: false, value: config.url })
        } else {
          reject({ error: true, value: 'url erronnée ou le serveur ne répond pas !' })
        }

      })
    } else {
      reject({ error: true, value: 'url erronnée ou le serveur ne répond pas !' })
    }
  })

  try {
    return await myPromise
  } catch (error) {
    console.log('-> error = ', error)
    return { error: true, value: 'url erronée ou le serveur ne répond pas !' }
  }
}

export function launchWebBrowser(state) {
  // console.log("-> fonction lancerChromium !");

  let optionsChromium = [],
    msgErreur = "",
    config;

  try {
    config = readJson("./.env.json");
  } catch (err) {
    msgErreur = err;
  }

  if (msgErreur === "") {
    const infosServerNfc = getInfosServerNfc(config.urlServerNfc);
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
        ];
      } else {
        // prod
        optionsChromium = ["--allow-running-insecure-content", "--disable-features=Translate", "--disable-pinch", "--noerrdialogs", "--disable-infobars", "--check-for-update-interval=31536000", "http://localhost:" + PORT];
      }
    } else {
      // dev
      // console.log("-> etape 2, url = ", config.url);
      if (config.dev === true) {
        optionsChromium = ["--disable-features=Translate", "--disable-pinch", "--remote-debugging-port=9222", "--noerrdialogs", "--disable-infobars", "--check-for-update-interval=31536000", config.url];
      } else {
        // prod
        optionsChromium = ["--disable-features=Translate", "--disable-pinch", "--noerrdialogs", "--disable-infobars", "--check-for-update-interval=31536000", config.url];
      }
    }

    // mode kiosk uniquement pi
    if (config.fronType === "FPI") {
      optionsChromium.push("--kiosk");
    }

    if (msgErreur === "") {
      const userAgent = `{"hostname":"${config.hostname}", "token": "${config.token}", "password":"${config.password}","modeNfc":"${config.modeNfc}","front":"${config.frontType}","ip":"${getIp("public", "ipv4")}"}`;
      // console.log('userAgent = ', userAgent)

      optionsChromium.push(`--user-agent=${userAgent}`);
      // console.log("optionsChromium = ", optionsChromium);

      // Lance chromium
      const demChromium = spawn(config.exeChromium, optionsChromium);

      demChromium.stdout.on("data", (data) => {
        console.log(`demChromium - stdout: ${data}`);
      });

      demChromium.stderr.on("data", (data) => {
        console.error(`demChromium - stderr: ${data}`);
      });

      demChromium.on("close", (code) => {
        console.log(`demChromium - child process exited with code ${code}`);
        if (code === 0) {
          console.log("--> Chromium démarrer !");
        }
      });
    }
  } else {
    console.log("Erreur: ", msgErreur);
  }
}
