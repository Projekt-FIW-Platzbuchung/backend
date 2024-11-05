import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Platz } from './platz';


@Injectable({
  providedIn: 'root',
})
export class BackendService {
  baseUrl = 'http://localhost:3000';
  

  constructor(private http: HttpClient) {
   
  }

  
  getAllPlatz(): Observable<Platz[]> {
    let endpoint = '/platz';
    return this.http.get<Platz[]>(this.baseUrl + endpoint);
  }

  getPlatz(): Observable<Platz[]> {
    return this.http.get<Platz[]>(this.baseUrl + '/platz');
  }


  deleteOnePlatz(id: number): Observable<Platz> {
    let endpoint = '/platz/' + id;
    return this.http.delete<Platz>(this.baseUrl + endpoint);
  }

  createNewPlatz(platz: Platz): Observable<Platz> {
    let endpoint = '/platz';
    return this.http.post<Platz>(this.baseUrl + endpoint, platz);
  }

  updateOnePlatz(platz: Platz, id: number): Observable<Platz> {
    let endpoint = '/platz';
    return this.http.put<Platz>(this.baseUrl + endpoint + '/' + id, platz);
  }

  getOnePlatz(id: number): Observable<Platz> {
    let endpoint = '/platz';
    return this.http.get<Platz>(this.baseUrl + endpoint + '/' + id);
  }
 
}
