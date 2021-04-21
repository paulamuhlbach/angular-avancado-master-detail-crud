import { Injectable, Injector } from '@angular/core';

import { Observable} from 'rxjs';
import { flatMap } from "rxjs/operators";

import { BaseResourceService } from '../../../shared/services/base-resource.service';
import { CategoryService } from '../../categories/shared/category.service';
import { Entry } from './entry.model';
//import { Category } from '../../categories/shared/category.model';


@Injectable({
  providedIn: 'root'
})
export class EntryService extends BaseResourceService<Entry>{

  constructor(protected injector: Injector, private categoyService: CategoryService) {
    super("api/entries",injector);
  }

 
  create(entry: Entry): Observable<Entry> {
   //adaptação para poder usar o in-memory-database. Com APIs remotas, não usar!
    return this.categoyService.getById(entry.categoryId).pipe(
      flatMap(category => {
        entry.cateogory = category;
        return super.create(entry)
      })
    );
    //uso normal
  /*  return this.http.post(this.apiPath, entry).pipe(
      catchError(this.handleError),
      map(this.jsonDataToEntry)*/
  }

  update(entry: Entry): Observable<Entry> {
   //adaptação para poder usar o in-memory-database. Com APIs remotas, não usar!
 
    return this.categoyService.getById(entry.categoryId).pipe(
      flatMap(category => {
        entry.cateogory = category;
        return super.update(entry)
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

 

  //métodos protected

  protected jsonDataToResources(jsonData: any[]): Entry[]{

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

  protected jsonDataToResource(jsonData: any): Entry{
    return Object.assign(new Entry(), jsonData);
    //return jsonData as Entry;
  }

  

}
