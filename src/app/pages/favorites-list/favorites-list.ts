import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ItemSliding } from 'ionic-angular';
import { FavoritesDetailPage } from '../favorites-detail/favorites-detail';
import { StationService } from '../../services/station.service';
import { FileService } from '../../services/file.service';
import { Station } from '../../models/station';

const TEXT_OPENED = "Ouverte";
const TEXT_CLOSED = "Fermée";
const JSON_OPEN = "OPEN";

@Component({
  selector: 'favorites-list-page',
  templateUrl: 'favorites-list.html'
})

/******************************
* dev     : IonicVelov - Polytech Lyon
* version : 1.3
* author  : GERLAND Loïc - LETOURNEUR Léo
*******************************/
export class FavoritesListPage implements OnInit {

  selectedItem                    : any;              //Selected station in list
  items                           : Station[];        //Array of stations
  length                          : any;              //Number of favorite stations

  constructor(
    private navCtrl         : NavController,
    private navParams       : NavParams,
    private stationService  : StationService,
    private fileService     : FileService
  ) {
    this.selectedItem = navParams.get('item');
  }

  /***
   * Get all stations and favorites id 
   * to make a list of favorites stations
   * 
   ***/
  getStations() {
    this.stationService.getStations().subscribe(stations => {
        this.fileService.readFavoritesFromFile().then(prefered => {
          this.getFavoris(stations, prefered);
        });
    });
  }

  /***
   * Make a list of favorites stations
   * by comparing id from favorite file and Json stations
   * 
   * @param stations : Station[]
   * @param prefered : any[] used to be integer[]
   ***/
  getFavoris(stations, prefered) {

    this.items = [];
    stations.forEach(element => {
      if (prefered.indexOf(element.gid) >= 0) {
        element.status = element.status == JSON_OPEN ? TEXT_OPENED : TEXT_CLOSED;
        this.items.push(element);
      }
    });
    this.length = this.items.length;
  }

  /***
   * Get all needed informations at initialisation
   ***/
  ngOnInit() {
    this.getStations();
  }

  /***
   * Delete a favorite station from list
   * 
   * @param slidingItem : ItemSliding
   * @param item : Station
   ***/
  delete(slidingItem: ItemSliding, item) {
    slidingItem.close();                              //Close visual slide bar
    this.fileService.removeStationToFile(item.gid);   //Remove id from file
    this.items.splice(this.items.indexOf(item), 1);   //Remove station from list
    this.length--;                                    //If length become 0, view will display a message
  }

  /***
   * Click on station line to display 
   * all information in detail view
   * 
   * @param event : Event
   * @param item : Station
   ***/
  itemTapped(event, item) {
    this.navCtrl.push(FavoritesDetailPage, {
      item: item
    });
  }
}
