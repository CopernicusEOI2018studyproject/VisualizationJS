import { Component, Input, EventEmitter, OnInit, OnChanges, Output } from '@angular/core';
import * as L from 'leaflet';
// import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { FloodService } from './../services/flood.service';
import { MatSnackBar } from '@angular/material';
import { CustomsnackbarComponent, WarningsnackbarComponent, SuccesssnackbarComponent } from './../customsnackbar/customsnackbar.component';
// import { EmitterService } from './../emitter.service';
// import { FloodingStation } from '../model/floodingStation';
// import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  providers: [FloodService]
})

export class MapComponent implements OnInit, OnChanges {

  @Input()
  public datasetName: string;
  public options;
  public layers;
  public subscribed: boolean;

  private floodingList;
  private startFloodService;
  private map;

  // if there is no flooding
  private markerIconFalse = L.icon({
    iconUrl: '/assets/img/leaf-green.png',    // '/assets/img/flood-512.png',
    shadowUrl: '/assets/img/leaf-shadow.png',
    iconSize: [38, 95],
    shadowSize: [50, 64],
    iconAnchor: [22, 94],
    shadowAnchor: [4, 62],
    popupAnchor: [-3, -76]
  });

  // if there is flooding
  private markerIconTrue = L.icon({
    iconUrl: '/assets/img/leaf-red.png',    // '/assets/img/flood-512.png',
    shadowUrl: '/assets/img/leaf-shadow.png',
    iconSize: [38, 95],
    shadowSize: [50, 64],
    iconAnchor: [22, 94],
    shadowAnchor: [4, 62],
    popupAnchor: [-3, -76]
  });

  constructor(
    private floodService: FloodService,
    public snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.options = {
      layers: [
        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
      ],
      zoom: 5, // 15,
      center: L.latLng(51.964859, 7.598607)
    };
    this.floodingList = [];
  }

  ngOnChanges(changes: any) {
    if (changes.datasetName.currentValue !== changes.datasetName.previousValue) {
      this.changeDataset(this.datasetName);
    }
  }

  onMapReady(map: L.Map) {
    // Do stuff with map
    console.log('Map ready');
    this.map = map;

    this.map.on('load moveend', function (e) {
      console.log(e);
      let options = {
        zoom: map.getZoom(),
        bounds: map.getBounds()
      };

      // this.drawGrid(options);
    });
  }

  public changeDataset(fileName: string) {
    this.floodService.getFloodingStationsByFileName(fileName)
      .subscribe(
        res => {
          if (res.length > 0) {
            this.layers = this.addStationsToMap(res);
            this.snackBar.openFromComponent(SuccesssnackbarComponent, {
              data: 'Data added from: ' + fileName,
              panelClass: ['snack-bar-success'],
              duration: 3000,
            });
          } else {
            this.snackBar.openFromComponent(CustomsnackbarComponent, {
              data: 'No data added.',
              panelClass: ['snack-bar-default'],
              duration: 3000,
            });
          }
        },
        err => {
          this.snackBar.openFromComponent(WarningsnackbarComponent, {
            data: err.error.error,
            panelClass: ['snack-bar-warning'],
            duration: 3000,
          });
        }
      );
  }

  private addStationsToMap(list) {
    let layersArray = [];

    list.forEach(el => {
      let marker = L.marker([el.lat, el.lon], {
        icon: (el['score'] >= 60 ? this.markerIconTrue : this.markerIconFalse),
        draggable: true
      });
      marker.on('dragend', function (e) {
        console.log(e);
        // document.getElementById('latitude').value = marker.getLatLng().lat;
        // document.getElementById('longitude').value = marker.getLatLng().lng;
      });
      // marker.bindPopup('score: ' + el['score']);
      marker.bindPopup('<h3>' + el.station + '</h3><p>score: ' + el['score'] + '</p>');
      console.log(el);
      if (el.changed) {

        el.changed = false;
      }
      layersArray.push(marker)
    });
    return layersArray;
  }

}