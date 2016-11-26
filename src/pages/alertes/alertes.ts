import { Component } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Component({
  selector: 'alertes-page',
  templateUrl: 'alertes.html'
})

export class AlertesPage {
  
  stations: Array<any>;
  items: Array<string>;
  length: any;

  constructor(public http: Http) {
    var url = "https://download.data.grandlyon.com/ws/rdata/jcd_jcdecaux.jcdvelov/all.json";
    this.http.get(url)
        .map(res => res.json())
        .subscribe(data => {
            this.stations = data.values;
            console.log(data.fields)

            this.items = [];
            this.stations.forEach(element => {
              if(element.status != "OPEN") {
                this.items.push(element.name);
              }
            })
            this.length = this.items.length;
        });
  }
}
