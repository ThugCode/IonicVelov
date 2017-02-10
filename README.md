# IonicVelov
Application Ionic utilisant la base de données velo'v 

Installation de Ionic & Cordova
-------
* sudo npm install npm -g
* sudo npm install ionic -g
* sudo npm install cordova -g

Copie d'un template "tutorial"
-------
ionic start IonicVelov tutorial --v2

Ajout de plateformes
-------
* ionic platform add android
* ionic platform add ios

Plugins utilisés
-------
* cordova-plugin-whitelist
* cordova-plugin-console
* cordova-plugin-statusbar
* cordova-plugin-device
* cordova-plugin-splashscreen
* ionic-plugin-keyboard
* cordova-plugin-file
* cordova-plugin-email
* cordova-plugin-geolocation
* cordova-plugin-network-information
* cordova-plugin-vibration
* https://github.com/VersoSolutions/CordovaClipboard.git
* cordova-plugin-nativestorage

MAJ splashscreen & icone
-------
* ionic resources --splash
* ionic resources --icon

Run & build
-------
* ionic serve --lab
* ionic build ios
* ionic build android
