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
  stations: Array<any>;

  constructor(public http: Http) {

    var url = "https://download.data.grandlyon.com/ws/rdata/jcd_jcdecaux.jcdvelov/all.json";
    this.http.get(url)
        .map(res => res.json())
        .subscribe(data => {
            this.stations = data.values;
            console.log(data.fields)
            this.loadMap();
        });
  }

  loadMap() {
        Geolocation.getCurrentPosition().then((resp) => {
          var long = resp.coords.longitude;
          var lat = resp.coords.latitude;
          
          var featuresStations: Array<any>;
          featuresStations = [];
          this.stations.forEach(element => {
              featuresStations.push(new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(element.lng), parseFloat(element.lat)])),
                name: element.name,
                bikeStands: element.bike_stands,
                available: element.available_bike_stands
              }))
              console.log(element.lng + " / " + element.lat)
          });
          console.log(long + " / " + lat)
          featuresStations.push(new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([long, lat])),
            name: 'Ma position'
          }));

          console.log(featuresStations.length)
          var vectorSource = new ol.source.Vector({
            features: featuresStations
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
              zoom: 12
            })
        })

        }).catch((error) => {
          console.log('Error getting location', error);
        })
    }
}
