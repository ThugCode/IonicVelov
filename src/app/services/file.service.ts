import { Injectable } from '@angular/core';
import { File } from 'ionic-native';
import { Platform } from 'ionic-angular';
import { Station } from '../models/station';

declare var cordova: any;

const FILE_OFFLINE = "stationsOffline.txt";
const FILE_FAVORITE = "favorites.txt";

@Injectable()
export class FileService {

    filePath : string;

    constructor(
        private platform : Platform
    ) {}

    /***
     * Read all stations from offline file
     * If file doesn't exist, return empty array
     * @return Promise<Station[]> : Array of Station
     ***/
    readSationOffline(): Promise<Station[]> {
        if (this.platform.is('cordova')) {
            this.filePath = cordova.file.dataDirectory;
            return File.readAsText(this.filePath, FILE_OFFLINE).then(success => {
                return JSON.parse(success.toString());
            })
            .catch(err => {
                console.log('Fichier inexistant');
                console.log(err);
                return [];
            })
        } else { //DEBUG on computer
            return Promise.all([]);
        }
    }

    /***
     * Write in offline file all stations from JSON
     * 
     * @param json : JSON of Station
     ***/
    writeStationOffline(json) {
        if (this.platform.is('cordova')) {
            this.filePath = cordova.file.dataDirectory;
            var toFile = JSON.stringify(json);
            File.writeFile(this.filePath, FILE_OFFLINE, toFile, true);
        }
    }

    /***
     * Read all favorite stations from file
     * If file doesn't exist, return empty array
     * @return Promise<any[]> : Used to be Array of stringified integer
     ***/
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
        } else { //DEBUG on computer
            return Promise.all(["768", "844", "923"]);
        }
    }

    /***
     * Add a station in favorite file
     * Read file, and write again with new id
     * If file doesn't exist, write new id
     * @param id : Used to be stringified integer
     ***/
    addStationToFile(id) {
        if (this.platform.is('cordova')) {
            this.filePath = cordova.file.dataDirectory;
            File.readAsText(this.filePath, FILE_FAVORITE).then(success => {
                this.writeOnFile(success, id);
            })
            .catch(err => {
                this.writeOnFile("", id);
                console.log('Fichier inexistant');
                console.log(err);
            });
        }
    }

    /***
     * Write again fileString on favorite file with new id
     * If file doesn't exist, return empty array
     * @param fileString : string
     * @param id : string
     ***/
    writeOnFile(fileString, id) {
        var favorites = "";
        var read = fileString.toString().split("%");
        read.forEach(element => {
            if (element != "") favorites += element + "%";
        });
        favorites += id;
        File.writeFile(this.filePath, FILE_FAVORITE, favorites, true);
    }

    /***
     * Write again favorite file without deleted id
     * If file doesn't exist don't do anything
     * @param id : string
     ***/
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