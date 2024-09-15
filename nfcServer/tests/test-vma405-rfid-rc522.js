// nfc ACR122U
//import {deviceEmitter} from "./www/js/jsModules/devices/acr122u-u9.js"
// ou nfc VMA405 = rfid-rc522
import { deviceEmitter } from "../modules/devices/vma405-rfid-rc522.js"


// --- nfc écoute ---
deviceEmitter.addListener("nfcReaderTagId", (tagId) => {
  console.log("tagId =", tagId)
})
