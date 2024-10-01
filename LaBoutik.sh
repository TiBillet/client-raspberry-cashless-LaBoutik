#!/bin/bash
set -e
 
nfc="$1"
server_pin_code="$2"
nfc_server_port="$3"
nfc_server_address="$4"
nfc_server_version="$5"
front_type="$6"
rotate="$7"
# Verifier si le nombre d'arguments est correct sinon valeurs par defaut
if [ "$#" -ne 7 ]; then
	read -p "Usage: $0 type_nfc server_pin_code nfc_server_port nfc_server_address nfc_server_version front_type rotate
	 ---- Vous allez continuer avec les valeurs par defaut (y/n):---- " choix 
		if [ "$choix" != "Y" ] && [ "$choix" != "y" ]; then
		echo "Arrêt du script."
		exit 1
		elif [ "$choix" != "N" ] && [ "$choix" != "n" ]; then
		echo "Le script continue avec les valeurs par défaut."
		fi

	nfc="gpio"
	server_pin_code="https://discovery.tibillet.coop"
	nfc_server_port=3000
	nfc_server_address="localhost"
	nfc_server_version="2.24.04.11.15.58"
	rotate=3
	front_type="FPI"
fi
echo "valeurs par defaut : $nfc $server_pin_code $nfc_server_port $nfc_server_address $nfc_server_version $front_type"

# update
echo "----- Update system"
apt-get update && sudo apt-get -y upgrade

# install divers
apt list --installed > log1


# install node 20.xx
apt list --installed > log1

echo "----- install gcc"
apt-get install gcc -y
echo "----- install g++"
apt-get install g++ -y
echo "----- install make"
apt-get install make -y
echo "----- install apt-transport-https"
apt-get install apt-transport-https -y

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

# install X11 + openbox
apt list --installed > log1

echo "----- installxorg"
apt-get install xserver-xorg -y
echo "----- install x11"
apt-get install x11-xserver-utils -y
echo "----- install xinit"
apt-get install xinit -y

if ! grep -q "Pi 4 Model" /proc/cpuinfo; then
  echo "ce n'est pas un Pi4"
  echo "----- install fbturbo"
  apt-get install xserver-xorg-video-fbturbo -y
else
  echo "C un PI4"
fi

echo "----- install xdtool"
apt-get install xdotool -y
echo "----- install openbox"
apt-get install openbox -y

apt list --installed > log2
sort log1 log2 | uniq -u > log-install-x11-openbox.txt && rm -fr log1 && rm -fr log2

# install chromium
apt list --installed > log1

echo "----- install chromium...Prends un café c'est un peut long :) "
apt-get install chromium-browser -y

apt list --installed > log2
sort log1 log2 | uniq -u > log-install-chromium.txt && rm -fr log1 && rm -fr log2

# config startx
echo "----- config startx"
if grep "#modif bashrc = ok" /home/sysop/.bashrc > /dev/null
then
 echo 'bashrc déjà modifié pour auto startx !'
else
 echo 'export TYPE_SERVEUR_NFC=VMA405' >> /home/sysop/.bashrc
 echo '#modif bashrc = ok' >> /home/sysop/.bashrc
 echo '[[ -z $DISPLAY && $XDG_VTNR -eq 1 ]] && startx -- -nocursor' >> /home/sysop/.bashrc
fi

# nfc usb et gpio
echo "----- config lecteur nfc"
if [ $nfc = 'gpio' ]
then
  # gpio
  echo "dtparam=spi=on" >> /boot/config.txt
  usermod -a -G gpio $USER
  usermod -a -G spi $USER
  usermod -a -G netdev $USER
  chown root:gpio /dev/gpiomem
  chmod g+rw /dev/gpiomem
  rm -fr /etc/modprobe.d/blacklist-nfc-usb.conf
else
  # usb
  echo "----- install libpcsclite1"
  apt-get install libpcsclite1 -y
  echo "----- install libpcsclite-dev"
  apt-get install libpcsclite-dev -y
  echo "----- install pcscd"
  apt-get install pcscd -y
  echo "----- install pcsc-tools"
  apt-get install pcsc-tools -y
  # configuration
  echo "install nfc /bin/false" > /etc/modprobe.d/blacklist-nfc-usb.conf
  echo "install pn533 /bin/false"  >> /etc/modprobe.d/blacklist-nfc-usb.conf
  chown root:root /etc/modprobe.d/blacklist-nfc-usb.conf
  chmod 0644 /etc/modprobe.d/blacklist-nfc-usb.conf
fi

# creation .env.js
echo "----- Création .env.js"
echo "export const env = {" > ./nfcServer/.env.js
echo '  '\"mode_nfc\": \"NFCLO\", >> ./nfcServer/.env.js
echo '  '\"front_type\": \"$front_type\", >> ./nfcServer/.env.js
echo '  '\"server_pin_code\": \"$server_pin_code\",  >> ./nfcServer/.env.js
echo '  '\"servers\": [], >> ./nfcServer/.env.js
echo '  '\"client\": null, >> ./nfcServer/.env.js
echo '  '\"current_server\": \"\", >> ./nfcServer/.env.js
echo '  '\"nfc_server_port\": $nfc_server_port, >> ./nfcServer/.env.js
echo '  '\"nfc_server_address\": \"$nfc_server_address\", >> ./nfcServer/.env.js
echo '  '\"exeChromium\": \"chromium-browser\", >> ./nfcServer/.env.js
echo '  '\"dev\": false, >> ./nfcServer/.env.js
echo '  '\"version\": \"$nfc_server_version\", >> ./nfcServer/.env.js
echo '  '\"logLevel\": 1, >> ./nfcServer/.env.js
if [ $nfc = 'gpio' ]
then
  # gpio
  echo '  '\"device\": \"vma405-rfid-rc522\"  >> ./nfcServer/.env.js
else
  # usb
  echo '  '\"device\": \"acr122u-u9\"  >> ./nfcServer/.env.js
fi
echo "}" >> ./nfcServer/.env.js

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
  "address":"^2.0.3",
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

echo "${JSON_STRING}" > ./nfcServer/package.json
echo "${JSON_STRING2}" >> ./nfcServer/package.json

# installation of nfc server modules
echo "----- install nfcServer"
cd nfcServer
npm i

echo "Config ecran"
sudo cp -rf /home/sysop/client-raspberry-cashless-LaBoutik/src/99-fbturbo.conf /usr/share/X11/xorg.conf.d/99-fbturbo.conf
sudo cp /home/sysop/client-raspberry-cashless-LaBoutik/src/40-libinput.conf /etc/X11/xorg.conf.d/40-libinput.conf
  if grep -qE "^dtoverlay=vc4-kms-v3d" "/boot/config.txt"; then
  sed -i "s|^dtoverlay=vc4-kms-v3d|#dtoverlay=vc4-kms-v3d|" "/boot/config.txt"
  fi
params=("hdmi_force_hotplug=1" "dtparam=i2c_arm=on" "dtparam=spi=on" "enable_uart=1" "display_rotate="$rotate "max_usb_current=1"  "config_hdmi_boost=7" "hdmi_group=2" "hdmi_mode=87" "hdmi_drive=1" "hdmi_cvt 1024 600 60 6 0 0 0")

for element in "${params[@]}"; do
  if ! grep -qE "^[^#]*\b${element%=*}=" "/boot/config.txt"; then
    echo "$element" >> "/boot/config.txt"
  else
    sed -i "s|^[^#]*\b${element%=*}=.*|$element|" "/boot/config.txt"
  fi
done

##############
if [ "$rotate" -eq 0 ]; then
    sed -i '/Option "CalibrationMatrix"/c        Option "CalibrationMatrix" "1 0 0 0 1 0 0 0 1"' /etc/X11/xorg.conf.d/40-libinput.conf
elif [ "$rotate" -eq 1 ]; then
    sed -i '/Option "CalibrationMatrix"/c        Option "CalibrationMatrix" "0 1 0 -1 0 1 0 0 1"' /etc/X11/xorg.conf.d/40-libinput.conf
elif [ "$rotate" -eq 2 ]; then
    sed -i '/Option "CalibrationMatrix"/c        Option "CalibrationMatrix" "-1 0 1 0 -1 1 0 0 1"' /etc/X11/xorg.conf.d/40-libinput.conf
elif [ "$rotate" -eq 3 ]; then
    sed -i '/Option "CalibrationMatrix"/c        Option "CalibrationMatrix" "0 -1 1 1 0 0 0 0 1"' /etc/X11/xorg.conf.d/40-libinput.conf
fi


#Autologin mode console
raspi-config nonint do_boot_behaviour B2

# configuration x11 et demarrage du serveur nfc
echo "----- configuration x11 et demarrage du serveur nfc"
echo  > /etc/xdg/openbox/autostart
echo '# stop veille/économie dénergie' >> /etc/xdg/openbox/autostart
echo 'xset dpms 0 0 0 && xset s noblank  && xset s off' >> /etc/xdg/openbox/autostart
echo  >> /etc/xdg/openbox/autostart
echo '# vidage du cache chromium' >> /etc/xdg/openbox/autostart
echo rm -fr /home/sysop/.cache/chromium >> /etc/xdg/openbox/autostart
echo  >> /etc/xdg/openbox/autostart
echo '# lance le seveur nfc' >> /etc/xdg/openbox/autostart
echo cd /home/sysop/client-raspberry-cashless-LaBoutik/nfcServer/ >> /etc/xdg/openbox/autostart
echo node nfcServer.js  >> /etc/xdg/openbox/autostart

chown root:root /etc/xdg/openbox/autostart
chmod 755 /etc/xdg/openbox/autostart

# nfcServer owner
chown sysop:sysop /home/sysop/client-raspberry-cashless-LaBoutik/nfcServer

if grep -q "Pi 4 Model" /proc/cpuinfo; then
  echo "C un Pi4"
  echo "----- sudo rm /usr/share/X11/xorg.conf.d/*.*"
  sudo rm /usr/share/X11/xorg.conf.d/*.*
fi

echo "-----Fin du script, Reboot"
reboot
