import { Component, ViewChild, OnInit } from '@angular/core';
import { Geolocation } from 'ionic-native';

import { StationService } from '../../app/station.service';
import { Station } from '../../app/station';
import { LoadingController } from 'ionic-angular';

import ol from 'openlayers';

@Component({
  selector: 'localisation-page',
  templateUrl: 'localisation.html'
})
export class LocalisationPage implements OnInit {
  @ViewChild('map') map;
  stations: Station[];
  loader:any;

  constructor(
    private stationService: StationService,
    private loadingCtrl: LoadingController
  ) { }

  getStations() {
    this.stationService.getStations()
      .subscribe(stations => {
        this.stations = stations;
        this.loadMap();
      });
  }

  ngOnInit() {
    this.loader = this.loadingCtrl.create({
      content: "Merci de patienter...",
      duration: 2000
    });
    this.loader.present();
    this.getStations();
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
        
      });
      
      featuresStations.push(new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([long, lat])),
        name: 'Ma position'
      }));
      
      var vectorSource = new ol.source.Vector({
        features: featuresStations
      });

      var vectorLayer = new ol.layer.Vector({
        source: vectorSource
      });

      var mapImg = new ol.layer.Tile({
        source: new ol.source.OSM()
      });

      var map = new ol.Map({
        target: "map",
        layers: [mapImg, vectorLayer],
        view: new ol.View({
          center: ol.proj.fromLonLat([long, lat]),
          zoom: 13
        })
      })

      //***************** POPUP *******************//
      var element = document.getElementById('popup');
      var popup = new ol.Overlay({
        element: element,
        position : [539843.80968133141, 5743312.366279513],
        positioning: 'center-center',
        stopEvent: false,
        offset: [0, -50]
      });
      map.addOverlay(popup);

      // display popup on click
      map.on('click', function(evt) {
        var feature = map.forEachFeatureAtPixel(evt.pixel,
            function(feature, layer) {
              return feature;
            });
        if (feature) {
          var geometry = feature.getGeometry();
          //var coord = geometry.getCoordinates();
          var coord = evt.coordinate;
          popup.setPosition(coord);
          console.log(coord);
          //console.log(feature.name);
          //console.log(feature.bikeStands);
          //console.log(feature.available);
        } else {

        }
      });


      this.loader.dismiss();

    }).catch((error) => {
      console.log('Error getting location', error);
    })
  }
}
