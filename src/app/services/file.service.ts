import { Injectable } from '@angular/core';
import { File } from 'ionic-native';
import { Platform } from 'ionic-angular';

declare var cordova: any;

@Injectable()
export class FileService {

    filePath: string;

    constructor(
        private platform: Platform
    ) {
        if (this.platform.is('mobile')) {
            this.filePath = cordova.file.dataDirectory;
        }
    }

    checkDir(id) {
        File.checkDir(this.filePath, '').then(_ => {
            console.log('Dossier existant');
            this.checkFile(id);
        }).catch(err => {
            console.log('Création du dossier');
            File.createDir(this.filePath, '', true);
            this.checkFile(id);
        });
    }
    
    checkFile(id) {
        
        File.checkFile(cordova.file.dataDirectory, "favorites.txt")
        .then(function (success) {
            console.log('Fichier existant');
            this.writeFile(id);
        }, function (error) {
            console.log('Création du fichier '+cordova.file.dataDirectory);
            File.createFile(cordova.file.dataDirectory, "favorites.txt", true);
            this.writeFile(id);
        });
    }

    writeFile(id) {
        //File.getFile()
        console.log('WRITE FILE');
        var str = File.readAsText(cordova.file.dataDirectory, "favorites.txt");
        console.log(str);
        File.readAsText(cordova.file.dataDirectory, "favorites.txt").then(success => { 
            console.log('Fichier existant');
            var favorites = "";
            var read = success.toString().split("%");
            console.log(read);
            read.forEach(element => {
                favorites += element+"%";
            });
            favorites += id;
            console.log(favorites);
            File.writeFile(cordova.file.dataDirectory, "favorites.txt", favorites, true);
        })
        .catch(err => { 
            console.log('Fichier inexistant') 
        });
    }
}