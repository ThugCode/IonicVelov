import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';

import { FavoritesDetailPage } from '../favorites-detail/favorites-detail';


@Component({
  selector: 'favorites-list-page',
  templateUrl: 'favorites-list.html'
})
export class FavoritesListPage {
  selectedItem: any;
  items: Array<{title: string, note: string}>;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item');

    this.items = [];
    for(let i = 1; i < 3; i++) {
      this.items.push({
        title: 'Station ' + i,
        note: 'Adresse #' + i
      });
    }
  }

  itemTapped(event, item) {
    this.navCtrl.push(FavoritesDetailPage, {
      item: item
    });
  }
}
