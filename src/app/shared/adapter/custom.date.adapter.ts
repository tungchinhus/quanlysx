import { NativeDateAdapter } from '@angular/material/core';
import { Injectable } from '@angular/core';
import { Regexs } from '../utils/regexs';

@Injectable({
  providedIn: 'root'
})
export class CustomDateAdapter extends NativeDateAdapter {
  override parse(value: any, parseFormat?: any): Date | null {
    if (typeof value !== 'string') {
      return value;
    }

    if (value.match(Regexs.DATE_FORMAT_DD_MM_YYYY)) {
      let dateParts = value.split('/');
      return new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));
    }

    return null;
  }
}