import { Component, ViewChild, OnInit } from '@angular/core';
import { Geolocation } from 'ionic-native';
import { Keyboard } from 'ionic-native';

import { FileService } from '../../services/file.service';
import { StationService } from '../../services/station.service';
import { Station } from '../../models/station';
import { LoadingController } from 'ionic-angular';
import { Network } from 'ionic-native';
import { ToastController, Searchbar } from 'ionic-angular';

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

const JSON_CLOSED = "CLOSED";
const JSON_OPEN = "OPEN";

@Component({
  selector: 'localisation-page',
  templateUrl: 'localisation.html'
})
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
  myPosition        : any;              //Position of user
  searchVisible     : boolean = false;  //Is search field visible ?
  stationFilter     : String;           //Search filter
  
  vL_All            : ol.layer.Vector;  //All vector
  vL_Closed         : ol.layer.Vector;  
  vL_Empty          : ol.layer.Vector;
  vL_Full           : ol.layer.Vector;
  vL_Available      : ol.layer.Vector;
  vL_Bonus          : ol.layer.Vector;
  vL_MyPosition     : ol.layer.Vector;
  vL_MyTarget       : ol.layer.Vector;


  constructor(
    private stationService: StationService,
    private loadingCtrl: LoadingController,
    private fileService: FileService,
    private toastCtrl: ToastController
  ) { 
    this.initialised = false;
  }

  ngOnInit() {

    this.notConnected = Network.connection === "none";
    this.stationFilter = "";
    this.loader = this.loadingCtrl.create({
      content: TEXT_THANKS_WAITING,
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
      this.hasPosition = true;
      this.getPrefered([resp.coords.longitude, resp.coords.latitude]);
    }).catch((error) => {
      this.hasPosition = false;
      this.getPrefered([4.85, 45.75]);
      console.log(TEXT_ENABLE_TO_FIND_LOCATION, error);
      alert(TEXT_ENABLE_TO_FIND_LOCATION);
    })
  }

  getPrefered(coords) {
    this.fileService.readFavoritesFromFile().then(prefered => {
      this.createMap(coords, prefered);
    }).catch((error) => {
      this.createMap(coords, []);
      console.log(TEXT_ENABLE_TO_FIND_YOUR_FAVORITE, error);
      alert(TEXT_ENABLE_TO_FIND_YOUR_FAVORITE);
    });
  }

  createMap(coords, prefered) {

    var long = coords[0];
    var lat = coords[1];

    var iconStyle = this.createPinStyle();

    var fS_MyPosition = [];
    this.myPosition = new ol.Feature({
      selectable : false,
      geometry: new ol.geom.Point(ol.proj.fromLonLat([long, lat]))
    });
    if(!this.hasPosition) {
      this.myPosition.setGeometry(null);
    }
    fS_MyPosition.push(this.myPosition);

    var vS_MyPosition = new ol.source.Vector({ features: fS_MyPosition });
    this.vL_MyPosition = new ol.layer.Vector({ source: vS_MyPosition, style: iconStyle });

    var mapImg = new ol.layer.Tile({
      source: new ol.source.OSM()
    });

    this.mapOl = new ol.Map({
      target: "map",
      layers: [mapImg],
      overlays: [new ol.Overlay({ element: document.getElementById('popup') })],
      view: new ol.View({
        center: ol.proj.fromLonLat([long, lat]),
        zoom: 15,
        minZoom: 6,
        maxZoom: 18
      }),
      controls : ol.control.defaults().extend([
          new ol.control.Zoom(),
          new ol.control.ZoomSlider()
        ])
    });

    this.createTargetLayer();

    this.loadStationVector(prefered);

    this.loader.dismiss();
    this.initialised = true;
    this.updateScreen();
  }


  createTargetLayer() {
    var fS_Target = [];
    this.targetPoint = new ol.Feature({
      selectable : false
    });
    fS_Target.push(this.targetPoint);
    var vS_Target = new ol.source.Vector({ features: fS_Target });
    this.vL_MyTarget = new ol.layer.Vector({ source: vS_Target, style: this.createStyle("blue", 10) });
  }


  loadStationVector(prefered) {

    var tempFeature;
    var fS_Closed = [];
    var fS_Empty = [];
    var fS_Full = [];
    var fS_Available = [];
    var fS_Bonus = [];
    var fS_All = [];

    this.stations.forEach(element => {

      tempFeature = new ol.Feature({
        selectable : true,
        geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(element.lng), parseFloat(element.lat)])),
        name: element.name,
        status: element.status,
        bikeStands: element.bike_stands,
        available: element.available_bike_stands,
        gid: element.gid,
        lat: element.lat,
        lng: element.lng,
        bonus: element.bonus == TEXT_YES,
        favorite: prefered.indexOf(element.gid) >= 0
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

    this.vL_Closed = new ol.layer.Vector({ source: vS_Closed, style: this.createStyle("red", 8) });
    this.vL_Empty = new ol.layer.Vector({ source: vS_Empty, style: this.createStyle("orange", 8) });
    this.vL_Full = new ol.layer.Vector({ source: vS_Full, style: this.createStyle("yellow", 8) });
    this.vL_Available = new ol.layer.Vector({ source: vS_Available, style: this.createStyle("green", 8) });
    this.vL_Bonus = new ol.layer.Vector({ source: vS_Bonus, style: this.createStyle("black", 2) });
    this.vL_All = new ol.layer.Vector({ source: vS_All });
    
    this.mapOl.addLayer(this.vL_Closed);
    this.mapOl.addLayer(this.vL_Empty);
    this.mapOl.addLayer(this.vL_Full);
    this.mapOl.addLayer(this.vL_Available);
    this.mapOl.addLayer(this.vL_Bonus);
    this.mapOl.addLayer(this.vL_MyPosition);
    this.mapOl.addLayer(this.vL_MyTarget);
  }






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

  updateScreen() {
    setTimeout(() => {  
      this.notConnected = Network.connection === "none";

      Geolocation.getCurrentPosition().then((resp) => {
        this.hasPosition = true;
        this.myPosition.setGeometry(new ol.geom.Point(
          ol.proj.fromLonLat([resp.coords.longitude, resp.coords.latitude]))
        );
      }).catch((error) => {
        this.hasPosition = false;
        this.myPosition.setGeometry(null);
        console.log(TEXT_ENABLE_TO_FIND_LOCATION, error);
      })

      this.updateScreen();
    }, 1000);
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
  }

  clickCloser() {
    this.stationSelected = null;
    this.targetPoint.setGeometry(null);
  }

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

  showSearchList() {
    this.searchVisible = true;
    /*setTimeout(() => {
      this.searchbar.setFocus();
    });*/
  }

  hideSearchList() {
    this.searchVisible = false;
    Keyboard.close();
  }

  searchStations() {
    this.stationsFiltered = this.stations.filter((station) => {
      return station.name.toLowerCase().indexOf(this.stationFilter.toLowerCase()) > -1;
    });
  }

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

  showPopup(feature) {
    if (feature && feature.get("selectable")) {
      this.stationSelected = {};
      this.stationSelected.name = feature.get("name");
      this.stationSelected.status = feature.get("status") == JSON_OPEN ? TEXT_OPENED : TEXT_CLOSED;
      this.stationSelected.bikestand = feature.get("bikeStands");
      this.stationSelected.available = feature.get("available");
      this.stationSelected.favorite = feature.get("favorite");
      this.stationSelected.gid = feature.get("gid");
      this.stationSelected.bonus = feature.get("bonus");

      this.targetPoint.setGeometry(new ol.geom.Point(feature.getGeometry().getCoordinates()));
      this.mapOl.getView().setCenter(feature.getGeometry().getCoordinates());
    }
  }

  presentToast(p_message) {
    let toast = this.toastCtrl.create({
      message: p_message,
      duration: 3000
    });
    toast.present();
  }

  centerOnMyPosition() {
    this.mapOl.getView().setCenter(this.myPosition.getGeometry().getCoordinates());
  }
  
  refreshData() {

    this.mapOl.removeLayer(this.vL_Closed);
    this.mapOl.removeLayer(this.vL_Empty);
    this.mapOl.removeLayer(this.vL_Full);
    this.mapOl.removeLayer(this.vL_Available);
    this.mapOl.removeLayer(this.vL_Bonus);
    this.mapOl.removeLayer(this.vL_MyPosition);
    this.mapOl.removeLayer(this.vL_MyTarget);

    this.stationService.getStations().subscribe(stations => {
        this.stations = stations;
        this.fileService.readFavoritesFromFile().then(prefered => {
          this.loadStationVector(prefered);
        }).catch((error) => {
          this.loadStationVector([]);
          console.log(TEXT_ENABLE_TO_FIND_YOUR_FAVORITE, error);
          alert(TEXT_ENABLE_TO_FIND_YOUR_FAVORITE);
        });
    });
  }
}
