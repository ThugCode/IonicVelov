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

Ajout de plugins
-------
* cordova plugin add cordova-plugin-geolocation
* cordova plugin add cordova-plugin-file
* ionic plugin add https://github.com/VersoSolutions/CordovaClipboard.git;

Run & build
-------
* ionic serve --lab
* ionic build ios
* ionic build android
