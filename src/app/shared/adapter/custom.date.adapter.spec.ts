import { TestBed } from '@angular/core/testing';
import { CustomDateAdapter } from './custom.date.adapter';

describe('DOBService', () => {
  let adapter: CustomDateAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CustomDateAdapter]
    });
    adapter = TestBed.inject(CustomDateAdapter);
  });

  it('should be created', () => {
    expect(adapter).toBeTruthy();
  });

  it('should be not parse date for value which is not string format', () => {
    let currentDt = new Date();
    const actual = adapter.parse(currentDt);
    expect(actual).toEqual(currentDt);
  });

  it('should be parse date for string with correct format date', () => {
    let dateStr = '21/02/2023';
    let parts = dateStr.split('/');
    const expectResult = new Date(Number(parts[2]), Number(parts[1]) - 1,  Number(parts[0]));
    const actual = adapter.parse(dateStr);
    expect(actual).toEqual(expectResult);
  });

  it('should be not parse date for string with incorrect format date', () => {
    const actual = adapter.parse('32/02/2023');
    expect(actual).toBeNull();
  });
});
