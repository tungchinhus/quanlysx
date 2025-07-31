import { TestBed } from '@angular/core/testing';

import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be loadingSate = true', () => {
    service.setLoadingState(true);
    const actual = service.getLoadingState();
    expect(actual).toBeTruthy();
  });

  it('should be loadingSate = false', () => {
    service.setLoadingState(false);
    const actual = service.getLoadingState();
    expect(actual).toBeFalsy();
  });
  
});
