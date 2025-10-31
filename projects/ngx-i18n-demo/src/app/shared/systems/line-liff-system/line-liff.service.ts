import { LiffQueryParams } from '../../interfaces/line.interface';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LineLiffService {
  constructor() { }

  getQueryParamsFromRoute(params: Params): LiffQueryParams {
    const copy = structuredClone(params) as LiffQueryParams;
    if (copy['liff.state']) {
      const decoded = decodeURIComponent(copy['liff.state']).slice(1).split('&');
      for (const q of decoded) {
        const [key, value] = q.split('=');
        copy[key] = value;
      }
      delete copy['liff.state'];
    }
    const redirectLiffId = copy.liffRedirectUri
      ? decodeURIComponent(copy.liffRedirectUri).split('&liffId=')[1]?.split('&')[0]
      : undefined;
    const urlLiffId = copy.url ? decodeURIComponent(copy.url).split('//')[1]?.split('/')[1]?.split('?')[0] : undefined;
    if (copy.liffId) {
      copy.liffId = redirectLiffId || urlLiffId || copy.liffId;
    }
    return copy;
  }
}
