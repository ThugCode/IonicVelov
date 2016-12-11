import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { Station } from '../models/station';

@Injectable()
export class StationService {
    url: string = "https://download.data.grandlyon.com/ws/rdata/jcd_jcdecaux.jcdvelov/all.json";

    constructor(
        private http: Http
    ) { }

    getStations(): Observable<Station[]> {
        return this.http.get(this.url).map(res => res.json().values);
    }
}