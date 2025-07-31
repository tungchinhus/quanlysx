import { Injectable } from '@angular/core';

//import { LogService } from '../logging/log.service'

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  /**
   * Gets a string value from cache whose key is provided.
   * Returns null if none is found.
   */
  getString(key: string): string {
    let value = localStorage.getItem(key) as string;
    //this.writeGetLog(key, value)
    return value;
  }

  /**
   * Gets a number from cache whose key is provided.
   * Returns null if none is found.
   */
  getNumber(key: string): number {
    const stringValue = localStorage.getItem(key);
    const value = (stringValue && +stringValue) as number;
    //this.writeGetLog(key, value)
    return value;
  }

  /**
   * Gets a boolean value from cache whose key is provided.
   * Returns null if none is found.
   */
  getBoolean(key: string): boolean {
    const stringValue = localStorage.getItem(key) as string;
    const value = stringValue && stringValue === 'true';
    // this.writeGetLog(key, value)
    return value as boolean;
  }

  /**
   * Gets an object from cache whose key is provided.
   * Returns null if none is found.
   */
  get<T extends object>(key: string): T {
    const stringValue = localStorage.getItem(key);
    const objectVal = stringValue ? JSON.parse(stringValue) : null;
    const value = objectVal as T;

    //this.writeGetLog(key, stringValue)

    return value;
  }

  /**
   * Saves an item to cache.
   * Items can be of type string | number | boolean | object.
   */
  set(key: string, value: string | number | boolean | object): void {
    let stringValue: string;

    switch (typeof value) {
      case 'string':
      case 'number':
      case 'boolean':
        stringValue = value.toString();
        break;

      case 'object':
        stringValue = JSON.stringify(value);
        break;

      default:
        return;
    }

    localStorage.setItem(key, stringValue);
  }

  /**
   * Removes an item from cache whose key is provided.
   */
  remove(key: string): void {
    localStorage.removeItem(key);
  }

  // private writeGetLog(key: string, value: any): void {
  //   if (value) {
  //     this.logger.log(`CACHE retrieved: '${key}' - '${value}'`);
  //   } else {
  //     this.logger.log(`CACHE not found: '${key}'`);
  //   }
  // }
}
