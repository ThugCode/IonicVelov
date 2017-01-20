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
    ) {}

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