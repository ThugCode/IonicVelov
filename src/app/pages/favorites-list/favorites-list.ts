import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FavoritesDetailPage } from '../favorites-detail/favorites-detail';

import { StationService } from '../../services/station.service';
import { Station } from '../../models/station';
import { File } from 'ionic-native';
import { Platform } from 'ionic-angular';
import { ItemSliding } from 'ionic-angular';

declare var cordova: any; 

@Component({
  selector: 'favorites-list-page',
  templateUrl: 'favorites-list.html'
})

export class FavoritesListPage implements OnInit {

  filePath: string;
  selectedItem: any;
  items: Station[];

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private stationService: StationService,
    private platform: Platform
  ) {
    this.selectedItem = navParams.get('item');
  }

  getFavoris() {
    this.stationService.getStations()
      .subscribe(stations => {
        this.items = [];
        var prefered = ["768", "844", "923"];
        stations.forEach(element => {
          if (prefered.indexOf(element.gid) >= 0) {
            element.status = element.status == 'OPEN' ? 'Ouverte' : 'Fermée';
            this.items.push(element);
          }
        })
      });
  }

  ngOnInit() {

    if (this.platform.is('mobile')) {

      this.filePath = cordova.file.dataDirectory;
      console.log("Mobile device !");
    } else if(this.platform.is('core')) {

      this.filePath = "../assets/files/";
      console.log("Computer device !");
    }
    
    //File.checkDir(this.filePath, 'appliVelov').then(_ => console.log('yay1')).catch(err => console.log('boooh1'));
    //File.createDir(this.filePath, 'appliVelov', true);
    //File.checkDir(this.filePath, 'appliVelov').then(_ => console.log('yay2')).catch(err => console.log('boooh2'));

    this.getFavoris();
  }

  share(slidingItem: ItemSliding) {
    slidingItem.close();
  }
  
  itemTapped(event, item) {
    this.navCtrl.push(FavoritesDetailPage, {
      item: item
    });
  }
}
