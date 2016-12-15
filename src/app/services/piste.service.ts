import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { PisteShape } from '../models/piste';

@Injectable()
export class PisteService {
    url = "https://download.data.grandlyon.com/wfs/grandlyon?SERVICE=WFS&VERSION=2.0.0&outputformat=GEOJSON&maxfeatures=30&request=GetFeature&typename=pvo_patrimoine_voirie.pvoamenagementcyclable&SRSNAME=urn:ogc:def:crs:EPSG::4326";

    constructor(
        private http: Http
    ) { }

    getPistes(): Observable<PisteShape[]> {
        return this.http.get(this.url).map(res => res.json().features);
    }
}