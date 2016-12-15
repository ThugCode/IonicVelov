import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FavoritesDetailPage } from '../favorites-detail/favorites-detail';

import { StationService } from '../../services/station.service';
import { FileService } from '../../services/file.service';
import { Station } from '../../models/station';
import { Platform } from 'ionic-angular';
import { ItemSliding } from 'ionic-angular';

@Component({
  selector: 'favorites-list-page',
  templateUrl: 'favorites-list.html'
})

export class FavoritesListPage implements OnInit {

  selectedItem: any;
  items: Station[];
  length: any;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private stationService: StationService,
    private fileService: FileService,
    private platform: Platform
  ) {
    this.selectedItem = navParams.get('item');
  }

  getStations() {
    this.stationService.getStations().subscribe(stations => {

      if (this.platform.is('mobile')) {
        console.log("Mobile device !");
        this.fileService.readStationFromFile().then(prefered => {
          this.getFavoris(stations, prefered);
        });
      }
      else {
        var prefered = [];//"768", "844", "923"];
        this.getFavoris(stations, prefered);
      }
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
    this.getStations();
  }

  delete(slidingItem: ItemSliding, item) {
    slidingItem.close();
    if (this.platform.is('mobile')) {
      this.fileService.removeStationToFile(item.gid);
    }
    this.items.splice(this.items.indexOf(item), 1);
    this.length--;
  }

  itemTapped(event, item) {
    this.navCtrl.push(FavoritesDetailPage, {
      item: item
    });
  }
}
