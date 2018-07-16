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
  public layersControl= {
    baseLayers: {},
    overlays: {}
  };
  
  private gridParts = [];
  private floodingList;
  private startFloodService;
  private geohashes = [];
  private map;
  private defaults = {
    zoom: 5,
    maxDisplay: 10240,
    geohashPrecision: 12,
    geohashZoomScale: [
      // 00, 01, 02, 03, 04, 05, 06, 07, 08, 09, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24
      1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9
    ]
  }

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
        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { minZoom: 6, maxZoom: 18, attribution: '...' })
      ],
      zoom: 6, // 15,
      center: L.latLng(51.964859, 7.598607)
    };
    this.floodingList = [];
  }

  ngOnChanges(changes: any) {
    if (changes.datasetName.currentValue !== changes.datasetName.previousValue) {
      this.changeDataset(this.datasetName);
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
      that.drawGrid(map, options);
    });

  }

  public changeDataset(fileName: string) {
    this.floodService.getFloodingStationsByFileName(fileName)
      .subscribe(
        res => {
          if (res.length > 0) {
            this.layers = this.addStationsToMap(res);
            // add markers as overlay layer to map
            let markers = L.layerGroup(this.layers);
            this.layersControl.overlays['markers'] = markers;
            // console.log(this.defaults.geohashZoomScale[this.map.getZoom()]);

            // redraw grid
            let options = {
              zoom: this.map.getZoom(),
              bounds: this.map.getBounds()
            };
            this.drawGrid(this.map, options);

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
    let geohashArray = [];

    list.forEach(el => {
      // define marker
      let marker = L.marker([el.lat, el.lon], {
        icon: (el['score'] >= 60 ? this.markerIconTrue : this.markerIconFalse)
      });

      // check if geohash is already in list
      if (el.geohash !== undefined) {
        let idx = geohashArray.findIndex((hash) => hash === el.geohash);
        if (idx < 0) {
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

  private drawGrid(map, options) {
    let level = this.defaults.geohashZoomScale[options.zoom];
    let ne = options.bounds.getNorthEast();
    let sw = options.bounds.getSouthWest();
    let neHash = this.encode(ne.lat, ne.lng, level);
    let nwHash = this.encode(ne.lat, sw.lng, level);
    let swHash = this.encode(sw.lat, sw.lng, level);
    let seHash = this.encode(sw.lat, ne.lng, level);
    let current = neHash;
    let eastBound = neHash;
    let westBound = nwHash;
    let maxHash = this.defaults.maxDisplay;

    this.eraseGrid(map);
    while (maxHash-- > 0) {
      this.drawBox(current, map);
      do {
        current = this.adjacent(current, 'w');
        this.drawBox(current, map);
      } while (maxHash-- > 0 && current != westBound);
      if (current == swHash) {
        // add grid to layer control
        if (this.layersControl.overlays['grid cells']) {
          this.map.removeLayer(this.layersControl.overlays['grid cells']);
        }

        let gridBox = L.layerGroup(this.gridParts);
        this.map.addLayer(gridBox);
        this.layersControl.overlays['grid cells'] = gridBox;
        return;
      }
      westBound = this.adjacent(current, 's');
      current = eastBound = this.adjacent(eastBound, 's');
    }

    alert("defaults.maxDisplay limit reached");
    this.eraseGrid(map);
  }

  private eraseGrid(map) {
    for (let i = 0; i < this.gridParts.length; i++) {
      map.removeLayer(this.gridParts[i]);
    }
    this.gridParts.length = 0;
  }

  private drawBox(box, map) {
    let b = this.bounds(box);
    let gb = new L.LatLngBounds(
      new L.LatLng(b.sw.lat, b.sw.lon),
      new L.LatLng(b.ne.lat, b.ne.lon)
    );

    let gridColor = '#222222';
    let gridOpacity = 0.1;

    let hashLvl = this.defaults.geohashZoomScale[this.map.getZoom()];
    let hashArray = this.geohashes.filter((hash) => hash.substring(0, hashLvl) === box.substring(0, hashLvl));
    // this.geohashes.findIndex((hash) => hash.substring(0, hashLvl) === box.substring(0, hashLvl))
    if (hashArray.length > 0) {
      // console.log(hashArray);
      // TODO: change color from green to red --> for amount of hashes
      // console.log(box);
      gridColor = '#ff0000';
      gridOpacity = 0.5;
    }

    let rect = L.rectangle(
      gb, // bounds
      {
        stroke: true,
        color: '#3333AA',
        opacity: 0.5,
        fillColor: gridColor, // TODO: change to red: '#ff0000'
        fillOpacity: gridOpacity,
        weight: 1
      }
    );
    // map.addLayer(rect);
    this.gridParts.push(rect);
  }

  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
  /** Geohash encoding/decoding and associated functions by Chris Veness 2014 / MIT Licence
   *  adapted by Torben Kraft to the needs of the Web Application.
  */
  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

  /**
   * Geohash encode, decode, bounds, neighbours.
   *
   * @namespace
   */
  /* (Geohash-specific) Base32 map */
  public geohash = {
    base32: '0123456789bcdefghjkmnpqrstuvwxyz'
  };

  /**
   * Encodes latitude/longitude to geohash, either to specified precision or to automatically
   * evaluated precision.
   *
   * @param   {number} lat - Latitude in degrees.
   * @param   {number} lon - Longitude in degrees.
   * @param   {number} [precision] - Number of characters in resulting geohash.
   * @returns {string} Geohash of supplied latitude/longitude.
   * @throws  Invalid geohash.
   *
   * @example
   *     let geohash = Geohash.encode(52.205, 0.119, 7); // geohash: 'u120fxw'
   */
  private encode(lat, lon, precision) {
    // infer precision?
    if (typeof precision == 'undefined') {
      // refine geohash until it matches precision of supplied lat/lon
      for (let p = 1; p <= 12; p++) {
        let hash = this.encode(lat, lon, p);
        let posn = this.decode(hash);
        if (posn.lat == lat && posn.lon == lon) return hash;
      }
      precision = 12; // set to maximum
    }

    lat = Number(lat);
    lon = Number(lon);
    precision = Number(precision);

    if (isNaN(lat) || isNaN(lon) || isNaN(precision)) throw new Error('Invalid geohash');

    let idx = 0; // index into base32 map
    let bit = 0; // each char holds 5 bits
    let evenBit = true;
    let geohash = '';

    let latMin = -90, latMax = 90;
    let lonMin = -180, lonMax = 180;

    while (geohash.length < precision) {
      if (evenBit) {
        // bisect E-W longitude
        let lonMid = (lonMin + lonMax) / 2;
        if (lon > lonMid) {
          idx = idx * 2 + 1;
          lonMin = lonMid;
        } else {
          idx = idx * 2;
          lonMax = lonMid;
        }
      } else {
        // bisect N-S latitude
        let latMid = (latMin + latMax) / 2;
        if (lat > latMid) {
          idx = idx * 2 + 1;
          latMin = latMid;
        } else {
          idx = idx * 2;
          latMax = latMid;
        }
      }
      evenBit = !evenBit;

      if (++bit == 5) {
        // 5 bits gives us a character: append it and start over
        geohash += this.geohash.base32.charAt(idx);
        bit = 0;
        idx = 0;
      }
    }

    return geohash;
  };

  /**
   * Decode geohash to latitude/longitude (location is approximate centre of geohash cell,
   *     to reasonable precision).
   *
   * @param   {string} geohash - Geohash string to be converted to latitude/longitude.
   * @returns {{lat:number, lon:number}} (Center of) geohashed location.
   * @throws  Invalid geohash.
   *
   * @example
   *     let latlon = Geohash.decode('u120fxw'); // latlon: { lat: 52.205, lon: 0.1188 }
   */
  private decode(geohash) {

    let bounds = this.bounds(geohash); // <-- the hard work
    // now just determine the centre of the cell...

    let latMin = bounds.sw.lat, lonMin = bounds.sw.lon;
    let latMax = bounds.ne.lat, lonMax = bounds.ne.lon;

    // cell centre
    let lat = (latMin + latMax) / 2;
    let lon = (lonMin + lonMax) / 2;

    // round to close to centre without excessive precision: ⌊2-log10(Δ°)⌋ decimal places
    let newlat = lat.toFixed(Math.floor(2 - Math.log(latMax - latMin) / Math.LN10));
    let newlon = lon.toFixed(Math.floor(2 - Math.log(lonMax - lonMin) / Math.LN10));

    return { lat: Number(newlat), lon: Number(newlon) };
  };

  /**
   * Returns SW/NE latitude/longitude bounds of specified geohash.
   *
   * @param   {string} geohash - Cell that bounds are required of.
   * @returns {{sw: {lat: number, lon: number}, ne: {lat: number, lon: number}}}
   * @throws  Invalid geohash.
   */
  private bounds(geohash) {
    if (geohash.length === 0) throw new Error('Invalid geohash');

    geohash = geohash.toLowerCase();

    let evenBit = true;
    let latMin = -90, latMax = 90;
    let lonMin = -180, lonMax = 180;

    for (let i = 0; i < geohash.length; i++) {
      let chr = geohash.charAt(i);
      let idx = this.geohash.base32.indexOf(chr);
      if (idx == -1) throw new Error('Invalid geohash');

      for (let n = 4; n >= 0; n--) {
        let bitN = idx >> n & 1;
        if (evenBit) {
          // longitude
          let lonMid = (lonMin + lonMax) / 2;
          if (bitN == 1) {
            lonMin = lonMid;
          } else {
            lonMax = lonMid;
          }
        } else {
          // latitude
          let latMid = (latMin + latMax) / 2;
          if (bitN == 1) {
            latMin = latMid;
          } else {
            latMax = latMid;
          }
        }
        evenBit = !evenBit;
      }
    }

    let bounds = {
      sw: { lat: latMin, lon: lonMin },
      ne: { lat: latMax, lon: lonMax }
    };

    return bounds;
  };

  /**
   * Determines adjacent cell in given direction.
   *
   * @param   geohash - Cell to which adjacent cell is required.
   * @param   direction - Direction from geohash (N/S/E/W).
   * @returns {string} Geocode of adjacent cell.
   * @throws  Invalid geohash.
   */
  private adjacent(geohash, direction) {
    // based on github.com/davetroy/geohash-js

    geohash = geohash.toLowerCase();
    direction = direction.toLowerCase();

    if (geohash.length === 0) throw new Error('Invalid geohash');
    if ('nsew'.indexOf(direction) == -1) throw new Error('Invalid direction');

    let neighbour = {
      n: ['p0r21436x8zb9dcf5h7kjnmqesgutwvy', 'bc01fg45238967deuvhjyznpkmstqrwx'],
      s: ['14365h7k9dcfesgujnmqp0r2twvyx8zb', '238967debc01fg45kmstqrwxuvhjyznp'],
      e: ['bc01fg45238967deuvhjyznpkmstqrwx', 'p0r21436x8zb9dcf5h7kjnmqesgutwvy'],
      w: ['238967debc01fg45kmstqrwxuvhjyznp', '14365h7k9dcfesgujnmqp0r2twvyx8zb']
    };
    let border = {
      n: ['prxz', 'bcfguvyz'],
      s: ['028b', '0145hjnp'],
      e: ['bcfguvyz', 'prxz'],
      w: ['0145hjnp', '028b']
    };

    let lastCh = geohash.slice(-1);    // last character of hash
    let parent = geohash.slice(0, -1); // hash without last character

    let type = geohash.length % 2;

    // check for edge-cases which don't share common prefix
    if (border[direction][type].indexOf(lastCh) != -1 && parent !== '') {
      parent = this.adjacent(parent, direction);
    }

    // append letter for direction to parent
    return parent + this.geohash.base32.charAt(neighbour[direction][type].indexOf(lastCh));
  };

  /**
   * Returns all 8 adjacent cells to specified geohash.
   *
   * @param   {string} geohash - Geohash neighbours are required of.
   * @returns {{n,ne,e,se,s,sw,w,nw: string}}
   * @throws  Invalid geohash.
   */
  private neighbours(geohash) {
    return {
      'n': this.adjacent(geohash, 'n'),
      'ne': this.adjacent(this.adjacent(geohash, 'n'), 'e'),
      'e': this.adjacent(geohash, 'e'),
      'se': this.adjacent(this.adjacent(geohash, 's'), 'e'),
      's': this.adjacent(geohash, 's'),
      'sw': this.adjacent(this.adjacent(geohash, 's'), 'w'),
      'w': this.adjacent(geohash, 'w'),
      'nw': this.adjacent(this.adjacent(geohash, 'n'), 'w')
    };
  };

  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

}