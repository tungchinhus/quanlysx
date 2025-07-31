import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private loadingState: boolean = false;

  constructor() { }

  getLoadingState() {
    return this.loadingState;
  }

  setLoadingState(loading: boolean) {
    this.loadingState = loading;
  }

}
