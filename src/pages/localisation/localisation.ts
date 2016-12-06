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

  getStyle(color) {
    return new ol.style.Style({
        image: new ol.style.Circle({
          radius: 6,
          stroke: new ol.style.Stroke({
            color: 'white',
            width: 2
          }),
          fill: new ol.style.Fill({ color: color })
        })
      });
  }

  loadMap() {

    var fS_Closed: Array<any>;
    var fS_Empty: Array<any>;
    var fS_Full: Array<any>;
    var fS_Available: Array<any>;
    var fS_MyPosition: Array<any>;
    fS_Closed = [];
    fS_Empty = [];
    fS_Full = [];
    fS_Available = [];
    fS_MyPosition = [];

    Geolocation.getCurrentPosition().then((resp) => {
      var long = resp.coords.longitude;
      var lat = resp.coords.latitude;
      var tempFeature;
      var prefered = ["768", "844", "923"];
      
      this.stations.forEach(element => {

        tempFeature = new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(element.lng), parseFloat(element.lat)])),
          name: element.name,
          status: element.status,
          bikeStands: element.bike_stands,
          available: element.available_bike_stands,
          favorite: prefered.indexOf(element.gid) >= 0
        });

        if(element.status == "CLOSED") {
          fS_Closed.push(tempFeature);
        } else if(element.available_bikes == "0") {
          fS_Empty.push(tempFeature);
        } else if(element.available_bike_stands == "0") {
          fS_Full.push(tempFeature);
        } else {
          fS_Available.push(tempFeature);
        }
      });
      
      fS_MyPosition.push(new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([long, lat])),
        name: 'Ma position'
      }));

      var vS_Closed = new ol.source.Vector({ features: fS_Closed });
      var vS_Empty = new ol.source.Vector({ features: fS_Empty });
      var vS_Full = new ol.source.Vector({ features: fS_Full });
      var vS_Available = new ol.source.Vector({ features: fS_Available });
      var vS_MyPosition = new ol.source.Vector({ features: fS_MyPosition });

      var vL_Closed = new ol.layer.Vector({ source: vS_Closed, style : this.getStyle("red") });
      var vL_Empty = new ol.layer.Vector({ source: vS_Empty, style : this.getStyle("orange") });
      var vL_Full = new ol.layer.Vector({ source: vS_Full, style : this.getStyle("yellow") });
      var vL_Available = new ol.layer.Vector({ source: vS_Available, style : this.getStyle("green") });
      var vL_MyPosition = new ol.layer.Vector({ source: vS_MyPosition, style : this.getStyle("blue") });

      var mapImg = new ol.layer.Tile({
        source: new ol.source.OSM()
      });
      
      //***************** POPUP *******************//
      var container = document.getElementById('popup');
      var content = document.getElementById('popup-content');
      var closer = document.getElementById('popup-closer');
      var starFull = document.getElementById('star-full');
      var starEmpty = document.getElementById('star-empty');

      var popup = new ol.Overlay({
        element: container,
        positioning: 'center-center',
        stopEvent: false
      });

      closer.onclick = function() {
        popup.setPosition(undefined);
        closer.blur();
        return false;
      };

      var map = new ol.Map({
        target: "map",
        layers: [mapImg, vL_Closed, vL_Empty, vL_Full, vL_Available, vL_MyPosition],
        overlays: [popup],
        view: new ol.View({
          center: ol.proj.fromLonLat([long, lat]),
          zoom: 13
        })
      })

      // display popup on click
      map.on('click', function(evt) {
        var feature = map.forEachFeatureAtPixel(evt.pixel,
            function(feature, layer) {
              return feature;
            });
        if (feature) {
          var coord = evt.coordinate;
          var name = feature.get("name");
          var status = feature.get("status") == "OPEN" ? "Ouverte" : "Fermée";
          var bikestand = feature.get("bikeStands");
          var available = feature.get("available");
          var favorite = feature.get("favorite");

          content.innerHTML = '<div class="popup-content-name">' + name + '</div>';
          if(name != "Ma position") {
            content.innerHTML += '<div class="popup-content-info">'+ 
                                    '<div class="content-status">' + status + ' </div> ' + 
                                    '<div class="content-number">' +available + '/' + bikestand + '</div>' +
                                  '</div>';
          }
          
          if(favorite) {
            starFull.style.display = "inline-block";
            starEmpty.style.display = "none";
          } else {
            starFull.style.display = "none";
            starEmpty.style.display = "inline-block";
          }

          popup.setPosition(coord);
        }
      });

      this.loader.dismiss();

    }).catch((error) => {
      console.log('Error getting location', error);
    })
  }
}
