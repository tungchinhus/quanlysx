import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  constructor() {}
  setState(key: string, value: any) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  getState(key: string): any {
    return JSON.parse(sessionStorage.getItem(key) || '{}');
  }
  clearState() {
    sessionStorage.clear();
    localStorage.removeItem('quoType');
  }
}
