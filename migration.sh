#!/bin/bash
#Migration de la version avant 2024 avec user agent avec la version sans user agent ( avec un PIN code)
set -e

nfc="gpio"
server_pin_code="https://discovery.tibillet.coop"
nfc_server_port=3000
nfc_server_address="localhost"
nfc_server_version="2.24.04.11.15.58"
rotate=3
front_type="FPI"


apt-get install -y ca-certificates curl gnupg -y
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/nodesource.gpg
NODE_MAJOR=20
echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
apt-get update
apt-get install nodejs -y
apt list --installed > log2
sort log1 log2 | uniq -u > log-inecho rm -fr /home/sysop/.config/chromium/Default/ >> /etc/xdg/openbox/autostartstall-node20.txt && rm -fr log1 && rm -fr log2

# addon nodejs
npm install -g node-gyp
npm install -g rebuild

if [ ! -d /home/sysop/client-raspberry-cashless-LaBoutik ] ; then 
  git clone https://github.com/TiBillet/client-raspberry-cashless-LaBoutik
fi
cp client-raspberry-cashless-LaBoutik/startNfcServer /home/sysop/startNfcServer

# creation .env.js
echo "----- Création .env.js"
echo "export const env = {" > ./client-raspberry-cashless-LaBoutik/nfcServer/.env.js
echo '  '\"mode_nfc\": \"NFCLO\", >> ./client-raspberry-cashless-LaBoutik/nfcServer/.env.js
echo '  '\"front_type\": \"$front_type\", >> ./client-raspberry-cashless-LaBoutik/nfcServer/.env.js
echo '  '\"server_pin_code\": \"$server_pin_code\",  >> ./client-raspberry-cashless-LaBoutik/nfcServer/.env.js
echo '  '\"servers\": [], >> ./client-raspberry-cashless-LaBoutik/nfcServer/.env.js
echo '  '\"client\": null, >> ./client-raspberry-cashless-LaBoutik/nfcServer/.env.js
echo '  '\"current_server\": \"\", >> ./client-raspberry-cashless-LaBoutik/nfcServer/.env.js
echo '  '\"nfc_server_port\": $nfc_server_port, >> ./client-raspberry-cashless-LaBoutik/nfcServer/.env.js
echo '  '\"nfc_server_address\": \"$nfc_server_address\", >> ./client-raspberry-cashless-LaBoutik/nfcServer/.env.js
echo '  '\"exeChromium\": \"chromium-browser\", >> ./client-raspberry-cashless-LaBoutik/nfcServer/.env.js
echo '  '\"dev\": false, >> ./client-raspberry-cashless-LaBoutik/nfcServer/.env.js
echo '  '\"version\": \"$nfc_server_version\", >> ./client-raspberry-cashless-LaBoutik/nfcServer/.env.js
echo '  '\"logLevel\": 1, >> ./client-raspberry-cashless-LaBoutik/nfcServer/.env.js
if [ $nfc = 'gpio' ]
then
  # gpio
  echo '  '\"device\": \"vma405-rfid-rc522\"  >> ./client-raspberry-cashless-LaBoutik/nfcServer/.env.js
else
  # usb
  echo '  '\"device\": \"acr122u-u9\"  >> ./client-raspberry-cashless-LaBoutik/nfcServer/.env.js
fi
echo "}" >> ./client-raspberry-cashless-LaBoutik/nfcServer/.env.js

# creation package.json
echo "----- Création package.json"
JSON_STRING='{
"name":"client-raspberry-cashless-laboutik",
"version":"1.0.0",
"description":"serveur nfc",
"main":"serveur_nfc.js",
"type":"module",
"license": "ISC",
"dependencies":{
  "local-ip-url":"^1.0.10",
  "socket.io": "^4.7.2",
  "@sentry/node": "^7.106.0",
  "@sentry/profiling-node": "^7.106.0",
  "slugify": "^1.6.6",
  "http-proxy": "^1.18.1",'

if [ $nfc = 'gpio' ]
  then
    # gpio
    JSON_STRING2='"rpi-softspi": "^1.0.5", "rpio": "^2.4.2"}}'
  else
    # usb
    JSON_STRING2='"nfc-pcsc": "^0.8.1"}}'
  fi

echo "${JSON_STRING}" > ./client-raspberry-cashless-LaBoutik/nfcServer/package.json
echo "${JSON_STRING2}" >> ./client-raspberry-cashless-LaBoutik/nfcServer/package.json

# installation  nfc server modules
echo "----- install nfcServer"
cd client-raspberry-cashless-LaBoutik/nfcServer
npm i

#remplacer le lancement du server nfc
if  grep -qE "^[^#]*cd /home/sysop/serveurNfcNodeJs/" "/etc/xdg/openbox/autostart"; then
  sed -i "s|^[^#]*cd /home/sysop/serveurNfcNodeJs/.*|cd /home/sysop/client-raspberry-cashless-LaBoutik/nfcServer/|" "/etc/xdg/openbox/autostart"
fi
  
if  grep -qE "^[^#]*node serveur_nfc.js" "/etc/xdg/openbox/autostart"; then
  sed -i "s|^[^#]*node serveur_nfc.js.*|node nfcServer.js|" "/etc/xdg/openbox/autostart" "/etc/xdg/openbox/autostart"
fi

echo "-----Fin du script, Reboot"
reboot
