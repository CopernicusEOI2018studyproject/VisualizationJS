// Imports
import { Injectable }     from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { FloodingStation } from '../model/floodingStation';

// Import RxJs required methods
import { Observable } from 'rxjs/Rx';
// import 'rxjs/add/operator/map';
import { catchError, map, tap } from 'rxjs/operators';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

@Injectable()
export class FloodService {
    // private instance variable to hold base url
    // private floodingURL = '/assets/test/dataset.json';
    private urlPort = 'http://localhost:4300/api/';
    private stations = 'stations/';
    private initList = true;

    // Resolve HTTP using the constructor
    constructor (private http: HttpClient) {}

    public getList() : Observable<string[]> {
        let url = this.urlPort + 'list';
            this.initList = false;
            return this.http.get<string[]>(url)
                .pipe(
                    catchError(this.handleError('getList', []))
                );
    }

    public getFloodingStationsByFileName(filename: string) : Observable<FloodingStation[]> {
        let url = this.urlPort + this.stations + filename;
        return this.http.get<FloodingStation[]>(url)
            .pipe(
                catchError(this.handleError('getFloodingStationsByFileName', []))
            );
     };

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