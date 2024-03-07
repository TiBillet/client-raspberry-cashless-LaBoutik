import {typeMime} from "./nfcServer/www/jsModules/typeMine.js";
import * as os from "node:os";
import * as fs from "node:fs";
import * as IP from "ip";
import {spawn} from "child_process";
import * as http from "http";

// nfc ACR122U
import {deviceEmitter} from "./nfcServer/www/jsModules/devices/acr122u-u9.js";
// ou nfc VMA405
//import { deviceEmitter } from "./jsModules/devices/vma405.js";

let script, ip, memSudoMdp = '', etatUrl = 0
let TAB = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '!', '#', '$', '%', '&', '?', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
let max_TAB = TAB.length - 1
let donneesFichierConfiguration = {}
// type de lecteur nfc
const typeLecteurNfc = 'acr122u'
// dev = 1 = mode développement
let dev = 0

const hostname = os.hostname()

// serveur http
const ADR = '127.0.0.1'
const PORT = 3000
const TOKEN = '$a;b2yuM5454@4!cd'
//  retour = null = aucune demande de lecture de carte nfc
let retour = null
let client_globale = null
let fichier = '', contentType = ''

/**
 * retourne l'ip
 * @param {string|'public'|'private'} typeReseau
 * @param {String|'ipv4'|'ipv6'} famille
 * @returns {string}
 */
function obtenirIp(typeReseau, famille) {
  ip = IP.default.address(typeReseau, famille)
  let retour = "erreur"
  if (ip !== "127.0.0.1" && ip !== "0.0.0.0") {
    retour = ip
  }
  return retour
}

// --- commandes système ---
/** @function
 * Obtenir ip extérieur (wan/box)
 */
function obtenirIpWan() {
  const prog = spawn('curl', ['ifconfig.me'])
  prog.stdout.on('data', (data) => {
    prog.resultatRequete = data.toString()
  })

  prog.on('close', (code) => {
    if (code === 0) {
      // ok: ip = prog.resultatRequete
    } else {
      // erreur
    }
  })
}

/**
 * Obtenir des données de configuration d'un fichier (.chromium_env)
 * @param {Array} rechercher - liste des varaibles à rechercher ddans le fichier
 * @param {String} fichier - nom du fichier à lire
 * @returns {{msg, erreur: number}|{valeurs: {}, erreur: number}}
 */
function obtenirConfigurationDunFichier(rechercher, fichier) {
  try {
    const fic = fs.readFileSync(fichier, {encoding: 'utf8', flag: 'r'}).split('\n')
    let obj = {}
    for (let index = 0; index < fic.length; index++) {
      let ligne = fic[index].toString()
      if (ligne.length > 0 && ligne[0] !== '#' && ligne.indexOf('=') !== -1) {
        let tab = ligne.split('=')
        for (let im in rechercher) {
          const mot = rechercher[im]
          if (mot === (tab[0].trim())) {
            obj[tab[0].trim()] = tab[1].trim()
          }
        }
      }
    }
    return {erreur: 0, valeurs: obj}
  } catch (error) {
    return {erreur: 1, msg: error}
  }
}

function afficherInfoServeur(donnees) {
  // console.log('-> fonction afficherInfoServeur !')
  // console.log('donnees = ', donnees)
  if (donnees.erreur === 0) {
    let bruteUrl = donnees.valeurs.url
    let posDeuxSlashs = bruteUrl.indexOf('//') + 2
    let posFinDomaine = bruteUrl.indexOf('/wv/login_hardware')
    let domaine = bruteUrl.substring(posDeuxSlashs, posFinDomaine)
    let onclique = ''
    if (donnees.valeurs.front_type === "FPI") {
      onclique = `onclick="clavierVirtuel.obtPosition('serveur');clavierVirtuel.afficher('serveur', 'alpahMin')"`
    }
    let fronts = ['FPI', 'FOR']
    let options = ''
    for (let i = 0; i < fronts.length; i++) {
      let sel = ''
      console.log(`${i} -> ${fronts[i]}  --  ${donnees.valeurs.front_type}`)
      if (fronts[i] === donnees.valeurs.front_type) {
        sel = 'selected'
      }
      options += `<option value="${fronts[i]}" ${sel}>${fronts[i]}</option>`
    }
    return `
      <div id="info-serveur" class="BF-ligne-deb l100p item-info" data-url-serveur="${bruteUrl}" data-serveur="${domaine}">Serveur: ${domaine}</div>
      
      <div class="BF-ligne-deb l100p">  
        <div id="bt-tester-serveur" class="bt bt-250px fond-ok curseur-action">
          <div class="md4px">Tester Serveur</div>
        </div>
      </div>
      
      <div class="BF-ligne-deb item-info l100p">
        <div id="bt-modifier-serveur" class="bt bt-250px fond-alerte curseur-action">
          <div class="md4px">Modifier Serveur</div>
          <div id="etat-modifier-serveur" class="mod-serveur-ok"></div>
        </div>
      </div>

      <div id="modifier-serveur" class="contenu-form eff p4px fond-header l100p">
        <div class="BF-ligne-deb mb8px">
          <label for="serveur" class="serveur-label">Serveur</label>
          <input type="text" id="serveur" class="input-pour-pi" name="serveur" value="${domaine}" ${onclique} required>
        </div>
        <div class="BF-ligne-deb  mb8px">
          <label for="nom-appareil" class="mod-wifi-label">APPAREIL</label>
          <input type="text" id="nom-appareil" class="input-pour-pi" name="nom-appareil" value="${os.hostname()}" disabled>
        </div>
        <div class="BF-ligne-deb  mb8px">
          <label for="passe" class="mod-wifi-label">GENERER MOT DE PASSE</label>
          <input type="checkbox" id="passe" name="passe" >
        </div>
        <div class="BF-ligne-deb  mb8px">
          <label for="type-front" class="mod-wifi-label">FRONT</label>
          <select id="type-front" class="input-pour-pi">${options}</select>
        </div>
        <div class="BF-ligne">
          <div id="bt-valider-modifier-serveur" class="bt bt-valider fond-ok coulBlanc curseur-action">Valider</div>
        </div>
      </div>
    `
  } else {
    return `
      <div class="BF-ligne-deb item-info l100p">Erreur</div>
      <div class="item-info">donnees.msg</div>
    `
  }
}

function returnProfil() {
  const dataFichier = obtenirConfigurationDunFichier(['hostname', 'token', 'password', 'front_type', 'url', 'mode_nfc'], './.chromium_env')
  if (dataFichier.erreur === 0) {
    dataFichier.valeurs['ip'] = obtenirIp('public', 'ipv4')
    client_globale.emit("returnProfil", dataFichier.valeurs);
  } else {
    client_globale.emit("envoieTagId", 'Erreur: lecture fichier de conf !');
  }
}


/** @function
 * Teste l'url avec curl
 * @param {Sring} url - url à tester
 * @param {Number} nbMaxStderr - nombre maxi d'évènement Stderr avant de sortir de la fonction
 */
function testUrl(nbMaxStderr) {
  const dataFichier = obtenirConfigurationDunFichier(['hostname', 'token', 'password', 'front_type', 'url', 'mode_nfc'], './.chromium_env')
  if (dataFichier.erreur === 0) {
    const url = dataFichier.valeurs.url
    console.log(`-> fonction testUrl, dataFichier = ${url}`)
    const prog = spawn('curl', ['-I', url])
    prog.nbMaxStderr = nbMaxStderr
    prog.nbStderr = 0
    prog.resultatRequete = "404"
    etatUrl = 0
    prog.stdout.on('data', (data) => {
      let premiereLigne = data.toString().split('\n')[0]
      prog.resultatRequete = premiereLigne.split(' ')[1]
    })

    prog.stderr.on('data', (data) => {
      prog.nbStderr++
      if (prog.nbStderr === prog.nbMaxStderr) {
        prog.kill()
      }
    })

    prog.on('close', (code) => {
      // header 307 = redirection temporaire
      // header 308 = redirection permanente
      console.log('réponse test serveur = ', prog.resultatRequete)
      if (prog.resultatRequete === '200' || prog.resultatRequete === '307' || prog.resultatRequete === '308') {
        etatUrl = 1
      }
      client_globale.emit('etatUrlServeur', prog.resultatRequete)
    })
  } else {
    client_globale.emit("envoieTagId", 'Erreur: lecture fichier de conf !');
  }
}


function modifierConfigurationWifi(data) {
  console.log('-> fonction modifierConfigurationWifi !')
  console.log('data = ', data)
  let template = `country=FR
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
network={
  ssid="${data.essid}"
  psk="${data.passePhrase}"
  scan_ssid=1    
}
`
  try {
    fs.writeFileSync("/etc/wpa_supplicant/wpa_supplicant.conf", template, {flag: "w"})
    client_globale.emit('modificationWifi', {
      erreur: 0,
      msg: `
        <div class="l100p h100p BF-col">
          <h1>Modification wifi effectuée,</h1>
          <h1>réseau = ${data.essid}</h1>
          <h1>Redémmarer l'appareil ! </h1>
        </div>
      `
    })
  } catch (erreur) {
    client_globale.emit('modificationWifi', {
      erreur: 1,
      msg: `
        <h1>Erreur configuration wifi</h1>
        <h2>${erreur}</h2>
      `
    })
  }
}

function afficherInfosWifi() {
  // console.log('-> fonction afficherInfosWifi !')
  const prog = spawn('iwconfig', [])
  prog.stdout.on('data', (data) => {
    let lignes = data.toString().split('\n')
    for (let i = 0; i < lignes.length; i++) {
      let ligne = lignes[i]
      if (ligne.indexOf('ESSID') !== -1) {
        let tmpData = ligne.split(':')
        let etatWifi = 'on'
        let essid = ''
        if (tmpData[1].includes('off')) {
          etatWifi = 'off'
        } else {
          essid = tmpData[1].trim().replace(/"/g, '')
        }
        let tmpData2 = ligne.split(' ')
        prog.resultat = {interface: tmpData2[0], etat: etatWifi, essid: essid}
        break
      }
    }
  })

  prog.on('close', (code) => {
    if (code === 0) {
      // wifi actif
      // if (prog.resultat.etat === 'on' && donneesFichierConfiguration.erreur === 0) {
      // uniquement sur pi
      if (donneesFichierConfiguration.valeurs.front_type === "FPI") {
        let onclique = ''
        const oncliqueEssid = `onclick="clavierVirtuel.obtPosition('essid');clavierVirtuel.afficher('essid', 'alpahMin')"`
        const oncliquePasse = `onclick="clavierVirtuel.obtPosition('pp');clavierVirtuel.afficher('pp', 'alpahMin')"`

        let fragHtml = `
            <div id="info-essid" class="BF-ligne-deb item-info l100p">Ssid: ${prog.resultat.essid}</div>
            <div class="BF-ligne-deb item-info l100p">
              <div id="bt-modifier-wifi" class="bt bt-250px fond-alerte curseur-action">
                <div class="md4px">Modifier Wifi</div>
                <div id="etat-modifier-wifi" class="mod-wifi-ok"></div>
              </div>
            </div>
            <div id="modifier-wifi" class="contenu-form eff p4px fond-header l100p">
              <div class="BF-ligne-deb  mb8px">
                <label for="essid" class="mod-wifi-label">RESEAU:</label>
                <input type="text" id="essid" class="input-pour-pi" name="essid" ${oncliqueEssid} required>
              </div>
              <div class="BF-ligne-deb mb8px">
                <label for="pp" class="mod-wifi-label">MOT DE PASSE:</label>
                <input type="password" id="pp" class="input-pour-pi" name="pp" ${oncliquePasse} required>
              </div>
              <div class="BF-ligne">
                <div id="bt-valider-modifier-wifi" class="bt bt-valider fond-ok coulBlanc curseur-action">Valider</div>
              </div>
            </div>
          `
        client_globale.emit('retourInfosWifi', fragHtml)
      }
      // }
    }
  })
}

/**
 * Lancer chromium
 * @param {Number|1|2} - etape
 */
function lancerChromium(etape, dataFichier) {
  console.log('-> fonction lancerChromium !')
  let optionsChromium = [], msgErreur = '', data
  if (dataFichier.erreur === 0) {
    data = dataFichier.valeurs
  } else {
    msgErreur = dataFichier.msg
  }

  if (msgErreur === '') {
    if (etape === 1) {
      // dev
      if (dev === 1) {
        optionsChromium = ['--disable-features=Translate', '--disable-pinch', '--remote-debugging-port=9222', '--noerrdialogs', '--disable-infobars', '--check-for-update-interval=31536000', 'http://127.0.0.1:3000']
      } else {
        // prod
        optionsChromium = ['--disable-features=Translate', '--disable-pinch', '--noerrdialogs', '--disable-infobars', '--check-for-update-interval=31536000', 'http://127.0.0.1:3000']
      }
    } else {
      // dev
      console.log('-> etape 2, url = ', data.url)
      if (dev === 1) {
        optionsChromium = ['--disable-features=Translate', '--disable-pinch', '--remote-debugging-port=9222', '--noerrdialogs', '--disable-infobars', '--check-for-update-interval=31536000', data.url]
      } else {
        // prod
        optionsChromium = ['--disable-features=Translate', '--disable-pinch', '--noerrdialogs', '--disable-infobars', '--check-for-update-interval=31536000', data.url]
      }

    }

    // mode kiosk uniquement pi
    if (data.front_type === "FPI") {
      optionsChromium.push('--kiosk')
    }

    if (msgErreur === '') {
      // Lance chromium
      const demChromium = spawn('chromium-browser', optionsChromium)

      demChromium.stdout.on('data', (data) => {
        console.log(`demChromium - stdout: ${data}`)
      });

      demChromium.stderr.on('data', (data) => {
        console.error(`demChromium - stderr: ${data}`)
      })

      demChromium.on('close', (code) => {
        console.log(`demChromium - child process exited with code ${code}`)
        if (code === 0) {
          console.log('--> Chromium démarrer !')
        }
      })
    }
  } else {
    console.log('Erreur: ', msgErreur)
  }
}

function lancerApplication() {
  console.log('-> fonction lancerApplication !')
  const dataConf = obtenirConfigurationDunFichier(['hostname', 'token', 'password', 'front_type', 'url', 'mode_nfc'], './.chromium_env')
  if (dataConf.erreur === 0) {
    let prog
    if (dataConf.valeurs.front_type === "FPI") {
      prog = spawn('pkill', ['chromium-browser'])
    } else {
      prog = spawn('pkill', ['chrome'])
    }

    prog.stdout.on('data', (data) => {
      console.log('stdout: ', data.toString())
    })

    prog.stderr.on('data', (data) => {
      console.log('stderr: ', data.toString())
    })

    prog.on('close', (code) => {
      if (code === 0) {
        console.log('--> Chromium arrêter !')
        const dataFichier = obtenirConfigurationDunFichier(['hostname', 'token', 'password', 'front_type', 'url', 'mode_nfc'], './.chromium_env')
        lancerChromium(2, dataFichier)
      }
    })
  } else {
    console.log('Erreur: ', dataConf.msg)
  }
}

function afficherFrontType() {
  console.log('-> fonction afficherFrontType !')
  console.log('donneesFichierConfiguration = ', donneesFichierConfiguration)
  if (donneesFichierConfiguration.erreur === 0) {
    return donneesFichierConfiguration.valeurs.front_type
  } else {
    return 'inconnu'
  }
}

function rnd(min, max) {
  return Math.round(Math.random() * ((max + 1) - min) + min, 0);
}

function generer_mot_de_passe(longueur) {
  let mot = '';
  let lettre = TAB[rnd(0, max_TAB)];
  for (let i = 0; i < (longueur); i++) {

    while (mot.indexOf(lettre) != -1) {
      lettre = TAB[rnd(0, 59)];
    }
    mot += lettre;
  }
  return mot
}

function modifierConfigurationServeur(data) {
  // console.log('-> fonction modifierConfigurationServeur !')
  let proto = 'https'
  // Développement serveur = "#serveur.com#", donne un protocol http et serveur = "serveur.com"
  let serveur = data.serveurDomaine.toString()
  // console.log('0 = ',serveur[0], '  --  dernier = ',serveur[(serveur.length-1)])
  if (serveur[0] === '#' && serveur[(serveur.length - 1)] === '#') {
    proto = 'http'
    serveur = data.serveurDomaine.toString().substring(1, (serveur.length - 1))
  }

  donnees = obtenirConfigurationDunFichier(['hostname', 'token', 'password', 'front_type', 'url', 'mode_nfc'], './.chromium_env')
  if (donnees.erreur === 0) {
    let motDePasse = generer_mot_de_passe(16)
    if (data.genererMotDePasse === false) {
      motDePasse = donnees.valeurs.password
    }

    let template = `#utilisateur
hostname = ${data.user}

#front
front_type = ${data.typeFront}

#url du serveur
#url = http://django-local.org:8001/wv/login_hardware
url = ${proto}://${serveur}/wv/login_hardware

#mode_nfc = NFCMO
mode_nfc = ${donnees.valeurs.mode_nfc}

password = ${motDePasse}
token =  ${donnees.valeurs.token}
`
    try {
      fs.writeFileSync(".chromium_env", template)
      client_globale.emit('modificationServeur', {erreur: 0, serveurDomaine: serveur})
      testUrl(14)
      redemarrerChromium()
    } catch (error) {
      client_globale.emit('modificationServeur', {erreur: 1})
    }
  } else {
    client_globale.emit('modificationServeur', {erreur: 1})
  }
}


let www = process.cwd() + '/www/'
console.log('www  = ', www)

function retour404(res) {
  res.writeHead(404, {'Content-Type': 'text/html'});
  res.write('Page inconnue !');
  res.end();
}

function renderHtml(contenu, ctx) {
  // let contenuTp1, contenuTp2, contenuTp3, contenuTp4
  contenu = contenu.toString()
  let rendu = contenu.toString().replace(/{{\s*[\w\.]+\s*}}/g, function (match, token) {
    let clef = match.replace(/ /g, '').replace('{{', '').replace('}}', '')
    console.log('-> match = ', match, '  --  clef = ', clef)
    return ctx[clef]
  })
  contenu = {}
  return rendu
}

// lire la conf. dans le fichier .chromium_env
donneesFichierConfiguration = obtenirConfigurationDunFichier(['hostname', 'token', 'password', 'front_type', 'url', 'mode_nfc'], './.chromium_env')

const serveur = http.createServer(function (req, res) {
  let url = req.url;

  // routes
  let ctx = {}
  if (url == '/') {
    url = 'index.html'
    ctx = {
      fontType: afficherFrontType(),
      nomAppareil: os.hostname(),
      afficherInfoServeur: afficherInfoServeur(donneesFichierConfiguration),
      urlServeur: donneesFichierConfiguration.url,
      ip: obtenirIp('public', 'ipv4'),
      typeLecteurNfc: typeLecteurNfc,
      typeserveurNfc: 'nodejs'
    }
  }

  if (url == '/favicon.ico') url = 'img/favicon2.ico'

  fichier = www + url.substring(0, url.length);

  //assets
  let posDerPoint = url.lastIndexOf('.')
  let extention = ''
  if (posDerPoint != -1) {
    extention = url.substring(posDerPoint + 1, url.length);
    if (extention.toLowerCase() == 'css') contentType = 'text/css';
    contentType = typeMime[extention.toLowerCase()];
  }

  try {
    let contenuFichier = fs.readFileSync(fichier)

    // rendre du html
    if (extention === 'html') {
      contenuFichier = renderHtml(contenuFichier, ctx)
    }

    res.writeHead(200, {"Content-Type": contentType})
    res.write(contenuFichier)
    res.end();
    console.log('-> url = ' + url + '  --  fichier :' + fichier + '  --  contentType = ' + contentType + '   -> chargé !');
  } catch (err) {
    console.log('->  url = ' + url + '  --  Erreur: ' + err)
    retour404(res);
  }

})

// --- socket.io ---
const options = {
  // allowEIO3: true,
  cors: {
    origin: "*",
    methods: ["PUT", "GET", "POST"]
  }
}
import {Server} from "socket.io";

const IO = new Server(serveur, options)
// middleware

IO.use(function (socket, next) {
  let token = socket.handshake.query.token
  // console.log('token reçu = '+token+'  --  TOKEN = '+TOKEN)
  if (token === TOKEN) {
    return next()
  } else {
    next(new Error("ERREUR d'autentification !"))
  }
})

IO.on('connection', client => {
  client_globale = client;
  client_globale.on('demandeTagId', (data) => {
    retour = data;
    console.log('-> demandeTagIdg = ' + JSON.stringify(retour))
  })

  client_globale.on('AnnuleDemandeTagId', () => {
    retour = null
  })

  client_globale.on('disconnect', () => {
    console.log('Client déconnecté !!')
  })

  client_globale.on('validerModifierWifi', (data) => {
    modifierConfigurationWifi(data)
  })

  client_globale.on('validerModifierServeur', (data) => {
    modifierConfigurationServeur(data)
  })


  client_globale.on('testerUrlServeur', (urlATester) => {
    console.log('-> test url serveur = ', urlATester)
    testUrl(12)
  })

  client_globale.on('getProfil', (urlATester) => {
    console.log('-> demande de profil.')
    returnProfil()
  })

  client_globale.on('donnerInfosWifi', () => {
    afficherInfosWifi()
  })

  client_globale.on('lancerApplication', () => {
    lancerApplication()
  })

})

// lancement serveur http
serveur.listen(PORT, ADR, () => {
  console.log(`le serveur écoute http://localhost:${PORT}`)
})

const dataConf = obtenirConfigurationDunFichier(['hostname', 'token', 'password', 'front_type', 'url', 'mode_nfc'], './.chromium_env')
lancerChromium(1, dataConf)

// --- nfc écoute ---
deviceEmitter.addListener("nfcReaderTagId", (tagId) => {
  console.log("tagId =", tagId, "  --  retour =", retour);
  if (retour !== null) {
    retour["tagId"] = tagId.toUpperCase();
    client_globale.emit("envoieTagId", retour);
    console.log("--> demande du client, envoi tag id = ");
    retour = null;
  }
  console.log("--> lecture carte, tag id = " + tagId.toUpperCase());
  client_globale.emit("tagIdChange", tagId);
});
