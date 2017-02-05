import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector            : 'favorites-detail-page',
  templateUrl         : 'favorites-detail.html'
})

/******************************
* dev     : IonicVelov - Polytech Lyon
* version : 1.3
* author  : GERLAND Loïc - LETOURNEUR Léo
*******************************/
export class FavoritesDetailPage {
  selectedItem        : any;                      //Station to display

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams
  ) {
    this.selectedItem = navParams.get('item');
    this.selectedItem.bonus = this.selectedItem.bonus == "Oui";
  }
}
