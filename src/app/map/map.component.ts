import { Component, OnInit, OnChanges } from '@angular/core';
import * as L from 'leaflet';
// import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import {FloodService} from './../services/flood.service';
// import { EmitterService } from './../emitter.service';
import { FloodingStation } from '../model/floodingStation';

import { HttpClient } from '@angular/common/http';


@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css'],
    providers: [FloodService]
})

export class MapComponent implements OnInit, OnChanges {

    public options;
    public layers;
    public subscribed: boolean;

    private floodingList;
    private startFloodService;

    // if there is no flooding
    private markerIconFalse = L.icon({
        iconUrl: '/assets/img/leaf-green.png',    // '/assets/img/flood-512.png',
        shadowUrl: '/assets/img/leaf-shadow.png',
        iconSize: [38, 95],
        shadowSize:   [50, 64],
        iconAnchor: [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76]
    });

    // if there is flooding
    private markerIconTrue = L.icon({
        iconUrl: '/assets/img/leaf-red.png',    // '/assets/img/flood-512.png',
        shadowUrl: '/assets/img/leaf-shadow.png',
        iconSize: [38, 95],
        shadowSize:   [50, 64],
        iconAnchor: [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76]
    });
  
    constructor(
        private floodService: FloodService,
        private http: HttpClient
    ) { }

  ngOnInit() {

    this.options = {
        layers: [
            L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
        ],
        zoom: 15,
        center: L.latLng(51.964859, 7.598607)
    };

    // this.getStationsList();
    this.floodingList = [];

    // testdata
    // this.floodingList =  [
    //     new FloodingStation ("Geo", 51.969512, 7.595881, Math.floor(Math.random() * Math.floor(100))),
    //     new FloodingStation ("Mensa", 51.965318, 7.600216, Math.floor(Math.random() * Math.floor(100))),
    //     new FloodingStation ("Math", 51.965939, 7.602946, Math.floor(Math.random() * Math.floor(100))),
    //     new FloodingStation ("Botanical Garden", 51.963627, 7.609006, 10)
    //     new FloodingStation ("UKM", 51.960963, 7.596732, 20)
    //     new FloodingStation ("Skin", 51.966846, 7.591325, 57)
    //     new FloodingStation ("Technologiepark", 51.976765, 8.597629, 78)
    // ]

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
        let marker = L.marker([ el.lat, el.lon ], {
            icon: ( el['score'] >= 60 ? this.markerIconTrue : this.markerIconFalse ),
            draggable: true
        });
        marker.on('dragend', function (e) {
            console.log(e);
            // document.getElementById('latitude').value = marker.getLatLng().lat;
            // document.getElementById('longitude').value = marker.getLatLng().lng;
        });
        // marker.bindPopup('score: ' + el['score']);
        marker.bindPopup('<h3>'+el.station+'</h3><p>score: '+el['score']+'</p>');
        console.log(el);
        if (el.changed) {
            
            el.changed = false;
        }

        layersArray.push(marker)
        });

        return layersArray;
    }

  private getStationsList() {

    this.startFloodService = this.floodService.getFloodingList()
        .subscribe(
        (stations) => {
            let newList = stations.concat(this.floodingList.filter(function (item) {

                let idx = stations.findIndex((elem, index, array) => {
                    if (elem.station === item.station) {
                        array[index].changed = true;
                        return true;
                    }
                    return false;
                })
                
                return idx < 0;
            })
            )

            this.floodingList = newList;
            this.layers = this.addStationsToMap(newList); // Bind to view
        },
            (err) => {
            // Log errors if any
            console.log('\n\n err');
            console.log(err);
        });

    }

    public startSubscription() {
        console.log("start stream");
        this.subscribed = true;
        this.getStationsList();
    }
    
    public stopSubscription() {
        console.log("stop stream");
        if (this.subscribed) {
            this.subscribed = false;
            this.startFloodService.unsubscribe();
        }
    }

    public getHistoricalData(url) {
        console.log("get historical");
        console.log(url);

        if (this.subscribed) {
            this.startFloodService.unsubscribe();
        }
        this.floodService.getFloodingListByURL(url)
            .subscribe(
                res => {
                    this.layers = this.addStationsToMap(res);
                },
                err => {
                    alert('Error:\n' + err.error.error);
                }
            );
    }

}
