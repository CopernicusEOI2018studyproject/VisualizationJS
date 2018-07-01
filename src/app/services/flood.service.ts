// Imports
import { Injectable }     from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { FloodingStation } from '../model/floodingStation';
import { Observable } from 'rxjs/Rx';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

@Injectable()
export class FloodService {
    // private instance variable to hold base url
    private floodingURL = '/assets/test/dataset.json';
    private myList;

    private bla = [
        {
            "station": "GEO",
            "recordTime": "2018-07-01T11:25:08.572Z",
            "lat": 51.969512,
            "lon": 7.595881,
            "score": 50
        },
        {
            "station": "Mensa",
            "recordTime": "2018-07-01T06:25:08.572Z",
            "lat": 51.965318,
            "lon": 7.600216,
            "score": 80
        },
        {
            "station": "Math",
            "recordTime": "2018-06-29T16:25:08.572Z",
            "lat": 51.965939, 
            "lon": 7.602946,
            "score": 100
        },
        {
            "station": "Botanical Garden",
            "recordTime": "2018-07-01T15:25:08.572Z",
            "lat": 51.963627,
            "lon": 7.609006,
            "score": 10
        },
        {
            "station": "UKM",
            "recordTime": "2018-07-01T14:25:08.572Z",
            "lat": 51.960963,
            "lon": 7.596732,
            "score": 20
        },
        {
            "station": "Skin",
            "recordTime": "2018-07-02T06:25:08.572Z",
            "lat": 51.966846,
            "lon": 7.591325,
            "score": 57
        },
        {
            "station": "Technologiepark",
            "recordTime": "2018-07-02T08:25:08.572Z",
            "lat": 51.976765,
            "lon": 8.597629,
            "score": 78
        }
    ];

    // Resolve HTTP using the constructor
    constructor (private http: HttpClient, private httpS: HttpClient) {}

    getFloodingList() : Observable<FloodingStation[]>{
        return this.http.get(this.floodingURL)
            //  .map(res => res )
            .map((res) => {
                console.log(res); 
                return res } )
                // ...errors if any
            .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
     }

}