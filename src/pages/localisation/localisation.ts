import { Component, ViewChild } from '@angular/core';
import { Geolocation } from 'ionic-native';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

declare var ol: any;

@Component({
  selector: 'localisation-page',
  templateUrl: 'localisation.html'
})
export class LocalisationPage {

  @ViewChild('map') map;
  movies: Array<any>;

  constructor(public http: Http) {
    this.loadMap();

    var url = "https://download.data.grandlyon.com/ws/rdata/jcd_jcdecaux.jcdvelov/all.json";
    this.http.get(url)
        .map(res => res.json())
        .subscribe(data => {
            this.movies = data.values;
            console.log(data.fields)
        });
  }

  loadMap() {
        Geolocation.getCurrentPosition().then((resp) => {
          var long = resp.coords.longitude;
          var lat = resp.coords.latitude;
          
          var iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([long, lat])),
            name: 'Ma position'
          });

          var vectorSource = new ol.source.Vector({
            features: [iconFeature]
          });
          
          var vectorLayer = new ol.layer.Vector({
            source: vectorSource
          });

          var mapImg = new ol.layer.Tile({
            source: new ol.source.OSM() 
          });
          
          new ol.Map({
            target: "map",
            layers: [ mapImg, vectorLayer ],
            view: new ol.View({
              center: ol.proj.fromLonLat([long, lat]),
              zoom: 15
            })
        })

        }).catch((error) => {
          console.log('Error getting location', error);
        })
    }
}
