import { ChangeDetectorRef, Component, Input, EventEmitter, OnInit, OnChanges, Output } from '@angular/core';
import * as L from 'leaflet';
import { FloodService } from './../services/flood.service';
import { GeohashService } from './../services/geohash.service';
import { MatSnackBar } from '@angular/material';
import { CustomsnackbarComponent, WarningsnackbarComponent, SuccesssnackbarComponent } from './../customsnackbar/customsnackbar.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  providers: [FloodService, GeohashService]
})

export class MapComponent implements OnInit, OnChanges {

  @Input()
  public datasetName: string;

  @Input()
  public selection: string;

  @Input()
  public highlight: number;

  public options;
  public layers;
  public subscribed: boolean;
  public layersControl= {
    baseLayers: {},
    overlays: {}
  };
  
  private gridParts = [];
  private floodingList;
  private startFloodService;
  private geohashes = [];
  private map;
  private datasets;
  private defaults = {
    zoom: 5,
    maxDisplay: 10240,
    geohashPrecision: 12,
    geohashZoomScale: [
      // 00, 01, 02, 03, 04, 05, 06, 07, 08, 09, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24
      1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9
    ]
  }

  // markers from https://github.com/pointhi/leaflet-color-markers
  // if there is no flooding
  private markerIconFalse = L.icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // if there is flooding
  private markerIconTrue = L.icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  constructor(
    private floodService: FloodService,
    private geohashService: GeohashService,
    public snackBar: MatSnackBar,
    // private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.options = {
      layers: [
        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { minZoom: 6, maxZoom: 18, attribution: '...' })
      ],
      zoom: 6, // 15,
      center: L.latLng(51.964859, 7.598607)
    };
    this.selection = 'Biggest';
    this.highlight = 50;
    this.floodingList = [];
  }

  public ngDoCheck(): void {
    // this.cdr.detectChanges();
  }

  ngOnChanges(changes: any) {
    
    if (changes.datasetName) {
      if (changes.datasetName.currentValue !== changes.datasetName.previousValue) {
        this.changeDataset(this.datasetName);
      }
    }
    if (changes.selection) {
      if (changes.selection.currentValue !== changes.selection.previousValue) {
        this.drawStations(this.selection);
      }
    }
    if (changes.highlight) {
      if (changes.highlight.currentValue !== changes.highlight.previousValue) {
        this.drawStations(this.selection);
      }

    }
  }

  onMapReady(this, map: L.Map) {
    console.log('Map ready');
    this.map = map;
    let that = this;

    // define and set maximum bounds to Germany
    let maxBounds = new L.LatLngBounds(
      new L.LatLng(46.727536, 4.546294),
      new L.LatLng(55.374176, 16.269279)
    );

    map.setMaxBounds(maxBounds);

    this.map.on('load moveend', function (e) {
      let options = {
        zoom: map.getZoom(),
        bounds: map.getBounds()
      };
      that.drawGrid(options); 
    });

  }
private markers;
private gridBox;

  public changeDataset(fileName: string) {
    this.floodService.getFloodingStationsByFileName(fileName)
      .subscribe(
        res => {
          if (res !== undefined && res[this.selection] !== undefined) {
            if (res[this.selection].length > 0) {
              this.datasets = res;
              this.drawStations(this.selection);

              this.snackBar.openFromComponent(SuccesssnackbarComponent, {
                data: 'Data added from: ' + fileName,
                panelClass: ['snack-bar-success'],
                duration: 3000,
              });
            } else {
              this.snackBar.openFromComponent(CustomsnackbarComponent, {
                data: 'No data added for '+this.selection+'.',
                panelClass: ['snack-bar-default'],
                duration: 3000,
              });
            }
          } else {
            this.snackBar.openFromComponent(CustomsnackbarComponent, {
              data: 'No data available.',
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

  private drawStations(selectedKey) {
    if (this.datasets !== undefined) {
      let stationsList = this.datasets[selectedKey];
  
      let layers = this.addStationsToMap(stationsList);
      // add markers as overlay layer to map
      if (this.markers) {
        this.markers.clearLayers();
      }
      this.markers = L.layerGroup(layers);
      this.layersControl.overlays['markers'] = this.markers;
      this.map.addLayer(this.markers);
  
      // redraw grid
      let options = {
        zoom: this.map.getZoom(),
        bounds: this.map.getBounds()
      };
      this.drawGrid(options);
    }
    
  }

  private addStationsToMap(list) {
    let layersArray = [];
    let geohashArray = [];

    list.forEach(el => {
      // define marker
      let marker = L.marker([el.lat, el.lon], {
        icon: (el['score'] >= this.highlight ? this.markerIconTrue : this.markerIconFalse)
      });

      // check if geohash is already in list
      if (el.geohash !== undefined) {
        let idx = geohashArray.findIndex((hash) => hash === el.geohash);
        if (idx < 0 && el['score'] >= this.highlight) {
          geohashArray.push(el.geohash);
        }
      }
      // add popup to marker
      marker.bindPopup('<h3>' + el.station + '</h3><p>score: ' + el['score'] + '</p>');
      if (el.changed) {
        el.changed = false;
      }
      layersArray.push(marker)
    });
    this.geohashes = geohashArray;
    return layersArray;
  }

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/** Grid drawing and associated functions by Rodrigo Zanato Tripodi 2015
 *  / Github: rzanato
 *  / MIT Licence
 *  https://github.com/rzanato/geohashgrid
 *  adapted by Torben Kraft to the needs of the Web Application (angular version 6+).
 */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

  private drawGrid(options) {
    let level = this.defaults.geohashZoomScale[options.zoom];
    let ne = options.bounds.getNorthEast();
    let sw = options.bounds.getSouthWest();
    let neHash = this.geohashService.encode(ne.lat, ne.lng, level);
    let nwHash = this.geohashService.encode(ne.lat, sw.lng, level);
    let swHash = this.geohashService.encode(sw.lat, sw.lng, level);
    let seHash = this.geohashService.encode(sw.lat, ne.lng, level);
    let current = neHash;
    let eastBound = neHash;
    let westBound = nwHash;
    let maxHash = this.defaults.maxDisplay;

    this.eraseGrid();

    while (maxHash-- > 0) {
      this.drawBox(current);
      do {
        current = this.geohashService.adjacent(current, 'w');
        this.drawBox(current);
      } while (maxHash-- > 0 && current != westBound);
      if (current == swHash) {
        let grids = [];
        this.gridParts.forEach((el) => {
          grids.push(el);
        })
        // TODO - ERROR - layer control is not updating automatically when changing this.layersControl
        // add grid to layer control
        this.gridBox = L.layerGroup(grids);
        // this.layersControl.overlays['gridcells'] = this.gridBox;
        this.map.addLayer(this.gridBox);

        return;
      }
      westBound = this.geohashService.adjacent(current, 's');
      current = eastBound = this.geohashService.adjacent(eastBound, 's');
    }

    alert("defaults.maxDisplay limit reached");
    this.eraseGrid();
  }

  private eraseGrid() {
    if (this.gridBox) {
      this.gridBox.clearLayers();
      // this.map.removeLayer(this.layersControl.overlays['gridcells']);
    }
    this.gridParts = [];
  }

  private drawBox(box) {
    let b = this.geohashService.bounds(box);
    let gb = new L.LatLngBounds(
      new L.LatLng(b.sw.lat, b.sw.lon),
      new L.LatLng(b.ne.lat, b.ne.lon)
    );

    let hashLvl = this.defaults.geohashZoomScale[this.map.getZoom()];
    let hashArray = this.geohashes.filter((hash) => hash.substring(0, hashLvl) === box.substring(0, hashLvl));
    let gridColor = '#222222';
    let gridOpacity = 0.0;

    if (hashArray.length > 0) {
      let hue = 60;

      hue = 60 - (hashArray.length * 4);
      if (hashArray.length > 15) {
        hue = 0;
      }
      gridColor = 'hsl('+hue+', 100%, 50%)'; // '#ff0000';
      gridOpacity = 0.5;
      // console.log(box);
    }

    let rect = L.rectangle(
      gb, // bounds
      {
        stroke: true,
        color: '#3333AA',
        opacity: 0.5,
        fillColor: gridColor,
        fillOpacity: gridOpacity,
        weight: 1
      }
    );
    this.gridParts.push(rect);
  }

}