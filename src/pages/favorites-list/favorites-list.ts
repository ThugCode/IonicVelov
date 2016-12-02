import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FavoritesDetailPage } from '../favorites-detail/favorites-detail';

import { StationService } from '../../app/station.service';
import { Station } from '../../app/station';
//import { File } from 'ionic-native';

//declare var cordova: any; 

@Component({
  selector: 'favorites-list-page',
  templateUrl: 'favorites-list.html'
})

export class FavoritesListPage implements OnInit {

  //filePath: string;
  selectedItem: any;
  items: Station[];

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private stationService: StationService
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
            console.log(element);
            element.status == 'OPEN' ? 'Ouverte' : 'Fermée';
            this.items.push(element);
          }
        })
        console.log(this.items);
      });
  }

  ngOnInit() {
    this.getFavoris();
  }

  //this.filePath = cordova.file.dataDirectory;
  //this.filePath = "../../../../..";

  //File.checkDir(this.filePath, 'appliVelov').then(_ => console.log('yay1')).catch(err => console.log('boooh1'));
  //File.createDir(this.filePath, 'appliVelov', true);
  //File.checkDir(this.filePath, 'appliVelov').then(_ => console.log('yay2')).catch(err => console.log('boooh2'));

  itemTapped(event, item) {
    this.navCtrl.push(FavoritesDetailPage, {
      item: item
    });
  }
}
