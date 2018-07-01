import { Component, OnInit, OnChanges } from '@angular/core';
import * as L from 'leaflet';
// import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import {FloodService} from './../services/flood.service';
// import { EmitterService } from './../emitter.service';
// import { FloodingStation } from '../model/floodingStation';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  providers: [FloodService]
})
export class MapComponent implements OnInit, OnChanges {

  public options;
  public layers;
  
  private floodingList;

  private markerIcon = L.icon({
    iconUrl: '/assets/img/flood-512.png',
    iconSize: [38, 95],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76]
});
  
  constructor(
    private floodService: FloodService
  ) {  }

  ngOnInit() {

      this.options = {
        layers: [
          L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
        ],
        zoom: 15,
        center: L.latLng(51.964859, 7.598607)
      };

      this.getStationsList();
      this.floodingList;

  }

  ngOnChanges(changes:any) {
    // Listen to the 'list'emitted event so as populate the model
    // with the event payload
    // EmitterService.get(this.listId).subscribe((floodingList:FloodingStation[]) => {this.floodingList = floodingList});
  }

  onMapReady(map: L.Map) {
    // Do stuff with map
    console.log('Map ready');

  }

  private addStationsToMap(list) {
    let layersArray = [];

    list.forEach(el => {
      layersArray.push(L.marker([ el.lat, el.lon ], {icon: this.markerIcon}))
    });

    return layersArray;
  }

  private getStationsList() {
    
    this.floodService.getFloodingList()
    .subscribe(
      (stations) => {
        this.floodingList = stations //Bind to view
        this.layers = this.addStationsToMap(this.floodingList);

        // do stuff here when loaded
      },
      (err) => {
        // Log errors if any
        console.log(err);
      });

    }


}
