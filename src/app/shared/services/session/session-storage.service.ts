import { Injectable } from '@angular/core';
import { StorageKey } from '../../enums/storage-key.enum';
@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {
  /**
   * Gets a string value from session storage whose key is provided.
   * Returns null if none is found.
   */
  getString(key: string): string {
    const value = sessionStorage.getItem(key) as string;
    return value;
  }

  /**
   * Gets a number from cache whose key is provided.
   * Returns null if none is found.
   */
  getNumber(key: string): number {
    const stringValue = sessionStorage.getItem(key);
    const value = (stringValue && +stringValue) as number;
    return value;
  }

  /**
   * Gets a boolean value from cache whose key is provided.
   * Returns null if none is found.
   */
  getBoolean(key: string): boolean {
    const stringValue = sessionStorage.getItem(key);
    const value = (stringValue && stringValue === 'true') as boolean;
    return value;
  }

  /**
   * Gets an object from cache whose key is provided.
   * Returns null if none is found.
   */
  get<T extends object>(key: string): T {
    const stringValue = sessionStorage.getItem(key);
    const obj = stringValue ? JSON.parse(stringValue) : null;
    const value = obj as T;

    return value;
  }

  /**
   * Saves an item to cache.
   * Items can be of type string | number | boolean | object.
   */
  set(key: string, value: string | number | boolean | object) {
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

    sessionStorage.setItem(key, stringValue);
  }

  /**
   * Removes an item from cache whose key is provided.
   */
  remove(key: string) {
    sessionStorage.removeItem(key);
  }
  getToken(): string | null {
    return sessionStorage.getItem(StorageKey.TOKEN_KEY);
  }
  setToken(token: string): void {
    window.sessionStorage.removeItem(StorageKey.TOKEN_KEY);
    window.sessionStorage.setItem(StorageKey.TOKEN_KEY, token);
  }
  setDataUser(user: any): void {
    window.sessionStorage.removeItem(StorageKey.USER_KEY);
    window.sessionStorage.setItem(StorageKey.USER_KEY, JSON.stringify(user));
  }
  getDataUser() {
    return sessionStorage.getItem(StorageKey.USER_KEY);
  }
}
