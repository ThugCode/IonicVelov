import { Injectable } from '@angular/core';
import { File } from 'ionic-native';
import { Platform } from 'ionic-angular';
import { Station } from '../models/station';

declare var cordova: any;

const FILE_OFFLINE = "stationsOffline.txt";
const FILE_FAVORITE = "favorites.txt";

@Injectable()
export class FileService {

    filePath: string;

    constructor(
        private platform: Platform
    ) { 
        //this.init();
    }

    init() {
        if (this.platform.is('cordova')) {
            this.filePath = cordova.file.dataDirectory;
            this.checkFileFavorites();
            this.checkFileOffline();
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

    checkFileFavorites() {
        if (this.platform.is('cordova')) {
            this.filePath = cordova.file.dataDirectory;
            File.checkFile(this.filePath, FILE_FAVORITE)
                .then(function (success) {}, function (error) {
                    console.log('Fichier inexistant')
                    File.createFile(this.filePath, FILE_FAVORITE, true);
                });
        }
    }

    checkFileOffline() {
        if (this.platform.is('cordova')) { 
            this.filePath = cordova.file.dataDirectory;
            File.checkFile(this.filePath, FILE_OFFLINE)
                .then(function (success) {}, function (error) {
                    console.log('Fichier inexistant')
                    File.createFile(this.filePath, FILE_OFFLINE, true);
                });
        }
    }

    readSationOffline(): Promise<Station[]> {
        if (this.platform.is('cordova')) {
            this.filePath = cordova.file.dataDirectory;
            return File.readAsText(this.filePath, FILE_OFFLINE).then(success => {
                return JSON.parse(success.toString());
            })
            .catch(err => {
                console.log('Fichier inexistant')
                console.log(err)
                return [];
            })
        } else {
            return Promise.all([]);
        }
    }

    writeStationOffline(json) {
        if (this.platform.is('cordova')) {
            this.filePath = cordova.file.dataDirectory;
            var toFile = JSON.stringify(json);
            File.writeFile(this.filePath, FILE_OFFLINE, toFile, true);
        }
    }

    readFavoritesFromFile(): Promise<any[]> {
        if (this.platform.is('cordova')) {
            this.filePath = cordova.file.dataDirectory;
            return File.readAsText(this.filePath, FILE_FAVORITE).then(success => {
                var favorites = [];
                var read = success.toString().split("%");
                read.forEach(element => {
                    if (element != "") favorites.push(element);
                });
                return favorites;
            })
            .catch(err => {
                console.log('Fichier inexistant')
                console.log(err)
                return [];
            });
        } else {
            return Promise.all(["768", "844", "923"]);
        }
    }

    addStationToFile(id) {
        if (this.platform.is('cordova')) {
            this.filePath = cordova.file.dataDirectory;
            File.readAsText(this.filePath, FILE_FAVORITE).then(success => {
                var favorites = "";
                var read = success.toString().split("%");
                read.forEach(element => {
                    if (element != "") favorites += element + "%";
                });
                favorites += id;
                File.writeFile(this.filePath, FILE_FAVORITE, favorites, true);
            })
            .catch(err => {
                console.log('Fichier inexistant')
                console.log(err)
            });
        }
    }

    removeStationToFile(id) {
        if (this.platform.is('cordova')) {
            this.filePath = cordova.file.dataDirectory;
            File.readAsText(this.filePath, FILE_FAVORITE).then(success => {
                var favorites = "";
                var read = success.toString().split("%");
                read.forEach(element => {
                    if (element != id.toString()) favorites += element + "%";
                });
                File.writeFile(this.filePath, FILE_FAVORITE, favorites, true);
            })
            .catch(err => {
                console.log('Fichier inexistant')
                console.log(err)
            });
        }
    }
}