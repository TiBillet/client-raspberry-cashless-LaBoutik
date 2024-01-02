# Creating a LaBoutik terminal from a bash script
## Quick Start
Create a  PI OS Legacy 32 bit Lite  via Raspberry Pi Imager
- put user " sysop" ( not an another)
- put your wifi config
- Put your ssh key

Boot your Pi

Connect it via ssh

Copy LaBoutik.sh to your pi

```
chmod +x LaBoutik.sh

sudo ./LaBoutik.sh password token protocole serveur rotate nfc
```
- Password & token ( given from server instance)
- Protocole : http for local , https for web acces
- server : server address (without //http*)
- rotate : 0 -> Normal , 1 -> 90°, 2 -> 180°, 3 -> 270°
- nfc : if usb reader : usb , if GPIO reader : gpio
And take a coffe :)

## Details of operations :
coming soon ...
