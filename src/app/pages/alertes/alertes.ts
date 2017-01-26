import { Component, OnInit } from '@angular/core';
import { Network } from 'ionic-native';

import { StationService } from '../../services/station.service';

const JSON_OPEN = "OPEN";

@Component({
  selector        : 'alertes-page',
  templateUrl     : 'alertes.html'
})

export class AlertesPage implements OnInit {
  items           : string[];                 //Array of closed station name
  length          : any;                      //Number of closed station
  notConnected    : boolean;                  //Devise is connected to internet ?

  constructor(
    private stationService : StationService
  ) { }

  /***
   * Get all closed stations
   * 
   * @return list of station name
   ***/
  getAlertes() {
    this.stationService.getStations().subscribe(stations => {
        this.items = [];
        stations.forEach(element => {
          if (element.status != JSON_OPEN) {
            this.items.push(element.name);
          }
        })
        this.length = this.items.length;
      });
  }

  /***
   * Get all needed informations
   ***/
  ngOnInit() {
    this.getAlertes();
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
