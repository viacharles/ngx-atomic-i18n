import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor() { }

  enumToOptions(enumObj: any): Array<{ name: string; value: string }> {
    return Object.keys(enumObj).map((key) => ({
      name: key,
      value: enumObj[key],
    }));
  }
}
