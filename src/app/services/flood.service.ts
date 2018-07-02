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