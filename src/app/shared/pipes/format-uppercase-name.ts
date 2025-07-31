import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatUpperCase' })
export class FormatUpperCase implements PipeTransform {
  transform(value: string | null | undefined): string | null | undefined {
    if (!value) return value;
    return value.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace (/Đ/g, "D").toUpperCase();
  }
}