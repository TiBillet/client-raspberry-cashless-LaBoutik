'use strict'

// pour "configurer" le lecteur nfc
// ouvrir le fichier:  sudo nano /usr/lib/pcsc/drivers/ifd-ccid.bundle/Contents/Info.plist (pour pi)
// localiser la ligne  <key>ifdDriverOptions</key>,
// la ligne suivante vaux <string>0x0000</string>,
// modifier la <string>0x0001</string>,
// sauvegarder le fichier et redémarer pcscd(sudo service pcscd restart)
// même action pour le fichier sudo nano /usr/lib/pcsc/drivers/ifd-acsccid.bundle/Contents/Info.plist (pour desktop)

import { EventEmitter } from 'node:events'
// nfc
import * as libNfc from 'nfc-pcsc'
const LIB_NFC = libNfc.NFC
const NFC = new LIB_NFC()

export const deviceEmitter = new EventEmitter()

NFC.on('error', err => {
  console.log('nfc - erreur :', err)
  deviceEmitter.emit('nfcReader', 'nfc - erreur : ' + err)
})

NFC.on('reader', reader => {
  console.log('périphérique nfc connecté !')
  // éteint le buzzer
  try {
    reader.connect('CONNECT_MODE_DIRECT').then(() => {
      console.log('connected')
      reader.setBuzzerOutput(false).then(() => {
        console.log('buzzer off')
        reader.disconnect().then(() => {
          console.log('disconnected off')
        }).catch((err) => {
          console.error('can\'t disconnect... reason', err)
        })
      }).catch((err) => {
        console.error('can\'t turn off buzz', err)
      })
    }).catch((err) => {
      console.error('can\'t connect', err)
    })
  } catch (err) {
    console.error(err)
    deviceEmitter.emit('nfcReader', err)
  }

  // si lecture carte nfc
  reader.on('card', card => {
    const resultat = card.uid.toString().toUpperCase()
      // console.log('--> envoi tagId = ' + resultat)
      deviceEmitter.emit('nfcReaderTagId', resultat)

  })

  reader.on('error', err => {
    // console.log('Erreur :', err)
    deviceEmitter.emit('nfcReader', 'Erreur : ' + err)
  })

  reader.on('end', () => {
    // console.log('Fin de lecture')
    deviceEmitter.emit('nfcReader', 'Fin de lecture')
  })
})
