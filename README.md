# Creating a LaBoutik terminal from a bash script
## Quick Start

Create a  PI OS Legacy 32 bit Lite  via Raspberry Pi Imager

On Raspberry Pi Imager :
- put user " sysop" ( not an another)
- put your wifi config
- Put your ssh key ( yes we can with new version :) )

Boot your Pi

Connect it via ssh

```
#updates the package list
sudo apt-get update
#install git on your Pi
sudo apt-get install git -y
#git clone this repro
git clone https://github.com/TiBillet/client-raspberry-cashless-LaBoutik
#go to the repositorie
cd client-raspberry-cashless-LaBoutik
#permit exec
sudo chmod +x LaBoutik.sh
```
run the script
> Note: Run the script, without parameters, is for an installation hosted by Tibillet with the default settings.
> If you have hosted your own server, read more below
```
sudo ./LaBoutik.sh 
```

And take a coffe :)

## if you use your own server :
run the script like this

sudo ./LaBoutik.sh nfc_type <> server_pin_code <> nfc_server_port <> nfc_server_address <> nfc_server_version <> front_type rotate

with :
nfc_type : gpio or usb

server_pin_code : Your pin code server adress

nfc_server_port: by default :3000

nfc_server_address: by default :localhost

nfc_server_version: by default(to day) :2.24.04.11.15.58

front_type:for raspberry : FPI for laptop: FPO

rotate: 0 -> Normal , 1 -> 90°, 2 -> 180°, 3 -> 270°

## Troubleshooting :
#### After "sudo apt-get install git -y" I have return "E: Unable to fetch some archives, maybe run apt-get update or try with --fix-missing?"
Make sudo apt-get update and try again

