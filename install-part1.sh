#git clone --branch sans_user_agent --single-branch https://github.com/TiBillet/client-raspberry-cashless-LaBoutik.git
echo "----- Update system"
apt-get update && sudo apt-get -y upgrade

# install divers
apt list --installed > log1

echo "----- install 7Zip"
apt-get install p7zip-full -y
echo "----- install git" -y
apt-get install git
echo "----- install nano"
apt-get install nano -y

apt list --installed > log2
sort log1 log2 | uniq -u > log-install-divers.txt && rm -fr log1 && rm -fr log2


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
apt-get update -y
apt-get install nodejs -y

apt list --installed > log2
sort log1 log2 | uniq -u > log-install-node20.txt && rm -fr log1 && rm -fr log2


# install X11 + openbox
apt list --installed > log1

echo "----- installxorg"
apt-get install xserver-xorg -y
echo "----- install x11"
apt-get install x11-xserver-utils -y
echo "----- install xinit"
apt-get install xinit -y
echo "----- install fbturbo"
apt-get install xserver-xorg-video-fbturbo -y
echo "----- install xdtool"
apt-get install xdotool -y
echo "----- install openbox"
apt-get install openbox -y

apt list --installed > log2
sort log1 log2 | uniq -u > log-install-x11-openbox.txt && rm -fr log1 && rm -fr log2

# config startx
if grep "#modif bashrc = ok" /home/sysop/.bashrc > /dev/null
then
 echo 'bashrc déjà modifié pour auto startx !'
else
 echo 'export TYPE_SERVEUR_NFC=VMA405' >> /home/sysop/.bashrc
 echo '#modif bashrc = ok' >> /home/sysop/.bashrc
 echo '[[ -z $DISPLAY && $XDG_VTNR -eq 1 ]] && startx -- -nocursor' >> /home/sysop/.bashrc
fi
