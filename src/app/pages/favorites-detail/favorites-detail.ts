import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';
import { Network } from 'ionic-native';

@Component({
  selector: 'favorites-detail-page',
  templateUrl: 'favorites-detail.html'
})
export class FavoritesDetailPage {
  selectedItem: any;
  notConnected: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    
    this.notConnected = Network.connection === "none";
    
    this.selectedItem = navParams.get('item');
  }
}
