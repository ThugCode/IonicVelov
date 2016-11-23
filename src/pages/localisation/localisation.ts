import { Component, ViewChild } from '@angular/core';

import { Geolocation } from 'ionic-native';

declare var ol: any;

@Component({
  selector: 'localisation-page',
  templateUrl: 'localisation.html'
})
export class LocalisationPage {

  @ViewChild('map') map;

  constructor() {
    
  }

  ngAfterViewInit() {
        
        var lat = 0;
        var long = 0;
        Geolocation.getCurrentPosition().then((resp) => {
          lat = resp.coords.latitude;
          long = resp.coords.longitude;
        }).catch((error) => {
          console.log('Error getting location', error);
        });

        new ol.Map({
            target: "map",
            layers: [
              new ol.layer.Tile({
                source: new ol.source.OSM() 
              })
            ],
            view: new ol.View({
              center: [lat, long],
              zoom: 10
            })
        });

        

    }

    
}
