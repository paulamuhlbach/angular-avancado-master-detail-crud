import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError} from 'rxjs';
import { map, catchError } from "rxjs/operators";
import { flatMap } from 'rxjs/operators'

import { Entry } from './entry.model';
//import { Category } from '../../categories/shared/category.model';
import { CategoryService } from '../../categories/shared/category.service';

@Injectable({
  providedIn: 'root'
})
export class EntryService {

  private apiPath: string = "api/entries";
  
  constructor(private http: HttpClient, private categoyService: CategoryService) {}

  getAll(): Observable<Entry[]> {
    return this.http.get(this.apiPath).pipe(
      catchError(this.handleError),
      map(this.jsonDataToEntries)
    )
  }

  getById(id: number): Observable<Entry> {
    const url = `${this.apiPath}/${id}`;

    return this.http.get(url).pipe(
      catchError(this.handleError),
      map(this.jsonDataToEntry)    
    )
  }

  create(entry: Entry): Observable<Entry> {
   //adaptação para poder usar o in-memory-database. Com APIs remotas, não usar!
    return this.categoyService.getById(entry.categoryId).pipe(
      flatMap(category => {
        entry.cateogory = category;

        return this.http.post(this.apiPath, entry).pipe(
          catchError(this.handleError),
          map(this.jsonDataToEntry)
         )
      })
    );
    //uso normal
  /*  return this.http.post(this.apiPath, entry).pipe(
      catchError(this.handleError),
      map(this.jsonDataToEntry)*/
  }

  update(entry: Entry): Observable<Entry> {
   //adaptação para poder usar o in-memory-database. Com APIs remotas, não usar!
    const url = `${this.apiPath}/${entry.id}`; 
    return this.categoyService.getById(entry.categoryId).pipe(
      flatMap(category => {
        entry.cateogory = category;

        return this.http.put(url, entry).pipe(
          catchError(this.handleError),
          map(() => entry)
         )
      })
    );
 //uso normal
  /* 
   const url = `${this.apiPath}/${entry.id}`; 
    return this.http.put(url, entry).pipe(
      catchError(this.handleError),
      map(() => entry)
    )*/
  }

  delete(id:number): Observable<any> {
    const url = `${this.apiPath}/${id}`;
    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    )
  }

  //métodos privados

  private jsonDataToEntries(jsonData: any[]): Entry[]{

    //console.log(jsonData[0] as Entry); // assim retorna um objeto genérico
    //console.log( Object.assign(new Entry(), jsonData[0]) ); // assim retorna o objeto Entry mesmo

    const entries: Entry[] = [];
    /*jsonData.forEach(element => entries.push(element as Entry));*/  // assim retorna um objeto genérico
    jsonData.forEach(element => {
      const entry = Object.assign(new Entry(), element);
      entries.push(entry);
    })
   
    return entries; 
  }

  private jsonDataToEntry(jsonData: any): Entry{
    return Object.assign(new Entry(), jsonData);
    //return jsonData as Entry;
  }

  private handleError(error: any): Observable<any>{
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(error);
  }

}
