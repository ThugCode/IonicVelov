import { Component, ViewChild, OnInit } from '@angular/core';
import { Geolocation, Keyboard, Clipboard, Network, Vibration } from 'ionic-native';
import { LoadingController, ToastController, Searchbar, AlertController  } from 'ionic-angular';
import { FileService } from '../../services/file.service';
import { StationService } from '../../services/station.service';
import { PisteService } from '../../services/piste.service';
import { Station } from '../../models/station';

import ol from 'openlayers';

const TEXT_THANKS_WAITING = "Merci de patienter...";
const TEXT_YES = "Oui";
const TEXT_OPENED = "Ouverte";
const TEXT_CLOSED = "Fermée";
const TEXT_STATION = "Station";
const TEXT_ADDED_TO_FAVORITES = "ajoutée aux favoris"
const TEXT_DELETED_FROM_FAVORITES = "supprimée des favoris";
const TEXT_ENABLE_TO_FIND_LOCATION = "Impossible de détecter votre position";
const TEXT_ENABLE_TO_FIND_YOUR_FAVORITE = "Impossible de détecter vos stations favorites";
const TEXT_COPY_DATA = "Adresse de la station copiée";
const JSON_CLOSED = "CLOSED";
const JSON_OPEN = "OPEN";

@Component({
  selector        : 'localisation-page',
  templateUrl     : 'localisation.html'
})

/******************************
* dev     : IonicVelov - Polytech Lyon
* version : 1.2
* author  : GERLAND Loïc - LETOURNEUR Léo
*******************************/
export class LocalisationPage implements OnInit {
  @ViewChild('map') mapChild;                     //Child map in HTML
  @ViewChild('searchbar') searchbar: Searchbar;   //Child searchBar in HTML

  initialised       : boolean;          //Is the view initialised ?
  loader            : any;              //Loader during initilisation
  stations          : Station[];        //Station list
  stationsFiltered  : Station[];        //Station filtered (for search input)
  stationSelected   : any;              //Selected station on the map (for bottom popup)
  featureSelected   : any;              //Selected feature (for favorite star)
  mapOl             : any;              //Ol map
  targetPoint       : ol.Feature;       //Blue point feature on map
  notConnected      : boolean;          //Is the device connected to internet ?
  hasPosition       : boolean;          //Has the device localisation ?
  myPosition        : any;              //Position of user on map
  myCoordinate      : any;              //Position of user on earth
  searchVisible     : boolean = false;  //Is search field visible ?
  stationFilter     : String;           //Search filter
  displayedPiste    : boolean           //Is pistes cyclables displayed ?
  displayedImage    : boolean           //Is the second image map displayed ?
  
  mapImg            : ol.layer.Tile;    //Layer for map image
  vL_All            : ol.layer.Vector;  //Layer for searching
  vL_Closed         : ol.layer.Vector;  //Layer for closed station
  vL_Empty          : ol.layer.Vector;  //Layer for empty station
  vL_Full           : ol.layer.Vector;  //Layer for full station
  vL_Available      : ol.layer.Vector;  //Layer for available station
  vL_Bonus          : ol.layer.Vector;  //Layer for bonus station
  vL_MyPosition     : ol.layer.Vector;  //Layer for my position
  vL_MyTarget       : ol.layer.Vector;  //Layer for selected station
  vL_Piste          : ol.layer.Vector;  //Layer for pistes

  constructor(
    private stationService  : StationService,
    private loadingCtrl     : LoadingController,
    private fileService     : FileService,
    private toastCtrl       : ToastController,
    private alertCtrl       : AlertController,
    private pisteService    : PisteService
  ) { 
    this.initialised = false;
  }

  /***
   * Get all needed informations at initialisation
   ***/
  ngOnInit() {
    this.notConnected = Network.connection === "none";
    this.stationFilter = "";
    this.displayedPiste = false;
    this.displayedImage = false;
    this.presentLoader();
    this.loader = this.loadingCtrl.create({
      content: TEXT_THANKS_WAITING,
      duration: 2000
    });
    this.loader.present();
    this.getStations();
  }

  /***
   * Get all stations and load map
   * 
   ***/
  getStations() {
    this.stationService.getStations().subscribe(stations => {
        this.stations = stations;
        this.loadMap();
    });
  }

  /***
   * Get position of user and call prefered function
   * 
   ***/
  loadMap() {
    Geolocation.getCurrentPosition().then((resp) => {
      this.hasPosition = true;
      this.myCoordinate = resp.coords;
      this.getPrefered([resp.coords.longitude, resp.coords.latitude]);
    }).catch((error) => {
      this.hasPosition = false;
      this.getPrefered([4.85, 45.75]);
      this.myCoordinate = null;
      console.log(TEXT_ENABLE_TO_FIND_LOCATION, error);
      this.presentAlert(TEXT_ENABLE_TO_FIND_LOCATION);
    })
  }

  /***
   * Get all prefered station id and then call creation of map
   * 
   * @param coords : float[]
   ***/
  getPrefered(coords) {
    this.fileService.readFavoritesFromFile().then(prefered => {
      this.createMap(coords, prefered);
    }).catch((error) => {
      this.createMap(coords, []);
      console.log(TEXT_ENABLE_TO_FIND_YOUR_FAVORITE, error);
      this.presentAlert(TEXT_ENABLE_TO_FIND_YOUR_FAVORITE);
    });
  }

  /***
   * Create openlayer map with all station
   * 
   * @param coords : float[]
   * @param prefered : int[]
   ***/
  createMap(coords, prefered) {

    var long = coords[0];
    var lat = coords[1];


    this.mapImg = new ol.layer.Tile({
      source: new ol.source.OSM()
    });

    this.mapOl = new ol.Map({
      target: "map",
      layers: [this.mapImg],
      overlays: [new ol.Overlay({ element: document.getElementById('popup') })],
      view: new ol.View({
        center: ol.proj.fromLonLat([long, lat]),
        zoom: 15,
        minZoom: 6,
        maxZoom: 18
      }),
      controls : ol.control.defaults({
          zoom          : true,
          attribution   : false,
          rotate        : true
        })
    });

    this.buildTargetLayer();
    this.buildMyPositionLayer(coords);
    this.buildAllStationLayers(prefered);
    this.buildPistesLayer();
    
    this.initialised = true;
    this.dismissLoader();
    this.updateScreen();
  }

  /***
   * Build blue point (selected station) layer
   ***/
  buildTargetLayer() {
    var fS_Target = [];
    this.targetPoint = new ol.Feature({
      selectable : false
    });
    fS_Target.push(this.targetPoint);
    var vS_Target = new ol.source.Vector({ features: fS_Target });
    this.vL_MyTarget = new ol.layer.Vector({ source: vS_Target, style: this.createStyle("blue", 14) });
  }

  /***
   * Build user position (pin image) layer
   * 
   * @param coords : float[]
   ***/
  buildMyPositionLayer(coords) {

    var fS_MyPosition = [];
    this.myPosition = new ol.Feature({
      selectable : false,
      geometry: new ol.geom.Point(ol.proj.fromLonLat([coords[0], coords[1]]))
    });

    //If no position don't print pin
    if(!this.hasPosition) { this.myPosition.setGeometry(null); }

    fS_MyPosition.push(this.myPosition);

    var vS_MyPosition = new ol.source.Vector({ features: fS_MyPosition });
    this.vL_MyPosition = new ol.layer.Vector({ source: vS_MyPosition, style: this.createPinStyle() });
  }

  /***
   * Build all layers for station (green, yellow, orange, red, black point)
   * 
   * @param prefered : int[]
   ***/
  buildAllStationLayers(prefered) {

    var tempFeature;
    var fS_Closed = [];
    var fS_Empty = [];
    var fS_Full = [];
    var fS_Available = [];
    var fS_Bonus = [];
    var fS_All = [];

    this.stations.forEach(element => {

      tempFeature = new ol.Feature({
        selectable            : true,
        geometry              : new ol.geom.Point(ol.proj.fromLonLat([parseFloat(element.lng), parseFloat(element.lat)])),
        name                  : element.name,
        address               : element.address,
        status                : element.status,
        available_bikes       : element.available_bikes,
        available_bike_stands : element.available_bike_stands,
        gid                   : element.gid,
        lat                   : element.lat,
        lng                   : element.lng,
        distance              : this.getDistance(element.lat, element.lng),
        bonus                 : element.bonus == TEXT_YES,
        favorite              : prefered.indexOf(element.gid) >= 0
      });

      if (element.status == JSON_CLOSED) {
        fS_Closed.push(tempFeature);
      } else if (element.available_bikes == "0") {
        fS_Empty.push(tempFeature);
      } else if (element.available_bike_stands == "0") {
        fS_Full.push(tempFeature);
      } else {
        fS_Available.push(tempFeature);
      }

      if (element.bonus == TEXT_YES) {
        fS_Bonus.push(tempFeature);
      }

      fS_All.push(tempFeature);
    });

    var vS_Closed = new ol.source.Vector({ features: fS_Closed });
    var vS_Empty = new ol.source.Vector({ features: fS_Empty });
    var vS_Full = new ol.source.Vector({ features: fS_Full });
    var vS_Available = new ol.source.Vector({ features: fS_Available });
    var vS_Bonus = new ol.source.Vector({ features: fS_Bonus });
    var vS_All = new ol.source.Vector({ features: fS_All });

    this.vL_Closed = new ol.layer.Vector({ source: vS_Closed, style: this.createStyle("red", 9) });
    this.vL_Empty = new ol.layer.Vector({ source: vS_Empty, style: this.createStyle("orange", 9) });
    this.vL_Full = new ol.layer.Vector({ source: vS_Full, style: this.createStyle("yellow", 9) });
    this.vL_Available = new ol.layer.Vector({ source: vS_Available, style: this.createStyle("green", 9) });
    this.vL_Bonus = new ol.layer.Vector({ source: vS_Bonus, style: this.createStyle("black", 2) });
    this.vL_All = new ol.layer.Vector({ source: vS_All });
    
    this.addAllLayerOnMap();
  }

  /***
   * Build piste layer
   * 
   ***/
  buildPistesLayer() {
    var vS_Piste = new ol.source.Vector({ url: this.pisteService.PistesUrl, format: new ol.format.GeoJSON() });
    this.vL_Piste = new ol.layer.Vector({ source: vS_Piste, style: this.createPistesStyle });
  }

  /***
   * Display or hide pistes when clicking on button
   * 
   ***/
  displayPistes() {

    this.displayedPiste = !this.displayedPiste;

    if(!this.displayedPiste)
      this.mapOl.removeLayer(this.vL_Piste);
    else {
      this.removeAllLayerOnMap();
      this.addAllLayerOnMap();
    }
  }

  /***
   * Create style for piste on ol map
   * 
   * @param feature
   * @return style of the current feature
   ***/
  createPistesStyle(feature) {
    var styles =  {
      'LineString': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'blue',
          width: 2
        })
      }),
      'MultiLineString': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'blue',
          width: 2
        })
      })
  };

    return styles[feature.getGeometry().getType()];
  }

  /***
   * Create style for all station
   * 
   * @param color : string
   * @param taille : int
   * @return ol.style.Style of the station group
   ***/
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

  /***
   * Create style for pin image on ol map
   * 
   * @return ol.style.Style with pin image
   ***/
  createPinStyle() {
    return new ol.style.Style({
      image: new ol.style.Icon(({
        anchor: [128, 20],
        scale: 0.2,
        anchorOrigin: "bottom-left",
        anchorXUnits: 'pixels',
        anchorYUnits: 'pixels',
        src: 'assets/img/pin.png'
      }))
    });
  }

  /***
   * Transform degrees to radian
   * 
   * @param number : float
   * @return float
   ***/
  toRadian(number) {
    return number * Math.PI / 180;
  }
  
  /***
   * Get kilometres between two coordinates
   * 
   * @param lat1 : float
   * @param long1 : float
   * @return float
   ***/
  getDistance(lati1, long1):string {

    if(this.myCoordinate == null) return "0";

    var lati2 = this.myCoordinate.latitude;
    var long2 = this.myCoordinate.longitude;

    var r = 6371;
    var la1 = lati1;
    var la2 = lati2;
    var lat1 = this.toRadian(lati1);
    var lat2 = this.toRadian(lati2);
    var lo1 = long1;
    var lo2 = long2;
    var la2minla1 = this.toRadian(la2-la1);
    var lo2minlo1 = this.toRadian(lo2-lo1);

    var cal = Math.sin(la2minla1 / 2) * Math.sin(la2minla1 / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(lo2minlo1/2) * Math.sin(lo2minlo1/2);
    var c = 2* Math.atan2(Math.sqrt(cal), Math.sqrt(1-cal));

    return (r * c).toFixed(1).toString();
  };

  /***
   * Update connection bar and geoposition every seconde
   ***/
  updateScreen() {
    setTimeout(() => {  
      this.notConnected = Network.connection === "none";

      Geolocation.getCurrentPosition().then((resp) => {
        this.hasPosition = true;
        this.myCoordinate = resp.coords;
        this.myPosition.setGeometry(new ol.geom.Point(
          ol.proj.fromLonLat([resp.coords.longitude, resp.coords.latitude]))
        );
      }).catch((error) => {
        this.hasPosition = false;
        this.myCoordinate = null;
        this.myPosition.setGeometry(null);
        console.log(TEXT_ENABLE_TO_FIND_LOCATION, error);
      })

      this.updateScreen();
    }, 1000);
  }

  /***
   * Trigger when clicking on star from popup station
   * 
   * @param station : Feature
   ***/
  clickOnStar(station) {
    this.stationSelected.favorite = !this.stationSelected.favorite;
    this.featureSelected.set("favorite", !this.featureSelected.get("favorite"));

    var string = TEXT_STATION + " " + station.name + " ";
    if (this.stationSelected.favorite) {
      this.fileService.addStationToFile(station.gid);
      string += TEXT_ADDED_TO_FAVORITES;
    } else {
      this.fileService.removeStationToFile(station.gid);
      string += TEXT_DELETED_FROM_FAVORITES;
    }

    this.presentToast(string);
    Vibration.vibrate(1000);
  }

  /***
   * Trigger when clicking on cross button from popup station
   ***/
  clickCloser() {
    this.stationSelected = null;
    this.targetPoint.setGeometry(null);
  }

  /***
   * Trigger when clicking on copy button from popup station
   ***/
  copyData() {
    Clipboard.copy(this.stationSelected.address);
    this.presentToast(TEXT_COPY_DATA);
  }

  /***
   * Trigger when clicking on the map
   * If feature under the click, show popup with station informations
   * 
   * @param event : Event
   ***/
  clickMap(event) {
    var coord = [event.layerX, event.layerY];
    var feature = this.mapOl.forEachFeatureAtPixel(coord,
      function (feature, layer) {
        return feature;
      }
    );
    this.featureSelected = feature;
    this.showPopup(feature);
  }

  /***
   * Trigger when clicking on search button
   * Open search bar
   ***/
  showSearchList() {
    this.searchVisible = true;
    /*setTimeout(() => {
      this.searchbar.setFocus();
    });*/
  }

  /***
   * Trigger when clicking on cancel search button
   * Close search bar & keyboard
   ***/
  hideSearchList() {
    this.searchVisible = false;
    Keyboard.close();
  }

  /***
   * Trigger when caracteres in search bar changed
   * Search by name on all station
   ***/
  searchStations() {
    this.stationsFiltered = this.stations.filter((station) => {
      return station.name.toLowerCase().indexOf(this.stationFilter.toLowerCase()) > -1;
    });
  }

  /***
   * Select a station after searching
   * 
   * @param station : Station
   ***/
  selectStation(station: Station) {
    var feature = this.vL_All.getSource().forEachFeature((feature) => {
      var properties = feature.getProperties();

      if (properties["name"] == station.name)
        return feature;
    });

    this.featureSelected = feature;
    this.hideSearchList();
    this.showPopup(feature);
  }

  changeMapImage() {
    this.mapOl.removeLayer(this.mapImg);

    if(this.displayedImage) {
      this.mapImg = new ol.layer.Tile({
      source: new ol.source.OSM()
    });
    this.displayedImage = false;
    } else {
      this.mapImg = new ol.layer.Tile({
      source: new ol.source.OSM({
        url: "https://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png"
      })
    });
    this.displayedImage = true;
    }
    this.mapOl.addLayer(this.mapImg);
  }

  /***
   * Show popup on the bottom of the map & fill informations
   * Center on station & display blue point
   * 
   * @param feature : Feature
   ***/
  showPopup(feature) {
    if (feature && feature.get("selectable")) {
      this.stationSelected = {};
      this.stationSelected.name = feature.get("name");
      this.stationSelected.address = feature.get("address");
      this.stationSelected.status = feature.get("status") == JSON_OPEN ? TEXT_OPENED : TEXT_CLOSED;
      this.stationSelected.available_bikes = feature.get("available_bikes");
      this.stationSelected.available_bike_stands = feature.get("available_bike_stands");
      this.stationSelected.favorite = feature.get("favorite");
      this.stationSelected.gid = feature.get("gid");
      this.stationSelected.bonus = feature.get("bonus");
      this.stationSelected.distance = feature.get("distance");

      this.targetPoint.setGeometry(new ol.geom.Point(feature.getGeometry().getCoordinates()));
      this.mapOl.getView().setCenter(feature.getGeometry().getCoordinates());
    }
  }

  /***
   * Hide loader
   ***/
  dismissLoader() {
    this.loader.dismiss();
  }

  /***
   * Show loader
   ***/
  presentLoader() {
    this.loader = this.loadingCtrl.create({
      content: TEXT_THANKS_WAITING
    });
    this.loader.present();
  }

  /***
   * Show a toast with specific message during 3s
   ***/
  presentToast(p_message) {
    let toast = this.toastCtrl.create({
      message: p_message,
      duration: 3000
    });
    toast.present();
  }

  /***
   * Show a message alert
   ***/
  presentAlert(p_alert) {
    let alert = this.alertCtrl.create({
      title: 'Attention',
      subTitle: p_alert,
      buttons: ['Ok']
    });
    alert.present();
  }

  /***
   * Trigger when clicking on center button
   ***/
  centerOnMyPosition() {
    if(this.myPosition.getGeometry() == null) return;
    this.mapOl.getView().setCenter(this.myPosition.getGeometry().getCoordinates());
  }
  
  /***
   * Trigger when clicking on refresh button
   * Refresh data about station
   ***/
  refreshData() {
    this.removeAllLayerOnMap();

    this.stationService.getStations().subscribe(stations => {
        this.stations = stations;
        this.fileService.readFavoritesFromFile().then(prefered => {
          this.buildAllStationLayers(prefered);
        }).catch((error) => {
          this.buildAllStationLayers([]);
          console.log(TEXT_ENABLE_TO_FIND_YOUR_FAVORITE, error);
        });
    });
  }

  /***
   * Remove all layer from map
   * 
   ***/
  removeAllLayerOnMap() {
    this.mapOl.removeLayer(this.vL_Closed);
    this.mapOl.removeLayer(this.vL_Empty);
    this.mapOl.removeLayer(this.vL_Full);
    this.mapOl.removeLayer(this.vL_Available);
    this.mapOl.removeLayer(this.vL_Bonus);
    this.mapOl.removeLayer(this.vL_MyPosition);
    this.mapOl.removeLayer(this.vL_MyTarget);
    this.mapOl.removeLayer(this.vL_Piste);
  }

  /***
   * Add all layer on map
   * 
   ***/
  addAllLayerOnMap() {
    if(this.displayedPiste) {
      this.mapOl.addLayer(this.vL_Piste);
    }
    this.mapOl.addLayer(this.vL_Closed);
    this.mapOl.addLayer(this.vL_Empty);
    this.mapOl.addLayer(this.vL_Full);
    this.mapOl.addLayer(this.vL_Available);
    this.mapOl.addLayer(this.vL_MyPosition);
    this.mapOl.addLayer(this.vL_MyTarget);
    this.mapOl.addLayer(this.vL_Bonus);
  }
}
