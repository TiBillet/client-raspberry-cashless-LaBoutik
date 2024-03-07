// initialisation
window.store = {}
const TOKEN = '$a;b2yuM5454@4!cd'
let socket = io('http://localhost:3000',{ query: { token: TOKEN} })
let serverStateOn = false, urlRedirection = ''

function popup(data) {
  let fondPopup = 'fond-header'
  if (data.typeMessage === 'alerte') {
    fondPopup = 'fond-alerte'
  }
  if (data.typeMessage === 'succes') {
    fondPopup = 'fond-ok'
  }
  let frag = `
    <div id="popup" class="${ fondPopup } l100p">
      <div id="popup-contenu" class="BF-col-haut" >
        ${ data.contenu }
      </div>
      <div id="popup-footer" class="BF-ligne fond-retour" onclick="let elePopup = document.querySelector('#popup');elePopup.parentNode.removeChild(elePopup)">RETOUR</div>
    </div>
  `
  let elePopup = document.querySelector('#popup')
  if (elePopup !== null) {
    elePopup.parentNode.removeChild(elePopup)
    document.body.insertAdjacentHTML('afterbegin', frag)
  } else {
    document.body.insertAdjacentHTML('afterbegin', frag)
  }
}


// messages divers
socket.on('afficherMsg', (retour) => {
  // exemple, retour = { contenu: retour, typeMessage: 'succes' }
  popup(retour)
})


// Réception tagId
socket.on('afficherMsgErreur', (retour) => {
  let data = {
    contenu: retour,
    typeMessage: 'alerte'
  }
  popup(data)
})

socket.on('etatUrlServeur', (retourTestUrl) => {
  console.log('-> etatUrlServeur =', retourTestUrl)
  // header 307 = redirection temporaire
  // header 308 = redirection permanente
  if(retourTestUrl.error === false) {
    document.querySelector('#info-serveur').style.color = "#00FF00"
    // bt lancer l'application
    serverStateOn = true
    urlRedirection = retourTestUrl.value
    document.querySelector('#bt-lancer-application').classList.remove('fond-pasbon')
    document.querySelector('#bt-lancer-application').classList.add('fond-ok')
  } else {
    document.querySelector('#info-serveur').style.color = "#FF0000"
    // bt lancer l'application
    serverStateOn = false
    document.querySelector('#bt-lancer-application').classList.remove('fond-ok')
    document.querySelector('#bt-lancer-application').classList.add('fond-pasbon')
  }
})

socket.on('tagIdChange', (retour) => {
  document.querySelector('#nfc').innerHTML = retour
})

socket.on('returnProfil', (retour) => {
  console.log('-> msg "returnProfil",  retour =', retour)
  const userAgent = `{"hostname":"${retour.hostname}", "token": "${retour.token}", "password":"${retour.password}","modeNfc":"${retour.mode_nfc}","front":"${retour.front_type}","ip":"${retour.ip}"}`
  console.log('userAgent =', userAgent)
  
  Object.defineProperty(navigator, 'userAgent', {
    value: userAgent
  })
})


document.addEventListener('DOMContentLoaded',function() {
  socket.emit('getProfil')
  let resolution = 'Résolution: ' + document.body.clientWidth + 'x' + document.body.clientHeight
  document.querySelector('#info-resolution-ecran').innerText = resolution
  let urlATester = document.querySelector('#info-serveur').getAttribute('data-serveur')
  if (urlATester !== '' && urlATester !== undefined) {
    socket.emit('testerUrlServeur')
  }
})


document.querySelector('#bt-lancer-application').addEventListener('click',function() {
  if (serverStateOn === true) {
    window.location = urlRedirection
  }
})
