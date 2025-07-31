import { Injectable } from '@angular/core';
import { Regexs } from '../utils/regexs';
import { formatDate } from '@angular/common';
import { Constant } from 'src/app/constant/constant';
import { DATE_FORMAT, LOCALE_FORMAT } from 'src/app/shared/utils/localFormat';

declare const moment: any;

@Injectable({
    providedIn: 'root'
})
export class DOBService {
    constructor() { }

    covertDate(value: any): any {
        if (typeof value ==='string') {
            if (value.match(Regexs.DATE_FORMAT_DD_MM_YYYY)) {
                let parts = value.split('/');
                return new Date(Number(parts[2]), Number(parts[1]) - 1,  Number(parts[0]));
            }
        } else if (value && moment(value).isValid()
            && formatDate(value, DATE_FORMAT.dd_MM_yyyy, LOCALE_FORMAT.LOCALE_EN_GB).match(Regexs.DATE_FORMAT_DD_MM_YYYY)) {
            return value;
        }

        return Constant.INVALID_DATE;
    }
}