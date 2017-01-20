import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';


@Injectable()
export class PisteService {
    public PistesUrl = "https://download.data.grandlyon.com/wfs/grandlyon?SERVICE=WFS&VERSION=2.0.0&outputformat=GEOJSON&request=GetFeature&typename=pvo_patrimoine_voirie.pvoamenagementcyclable&SRSNAME=urn:ogc:def:crs:EPSG::4326";

    constructor(
        private http: Http
    ) { }

    getPistes(): Observable<any> {
        return this.http.get(this.PistesUrl).map(res => res.json());
    }
}