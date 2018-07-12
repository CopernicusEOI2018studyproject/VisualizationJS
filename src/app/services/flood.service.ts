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
    // private floodingURL = '/assets/test/dataset.json';
    private floodingURL = 'localhost:4300/dataset.json';

    // Resolve HTTP using the constructor
    constructor (private http: HttpClient) {}

    getFloodingList() : Observable<FloodingStation[]> {
        console.log("getFloodingList()");
        return Observable.interval(5000) // 10000 = 10 sec
            .flatMap(() => this.http.get(this.floodingURL))
            .map((res) => {
                console.log(res);
                res[0].score = Math.floor(Math.random() * Math.floor(100));
                res[1].score = Math.floor(Math.random() * Math.floor(100));
                res[2].score = Math.floor(Math.random() * Math.floor(100));
                return res } )
                // ...errors if any
            .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
     }

    getFloodingListByURL(url) : Observable<FloodingStation[]> {
        console.log("getFloodingListByURL()");
        return this.http.get(url)
            .map((res) => {
                console.log(res);
                res[0].score = Math.floor(Math.random() * Math.floor(100));
                res[1].score = Math.floor(Math.random() * Math.floor(100));
                res[2].score = Math.floor(Math.random() * Math.floor(100));
                return res 
            })
            .catch((error:any) => {
                return Observable.throw(error || 'Server error');
            });
     }
}