import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FavoritesDetailPage } from '../favorites-detail/favorites-detail';

import { StationService } from '../../services/station.service';
import { FileService } from '../../services/file.service';
import { Station } from '../../models/station';
import { Network } from 'ionic-native';
import { ItemSliding } from 'ionic-angular';

@Component({
  selector: 'favorites-list-page',
  templateUrl: 'favorites-list.html'
})

export class FavoritesListPage implements OnInit {

  selectedItem: any;
  items: Station[];
  length: any;
  notConnected: boolean;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private stationService: StationService,
    private fileService: FileService
  ) {
    this.selectedItem = navParams.get('item');
  }

  getStations() {
    this.stationService.getStations().subscribe(stations => {
        this.fileService.readFavoritesFromFile().then(prefered => {
          this.getFavoris(stations, prefered);
        });
    });
  }

  getFavoris(stations, prefered) {

    this.items = [];
    stations.forEach(element => {
      if (prefered.indexOf(element.gid) >= 0) {
        element.status = element.status == 'OPEN' ? 'Ouverte' : 'Fermée';
        this.items.push(element);
      }
    });
    this.length = this.items.length;
  }

  ngOnInit() {
    this.notConnected = Network.connection === "none";
    this.getStations();
    this.updateScreen();
  }

  updateScreen() {
    setTimeout(() => {  
      this.notConnected = Network.connection === "none";
      this.updateScreen();
    }, 2000);
  }

  delete(slidingItem: ItemSliding, item) {
    slidingItem.close();
    this.fileService.removeStationToFile(item.gid);
    this.items.splice(this.items.indexOf(item), 1);
    this.length--;
  }

  itemTapped(event, item) {
    this.navCtrl.push(FavoritesDetailPage, {
      item: item
    });
  }
}
