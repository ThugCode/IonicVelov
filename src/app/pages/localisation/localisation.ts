import { Component, ViewChild, OnInit } from '@angular/core';
import { Geolocation } from 'ionic-native';

import { FileService } from '../../services/file.service';
import { StationService } from '../../services/station.service';
import { Station } from '../../models/station';
import { LoadingController } from 'ionic-angular';
import { Network } from 'ionic-native';
import { Platform } from 'ionic-angular';

import ol from 'openlayers';

const TEXT_MY_POSITION = "Ma position";
const TEXT_SELECTED = "Sélection";

@Component({
  selector: 'localisation-page',
  templateUrl: 'localisation.html'
})
export class LocalisationPage implements OnInit {
  @ViewChild('map') mapChild;           //Child map in HTML
  loader: any;                          //Loader
  stations: Station[];                  //Station list
  stationSelected: any;                 //Selected station
  mapOl: any;                           //Ol map
  targetPoint: ol.Feature;              //Blue point
  featureSelected: any;
  notConnected: boolean;

  constructor(
    private stationService: StationService,
    private loadingCtrl: LoadingController,
    private fileService: FileService,
    private platform: Platform
  ) { }

  ngOnInit() {
    this.notConnected = Network.connection === "none";
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
      this.getPrefered(resp);
    }).catch((error) => {
      console.log('Error getting location', error);
    })
  }

  getPrefered(resp) {
    if(this.platform.is('mobile')) {
      this.fileService.readFavoritesFromFile().then(prefered => {
        this.createMap(resp, prefered);
      });
    } else {
      var prefered = [];
      this.createMap(resp, prefered);
    }
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
    var fS_Target = [];

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
      name: TEXT_MY_POSITION
    }));

    this.targetPoint = new ol.Feature({
      name: TEXT_SELECTED
    });
    fS_Target.push(this.targetPoint);

    var vS_Closed = new ol.source.Vector({ features: fS_Closed });
    var vS_Empty = new ol.source.Vector({ features: fS_Empty });
    var vS_Full = new ol.source.Vector({ features: fS_Full });
    var vS_Available = new ol.source.Vector({ features: fS_Available });
    var vS_MyPosition = new ol.source.Vector({ features: fS_MyPosition });
    var vS_Target = new ol.source.Vector({ features: fS_Target });

    var vL_Closed = new ol.layer.Vector({ source: vS_Closed, style: this.createStyle("red", 8) });
    var vL_Empty = new ol.layer.Vector({ source: vS_Empty, style: this.createStyle("orange", 8) });
    var vL_Full = new ol.layer.Vector({ source: vS_Full, style: this.createStyle("yellow", 8) });
    var vL_Available = new ol.layer.Vector({ source: vS_Available, style: this.createStyle("green", 8) });
    var vL_MyPosition = new ol.layer.Vector({ source: vS_MyPosition, style: iconStyle });
    var vL_MyTarget = new ol.layer.Vector({ source: vS_Target, style: this.createStyle("blue", 10) });

    var mapImg = new ol.layer.Tile({
      source: new ol.source.OSM()
    });

    this.mapOl = new ol.Map({
      target: "map",
      layers: [mapImg, vL_Closed, vL_Empty, vL_Full, vL_Available, vL_MyPosition, vL_MyTarget],
      overlays: [new ol.Overlay({ element: document.getElementById('popup') })],
      view: new ol.View({
        center: ol.proj.fromLonLat([long, lat]),
        zoom: 15
      })
    })

    this.loader.dismiss();
  }

  createStyle(color, taille) {
    return new ol.style.Style({
      image: new ol.style.Circle({
        radius: taille,
        stroke: new ol.style.Stroke({
          color: 'black',
          width: 3
        }),
        fill: new ol.style.Fill({ color: color })
      })
    });
  }

  clickOnStar(station) {
    if (this.platform.is('mobile')) {
      this.stationSelected.favorite = !this.stationSelected.favorite;
      this.featureSelected.set("favorite", !this.featureSelected.get("favorite"));
      if(this.stationSelected.favorite)
        this.fileService.addStationToFile(station.gid);
      else
        this.fileService.removeStationToFile(station.gid);
    }
  }

  clickCloser() {
    this.stationSelected = null;
    this.targetPoint.setGeometry(null);
  }

  clickMap(event) {
    var coord = [event.layerX, event.layerY]
    var feature = this.mapOl.forEachFeatureAtPixel(coord,
      function (feature, layer) {
        return feature;
      }
    );
    this.featureSelected = feature;
    this.showPopup(feature);
  }

  showPopup(feature) {
    if (feature && feature.get("name") != TEXT_MY_POSITION && feature.get("name") != TEXT_SELECTED) {
      this.stationSelected = {};
      this.stationSelected.name = feature.get("name");
      this.stationSelected.status = feature.get("status") == "OPEN" ? "Ouverte" : "Fermée";
      this.stationSelected.bikestand = feature.get("bikeStands");
      this.stationSelected.available = feature.get("available");
      this.stationSelected.favorite = feature.get("favorite");
      this.stationSelected.gid = feature.get("gid");

      this.targetPoint.setGeometry(new ol.geom.Point(feature.getGeometry().getCoordinates()));
      this.mapOl.getView().setCenter(feature.getGeometry().getCoordinates());
    }
  }

}
