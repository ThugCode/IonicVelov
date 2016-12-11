import { Component, ViewChild, OnInit } from '@angular/core';
import { Geolocation } from 'ionic-native';

//import { FileService } from '../../services/file.service';
import { StationService } from '../../services/station.service';
import { Station } from '../../models/station';
import { LoadingController } from 'ionic-angular';
import { Platform } from 'ionic-angular';

import ol from 'openlayers';

const maposition = "Ma position";

@Component({
  selector: 'localisation-page',
  templateUrl: 'localisation.html'
})
export class LocalisationPage implements OnInit {
  @ViewChild('map') mapChild;           //Child map in HTML
  loader: any;                           //Loader
  stations: Station[];                  //Station list
  stationSelected: any;                 //Selected station
  mapOl: any;                           //Ol map

  constructor(
    private stationService: StationService,
    private loadingCtrl: LoadingController,
    //private fileService: FileService,
    private platform: Platform
  ) { }

  ngOnInit() {
    this.loader = this.loadingCtrl.create({
      content: "Merci de patienter...",
      duration: 2000
    });
    this.loader.present();
    this.getStations();
  }

  getStations() {
    this.stationService.getStations()
      .subscribe(stations => {
        this.stations = stations;
        this.loadMap();
      });
  }

  loadMap() {
    Geolocation.getCurrentPosition().then((resp) => {
      var prefered = ["768", "844", "923"];
      this.createMap(resp, prefered);
      this.loader.dismiss();
    }).catch((error) => {
      console.log('Error getting location', error);
    })
  }

  createMap(resp, prefered) {

    var long = resp.coords.longitude;
    var lat = resp.coords.latitude;

    var tempFeature;
    var fS_Closed = [];
    var fS_Empty = [];
    var fS_Full = [];
    var fS_Available = [];
    var fS_MyPosition = [];
    //var fS_MyPosition2 = [];

    this.stations.forEach(element => {

      tempFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(element.lng), parseFloat(element.lat)])),
        name: element.name,
        status: element.status,
        bikeStands: element.bike_stands,
        available: element.available_bike_stands,
        gid: element.gid,
        lat: element.lat,
        lng: element.lng,
        favorite: prefered.indexOf(element.gid) >= 0
      });

      if (element.status == "CLOSED") {
        fS_Closed.push(tempFeature);
      } else if (element.available_bikes == "0") {
        fS_Empty.push(tempFeature);
      } else if (element.available_bike_stands == "0") {
        fS_Full.push(tempFeature);
      } else {
        fS_Available.push(tempFeature);
      }
    });

    var iconStyle = new ol.style.Style({
      image: new ol.style.Icon( ({
        anchor: [128, 20],
        scale : 0.2,
        anchorOrigin : "bottom-left",
        anchorXUnits: 'pixels',
        anchorYUnits: 'pixels',
        src: 'assets/img/pin.png'
      }))
    });

    fS_MyPosition.push(new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat([long, lat])),
      name: maposition
    }));

    /*fS_MyPosition2.push(new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat([long, lat])),
      name: maposition
    }));*/

    var vS_Closed = new ol.source.Vector({ features: fS_Closed });
    var vS_Empty = new ol.source.Vector({ features: fS_Empty });
    var vS_Full = new ol.source.Vector({ features: fS_Full });
    var vS_Available = new ol.source.Vector({ features: fS_Available });
    var vS_MyPosition = new ol.source.Vector({ features: fS_MyPosition });
    //var vS_MyPosition2 = new ol.source.Vector({ features: fS_MyPosition2 });

    var vL_Closed = new ol.layer.Vector({ source: vS_Closed, style: this.createStyle("red") });
    var vL_Empty = new ol.layer.Vector({ source: vS_Empty, style: this.createStyle("orange") });
    var vL_Full = new ol.layer.Vector({ source: vS_Full, style: this.createStyle("yellow") });
    var vL_Available = new ol.layer.Vector({ source: vS_Available, style: this.createStyle("green") });
    var vL_MyPosition = new ol.layer.Vector({ source: vS_MyPosition, style: iconStyle });
    //var vL_MyPosition2 = new ol.layer.Vector({ source: vS_MyPosition2, style: this.createStyle("blue") });

    var mapImg = new ol.layer.Tile({
      source: new ol.source.OSM()
    });

    this.mapOl = new ol.Map({
      target: "map",
      layers: [mapImg, vL_Closed, vL_Empty, vL_Full, vL_Available, vL_MyPosition],//, vL_MyPosition2],
      overlays: [new ol.Overlay({ element: document.getElementById('popup') })],
      view: new ol.View({
        center: ol.proj.fromLonLat([long, lat]),
        zoom: 15
      })//,
      //controls : [] //Enleve les boutons de controle
    })
  }

  createStyle(color) {
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

  clickOnStar(station) {
    console.log("-------------      CATCH      ------------------------");
    console.log(station.gid);
    if (this.platform.is('mobile')) {
      this.stationSelected.favorite = !this.stationSelected.favorite;
      //this.fileService.writeFile(station.gid);
    }
  }

  clickCloser() {
    this.stationSelected = null;
  }

  clickMap(event) {
    var coord = [event.layerX, event.layerY]
    var feature = this.mapOl.forEachFeatureAtPixel(coord,
      function (feature, layer) {
        return feature;
      }
    );

    this.showPopup(feature);
  }

  showPopup(feature) {
    if (feature && feature.get("name") != maposition) {
      this.stationSelected = {};
      this.stationSelected.name = feature.get("name");
      this.stationSelected.status = feature.get("status") == "OPEN" ? "Ouverte" : "Fermée";
      this.stationSelected.bikestand = feature.get("bikeStands");
      this.stationSelected.available = feature.get("available");
      this.stationSelected.favorite = feature.get("favorite");
      this.stationSelected.gid = feature.get("gid");

      this.mapOl.getView().setCenter(feature.getGeometry().getCoordinates());

      //var lng = parseFloat(feature.get("lng"));
      //var lat = parseFloat(feature.get("lat"));
      //console.log(ol.proj.fromLonLat([lng, lat]));
      //console.log(feature.getGeometry().getCoordinates());
      //this.mapOl.getOverlayById(0).setPosition(feature.getGeometry().getCoordinates());
      //this.popupDiv.setPosition(ol.proj.fromLonLat([lng, lat]));
    }
  }

}
