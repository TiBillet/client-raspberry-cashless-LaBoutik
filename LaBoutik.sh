#!/bin/bash
set -e
# usage : ./LaBoutik.sh password token protocole serveur rotate nfc
# sudo ./LaBoutik.sh toto "$a;b2yuM5454@4cd" https VotreDomaine.cashless.tibillet.re 3 gpio


hostname=$(hostname)
frontType="FPI"
password="$1"
token="$2"
protocole="$3"
serveur="$4"
rotate="$5"
nfc="$6"
# Vérifier si le nombre d'arguments est correct
if [ "$#" -ne 6 ]; then
    echo "Usage: $0 password token protocole serveur rotate nfc 
    password = toto
    token = titi
    protocole = http si local https si serveur distant
    rotate :rotation de l'ecran : 0 -> Normal , 1 -> 90°, 2 -> 180°, 3 -> 270°
    nfc = USB (Si lecteur NFC USB), si Lecteur sur GPIO, nfc=GPIO "
    exit 1
fi

echo "----- Maj"
apt-get update && apt-get -y upgrade >> installation.log 2>&1
echo "----- install Git"
apt-get install git -y >> installation.log 2>&1

#Git Clone
echo "----- clonage du depot"

git clone --branch Mike-sh --single-branch https://github.com/samijuju/installRaspberry.git >> installation.log 2>&1

# copie de tous les fichiers ds /home/sysop
cp -r /home/sysop/installRaspberry/* /home/sysop/ >> installation.log 2>&1
#cd /home/sysop >> installation.log 2>&1

echo "----- install 7Zip"
apt-get install p7zip-full -y >> installation.log 2>&1
echo "----- installxorg"
apt-get install xserver-xorg -y >> installation.log 2>&1
echo "----- install x11"
apt-get install x11-xserver-utils -y >> installation.log 2>&1
echo "----- install xinit"
apt-get install xinit -y >> installation.log 2>&1
echo "----- install fbturbo"
apt-get install xserver-xorg-video-fbturbo -y >> installation.log 2>&1
echo "----- install xdtool"
apt-get install xdotool -y >> installation.log 2>&1
echo "----- install openbox"
apt-get install openbox -y >> installation.log 2>&1
echo "----- install chromium...Prends un café c'est un peut long :) "
apt-get install chromium-browser -y >> installation.log 2>&1
#echo "fin"

#Ajout lancement serveur X (startx)
if grep -q "modif bashrc = ok" /home/sysop/.bashrc 
then
    echo "-----modif bashrc deja modifié"
else
    echo "-----modif bashrc"
    echo "export TYPE_SERVEUR_NFC=$nfc" >> /home/sysop/.bashrc
    echo "#modif bashrc = ok" >> /home/sysop/.bashrc
    echo '[[ -z $DISPLAY && $XDG_VTNR -eq 1 ]] && startx -- -nocursor' >> /home/sysop/.bashrc
fi

# changement des droits
chown sysop:sysop /home/sysop/autostart 
chmod 0770 /home/sysop/autostart 
echo "----- Remplacer le fichier autostart"
#Remplacer le fichier autostart
cp /home/sysop/autostart /etc/xdg/openbox/autostart

echo "----- Config Ecran"
#Config Ecran
##Création du dossier repos "LCD-show"
if [ ! -d /home/sysop/LCD-show ] ; then 
    #mkdir /home/sysop/LCD-show
    git clone https://github.com/goodtft/LCD-show.git >> installation.log 
    chown -R sysop:sysop /home/sysop/LCD-show >> installation.log 
    chmod 0775 /home/sysop/LCD-show >> installation.log 
    sed -i "s|^sudo reboot$|# remove sudo reboot|" "/home/sysop/LCD-show/LCD7C-show" 
    sed -i "s|^echo \"reboot now\"$|# remove reboot now|" "/home/sysop/LCD-show/LCD7C-show" 
    chmod +x /home/sysop/LCD-show/LCD7C-show 
    cd /home/sysop/LCD-show
    ./LCD7C-show 2>&1 | tee -a installation.log
    echo "hdmi:capacity:7C-1024x600:0:1024:600" > /root/.have_installed 
fi

if [ "$rotate" -eq 0 ]; then
    sed -i '/Option "CalibrationMatrix"/c        Option "CalibrationMatrix" "1 0 0 0 1 0 0 0 1"' /etc/X11/xorg.conf.d/40-libinput.conf
elif [ "$rotate" -eq 1 ]; then
    sed -i '/Option "CalibrationMatrix"/c        Option "CalibrationMatrix" "0 1 0 0 -1 1 0 0 1"' /etc/X11/xorg.conf.d/40-libinput.conf
elif [ "$rotate" -eq 2 ]; then
    sed -i '/Option "CalibrationMatrix"/c        Option "CalibrationMatrix" "-1 0 1 0 -1 1 0 0 1"' /etc/X11/xorg.conf.d/40-libinput.conf
elif [ "$rotate" -eq 3 ]; then
    sed -i '/Option "CalibrationMatrix"/c        Option "CalibrationMatrix" "0 -1 1 1 0 0 0 0 1"' /etc/X11/xorg.conf.d/40-libinput.conf

fi

echo "----- Configuration de config.txt"
# Configuration de config.txt
echo "display_rotate=$rotate" >> /boot/config.txt
####
echo "install libpcsclite1"
apt-get install libpcsclite1 -y >> installation.log 2>&1
echo "install libpcsclite-dev"
apt-get install libpcsclite-dev -y >> installation.log 2>&1
echo "install pcscd"
apt-get install pcscd -y >> installation.log 2>&1
echo "install pcsc-tools"
apt-get install pcsc-tools -y >> installation.log 2>&1
####
echo "----- cas lecteur NFC USB"
###cas lecteur NFC USB
if echo "$nfc" | grep -i "usb"; then
    
    #Copie du fichier blacklist.conf (ne pas déscativer ses modules)
    rsync -a --backup --suffix=.bak ./blacklist.conf /etc/modprobe.d/blacklist.conf
    chown sysop:sysop /etc/modprobe.d/blacklist.conf
    chmod 0775 /etc/modprobe.d/blacklist.conf
### fin usb

echo "----- cas lecteur NFC GPIO"
###cas GPIO
elif echo "$nfc" | grep -i "gpio"; then
    chown root:gpio /dev/gpiomem
    chmod g+rw /dev/gpiomem
    usermod -a -G gpio $USER
    usermod -a -G spi $USER
    usermod -a -G netdev $USER
### fin GPIO
fi

apt-get install -y ca-certificates curl gnupg -y
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/nodesource.gpg
#NODE_MAJOR=18
NODE_MAJOR=20
echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
#Maj des paquets
apt-get update -y
apt-get install nodejs -y

echo "----- install gcc"
apt-get install gcc -y >> installation.log 2>&1
echo "----- install g++"
apt-get install g++ -y >> installation.log 2>&1
echo "----- install make"
apt-get install make -y >> installation.log 2>&1
echo "----- install apt-transport-https"
apt-get install apt-transport-https -y >> installation.log 2>&1

cd /home/sysop/
chmod -R 774 serveurNfcNodeJs
chown -R root:sysop  serveurNfcNodeJs
# echo "-----------------------1"

echo "----- Installer les modules node js pour serveurNfc"
#Installer les modules node js pour serveurNfc
cd /home/sysop/serveurNfcNodeJs
npm install >> installation.log 2>&1

echo "----- Maj .chromium_env"
cp /home/sysop/serveurNfcNodeJs/chromium_env.exemple /home/sysop/serveurNfcNodeJs/.chromium_env
echo "Maj .chromium_env"
sed -i "/^hostname = */c hostname = $hostname" /home/sysop/serveurNfcNodeJs/.chromium_env
sed -i "/^front_type = */c front_type = $frontType" /home/sysop/serveurNfcNodeJs/.chromium_env
sed -i "/^password = */c password = $password" /home/sysop/serveurNfcNodeJs/.chromium_env
sed -i "/^token = */c token = $token" /home/sysop/serveurNfcNodeJs/.chromium_env
sed -i "/^url = */c url = $protocole://$serveur/wv/login_hardware" /home/sysop/serveurNfcNodeJs/.chromium_env

#Autologin mode console
raspi-config nonint do_boot_behaviour B2

#installe "splash screen"
echo "-----install splash screen"
apt-get install rpd-plym-splash -y >> installation.log 2>&1

#Installation de "fbi", pour visualiser le splash screen(logo)
echo "----- Installation de fbi, pour visualiser le splash screen(logo)"
apt-get install fbi -y >> installation.log 2>&1

#Suppression du logo raspberry pi, modification du fichier /boot/cmdline.txt
echo "----- Suppression du logo raspberry pi, modification du fichier /boot/cmdline.txt"
echo "\nconsoleblank=0 loglevel=1 quiet logo.nologo" >> /boot/cmdline.txt

#Autoriser startx
echo "----- Autoriser startx"
sed -i "s/quiet splash plymouth.ignore-serial-consoles//" /boot/cmdline.txt

#Copie du fichier du service "splashscreen.service"
echo "----- Copie du fichier du service splashscreen.service"
cd /home/sysop
rsync -a --backup --suffix=.bak ./splashscreen.service /etc/systemd/system/splashscreen.service
chmod 774 /etc/systemd/system/splashscreen.service
chown sysop:sysop  /etc/systemd/system/splashscreen.service

#Activer "splashscreen.service"
echo "----- Activer splashscreen.service"
sudo systemctl enable splashscreen.service

#Démarrer "splashscreen.service"
echo "----- Démarrer splashscreen.service"
sudo systemctl start splashscreen.service

#Fin Reboot
echo "----- reboot"
reboot now 
