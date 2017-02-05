import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav } from 'ionic-angular';
import { StatusBar, Network } from 'ionic-native';
import { LocalisationPage } from './pages/localisation/localisation';
import { AlertesPage } from './pages/alertes/alertes';
import { FavoritesListPage } from './pages/favorites-list/favorites-list';
import { HelpPage } from './pages/help/help';

/******************************
* dev     : IonicVelov - Polytech Lyon
* version : 1.3
* author  : GERLAND Loïc - LETOURNEUR Léo
*******************************/
@Component({
  templateUrl     : 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav   : Nav;

  rootPage          : any = AlertesPage;
  pages             : Array<{title: string, component: any}>;
  notConnected      : boolean;

  constructor(
    public platform   : Platform,
    public menu       : MenuController
  ) {
    this.initializeApp();

    // set our app's pages
    this.pages = [
      { title: 'Alertes', component: AlertesPage },
      { title: 'Localisation', component: LocalisationPage },
      { title: 'Mes stations', component: FavoritesListPage },
      { title: 'Aide', component: HelpPage }
    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {

      this.menu.swipeEnable(false, 'menu1');            //Disable menu swiping
      StatusBar.styleLightContent();                    //Set status bar font to white
      this.checkConnection();
    });
  }

  openPage(page) {
  
    this.menu.close();                  //Close the menu when clicking a link from the menu
    this.nav.setRoot(page.component);   //Navigate to the new page if it is not the current page
  }

  /***
   * Check connection every second
   ***/
  checkConnection() {
    setTimeout(() => {  
      this.notConnected = Network.connection === "none";
      this.checkConnection();
    }, 1000);
  }
}
