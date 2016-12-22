import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { Network } from 'ionic-native';
import { FileService } from './file.service';
import { Station } from '../models/station';

@Injectable()
export class StationService {
    url: string = "https://download.data.grandlyon.com/ws/rdata/jcd_jcdecaux.jcdvelov/all.json";

    constructor(
        private http: Http,
        private fileService: FileService
    ) { }

    getStations(): Observable<Station[]> {

        if (Network.connection === "none") {
            return Observable.fromPromise(this.fileService.readSationOffline().then(stations => {
                return stations;
            }));
        } else {
            return this.http.get(this.url).map(res => {
                var obStations = res.json().values;
                this.fileService.writeStationOffline(obStations);
                return obStations;
            });
        }
    }
}