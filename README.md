# VisualizationJS

__Web-application visualizing output of the process chain for detection of fluvial flooding events from open-access in-situ data.__

## Description

Datasets will be saved by the process chain. Access to these datasets will be given via API by a Node.js server. The Web-application gives the possibility to load the datasets and visualize the locations with the measured floding score in a leaflet map. The leaflet map is overlayed by a geohash grid. If one of the stations is detected as fluvial flooding event, the box of the geohash of the station is colored.

## Technologies

- [Angular](https://angular.io/)
- [Node.js](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)

## Quick start

### Run Server:

- go into server folder 
- `DEBUG=* nodemon start`

Server is running on port `4300`.

### Run WebApp:

- go into github repository folder
- run `ng serve --proxy-config proxy.conf.json`

App is running on port `4200`.

<!--
### Otherwise

- go into `github repository folder`
- run `npm start && nodemon start && nodemon start --prefix server`
-->

## Author

__Torben Kraft__ - [TeKraft](https://github.com/TeKraft)

### Credits

- [ngx-leaflet](https://github.com/Asymmetrik/ngx-leaflet) by Asymmetrik
- [geohash de-/encoding](https://github.com/chrisveness/latlon-geohash) by Chris Veness
- [grid overlay](https://github.com/rzanato/geohashgrid) by Rodrigo Zanato Tripodi