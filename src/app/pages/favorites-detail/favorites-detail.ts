import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Network } from 'ionic-native';

@Component({
  selector            : 'favorites-detail-page',
  templateUrl         : 'favorites-detail.html'
})
export class FavoritesDetailPage {
  selectedItem        : any;                      //Station to display
  notConnected        : boolean;                  //Devise is connected to internet ?

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams
  ) {
    this.selectedItem = navParams.get('item');
    this.selectedItem.bonus = this.selectedItem.bonus == "Oui";
    this.updateScreen();
  }

  /***
   * Update connection bar every 2s
   ***/
  updateScreen() {
    this.notConnected = Network.connection === "none";
    setTimeout(() => {  
      this.updateScreen();
    }, 2000);
  }
}
