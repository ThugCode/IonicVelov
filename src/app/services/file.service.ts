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
            this.checkFile();
        }
    }

    /*
    checkDir(id) {
        File.checkDir(this.filePath, '').then(_ => {
            console.log('Dossier existant');
        }).catch(err => {
            console.log('Création du dossier');
            File.createDir(this.filePath, '', true);
        });
    }*/
    
    checkFile() {
        File.checkFile(cordova.file.dataDirectory, "favorites.txt")
            .then(function (success) {
            console.log('Fichier existant');
        }, function (error) {
            console.log('Création du fichier '+cordova.file.dataDirectory);
            File.createFile(cordova.file.dataDirectory, "favorites.txt", true);
        });
        
    }

    readStationFromFile(): Promise<any[]> {
        return File.readAsText(cordova.file.dataDirectory, "favorites.txt").then(success => { 
            var favorites = [];
            var read = success.toString().split("%");
            read.forEach(element => {
                if(element != "") favorites.push(element);
            });
            return favorites;
        })
        .catch(err => { 
            console.log('Fichier inexistant') 
            console.log(err)
            return [];
        });
    }

    addStationToFile(id) {

        File.readAsText(cordova.file.dataDirectory, "favorites.txt").then(success => { 
            var favorites = "";
            var read = success.toString().split("%");
            read.forEach(element => {
                if(element != "") favorites += element+"%";
            });
            favorites += id;
            File.writeFile(cordova.file.dataDirectory, "favorites.txt", favorites, true);
        })
        .catch(err => { 
            console.log('Fichier inexistant') 
            console.log(err)
        });
    }

    removeStationToFile(id) {

        File.readAsText(cordova.file.dataDirectory, "favorites.txt").then(success => { 
            var favorites = "";
            var read = success.toString().split("%");
            read.forEach(element => {
                if(element != id.toString()) favorites += element+"%";
            });
            File.writeFile(cordova.file.dataDirectory, "favorites.txt", favorites, true);
        })
        .catch(err => { 
            console.log('Fichier inexistant') 
            console.log(err)
        });
    }
}