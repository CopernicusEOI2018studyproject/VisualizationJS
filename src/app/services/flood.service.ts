// Imports
import { Injectable }     from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { FloodingStation } from '../model/floodingStation';
import { Observable } from 'rxjs/Rx';
// import 'rxjs/add/operator/map';
import { catchError, map, tap } from 'rxjs/operators';
// Import RxJs required methods


import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

@Injectable()
export class FloodService {
    // private instance variable to hold base url
    // private floodingURL = '/assets/test/dataset.json';
    private urlPort = 'http://localhost:4300/api/';
    private stations = 'stations/';

    // Resolve HTTP using the constructor
    constructor (private http: HttpClient) {}

    getList() : Observable<string[]> {
        let url = this.urlPort + 'list'
        return this.http.get<string[]>(url)
            .pipe(
                catchError(this.handleError('getList', []))
            );
    }

    // getFloodingList() : Observable<any> {
    //     let url = this.urlPort + 'dataset.json';
    //     return Observable.interval(5000) // 10000 = 10 sec
    //         .flatMap(() => this.http.get<any>(url))
    //         .map((res) => {
    //             console.log(res);
    //             res[0].score = Math.floor(Math.random() * Math.floor(100));
    //             res[1].score = Math.floor(Math.random() * Math.floor(100));
    //             res[2].score = Math.floor(Math.random() * Math.floor(100));
    //             return res } )
    //         .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    //  }

    getFloodingStationsByFileName(filename: string) : Observable<FloodingStation[]> {
        let url = this.urlPort + this.stations + filename;
        return this.http.get<FloodingStation[]>(url)
            .pipe(
                catchError(this.handleError('getFloodingStationsByFileName', []))
            );
            //  ((res) => {
            //     console.log(res);
            //     res[0].score = Math.floor(Math.random() * Math.floor(100));
            //     res[1].score = Math.floor(Math.random() * Math.floor(100));
            //     res[2].score = Math.floor(Math.random() * Math.floor(100));
            //     return res 
            // })
            // .catch((error:any) => {
            //     return Observable.throw(error || 'Server error');
            // });
     }

    /**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */
    private handleError<T> (operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
       
          // TODO: send the error to remote logging infrastructure
          console.error(error); // log to console instead
       
          // TODO: better job of transforming error for user consumption
          console.log(`${operation} failed: ${error.message}`);
       
          // Let the app keep running by returning an empty result.
          return Observable.of(result as T);
        };
      }
}