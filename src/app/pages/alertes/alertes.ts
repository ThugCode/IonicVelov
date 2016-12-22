import { Component, OnInit } from '@angular/core';

import { StationService } from '../../services/station.service';
import { Station } from '../../models/station';

@Component({
  selector: 'alertes-page',
  templateUrl: 'alertes.html'
})

export class AlertesPage implements OnInit {
  stations: Station[];
  items: string[];
  length: any;

  constructor(
    private stationService: StationService
  ) { }

  getAlertes() {
    this.stationService.getStations()
      .subscribe(stations => {
        this.stations = stations;
        this.items = [];
        this.stations.forEach(element => {
          if (element.status != "OPEN") {
            this.items.push(element.name);
          }
        })
        this.length = this.items.length;
      });
  }

  ngOnInit() {
    this.getAlertes();
  }
}