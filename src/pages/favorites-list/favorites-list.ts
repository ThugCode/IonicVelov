import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FavoritesDetailPage } from '../favorites-detail/favorites-detail';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
//import { File } from 'ionic-native';

//declare var cordova: any; 

@Component({
  selector: 'favorites-list-page',
  templateUrl: 'favorites-list.html'
})

export class FavoritesListPage {
  
  //filePath: string;
  selectedItem: any;
  items: Array<{name: string, 
                statut: string, 
                bike_stands: string, 
                available_bikes: string, 
                available_bike_stands: string}>;

  constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http) {
    this.selectedItem = navParams.get('item');

    var url = "https://download.data.grandlyon.com/ws/rdata/jcd_jcdecaux.jcdvelov/all.json";
    this.http.get(url)
        .map(res => res.json())
        .subscribe(data => {
            this.items = [];
            var prefered = ["768", "844", "923"];
            data.values.forEach(element => {
              if(prefered.indexOf(element.gid)>=0) {
                this.items.push({
                  name: element.name,
                  statut: element.status,
                  bike_stands : element.bike_stands,
                  available_bikes : element.available_bikes, 
                  available_bike_stands : element.available_bike_stands
                });
              }
            })
        });
        
    //this.filePath = cordova.file.dataDirectory;
    //this.filePath = "../../../../..";
    
    //File.checkDir(this.filePath, 'appliVelov').then(_ => console.log('yay1')).catch(err => console.log('boooh1'));
    //File.createDir(this.filePath, 'appliVelov', true);
    //File.checkDir(this.filePath, 'appliVelov').then(_ => console.log('yay2')).catch(err => console.log('boooh2'));
  }

  itemTapped(event, item) {
    this.navCtrl.push(FavoritesDetailPage, {
      item: item
    });
  }
}
