import { Component, OnInit } from '@angular/core';
import { StationService } from '../../services/station.service';

const JSON_OPEN = "OPEN";

@Component({
  selector        : 'alertes-page',
  templateUrl     : 'alertes.html'
})

/******************************
* dev     : IonicVelov - Polytech Lyon
* version : 1.3
* author  : GERLAND Loïc - LETOURNEUR Léo
*******************************/
export class AlertesPage implements OnInit {
  items           : string[];                 //Array of closed station name
  length          : any;                      //Number of closed station

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
   * Get all needed informations at initialisation
   ***/
  ngOnInit() {
    this.getAlertes();
  }
}
