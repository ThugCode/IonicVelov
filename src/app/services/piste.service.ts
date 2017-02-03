import { Injectable } from '@angular/core';

@Injectable()
export class PisteService {
    public PistesUrl = "https://download.data.grandlyon.com/wfs/grandlyon?SERVICE=WFS&VERSION=2.0.0&outputformat=GEOJSON&request=GetFeature&typename=pvo_patrimoine_voirie.pvoamenagementcyclable&SRSNAME=urn:ogc:def:crs:EPSG::4326";

    constructor() { }
}