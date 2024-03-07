// si problême de droit
// sudo chown root:gpio /dev/gpiomem
// sudo chmod g+rw /dev/gpiomem
// sudo chmod g+rw /dev/gpiomem
// sudo usermod -a -G gpio $USER
// sudo usermod -a -G spi $USER
// sudo usermod -a -G netdev $USER

"use strict"
import { EventEmitter } from 'node:events'
import * as pkgMfrc522 from "@efesoroglu/mfrc522-rpi"
import * as pkgRpiSoftspi from "rpi-softspi"

const Mfrc522 = pkgMfrc522.default 
const SoftSPI = pkgRpiSoftspi.default

export const deviceEmitter = new EventEmitter()

deviceEmitter.emit('nfcReader', 'scanning...')

const softSPI = new SoftSPI({
  clock: 23, // pin number of SCLK
  mosi: 19, // pin number of MOSI
  miso: 21, // pin number of MISO
  client: 24 // pin number of CS
});

// GPIO 24 can be used for buzzer bin (PIN 18), Reset pin is (PIN 22).
// const mfrc522 = new Mfrc522(softSPI).setResetPin(22).setBuzzerPin(18);
const mfrc522 = new Mfrc522(softSPI).setResetPin(22)

setInterval(function() {
  //# reset card
  mfrc522.reset();

  // Scan for cards
  let response = mfrc522.findCard();
  if (!response.status) {
    // console.log("No Card");
    return;
  }

  // Get the UID of the card
  response = mfrc522.getUid();
  if (!response.status) {
    deviceEmitter.emit('nfcReader', 'UID Scan Erro')
    return;
  }

  // If we have the UID, continue
  const uid = response.data;
  let resultat = ''
  for(let i=0; i < 4; i++){
    let lettre = uid[i].toString(16).toUpperCase()
    if(uid[i].toString(16).length === 1) {
      resultat += '0' + lettre
    } else {
      resultat += lettre
    }
  }
  // resultat
  deviceEmitter.emit('nfcReaderTagId',resultat)

  // Stop
  mfrc522.stopCrypto();
}, 500);
