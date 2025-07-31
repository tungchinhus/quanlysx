import { TestBed } from '@angular/core/testing';
import { DOBService } from './dob.service';
import { Constant } from 'src/app/constant/constant';
let moment = require('moment');

describe('DOBService', () => {
  let service: DOBService;

  beforeEach(() => {
    (<any>window).moment = moment;
    TestBed.configureTestingModule({
      providers: [DOBService]
    });
    service = TestBed.inject(DOBService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be covert date for string with correct format date', () => {
    let parts = '21/02/2023'.split('/');
    const expectResult = new Date(Number(parts[2]), Number(parts[1]) - 1,  Number(parts[0]));
    const actual = service.covertDate('21/02/2023');
    expect(actual).toEqual(expectResult);
  });

  it('should be not covert date for string with incorrect format date', () => {
    const expectResult = Constant.INVALID_DATE;
    const actual = service.covertDate('32/02/2023');
    expect(actual).toEqual(expectResult);
  });

  it('should be not covert date for null value', () => {
    const expectResult = Constant.INVALID_DATE;
    const actual = service.covertDate(null);
    expect(actual).toEqual(expectResult);
  });

  it('should be covert date for date type', () => {
    let dateConvert = new Date(2023, 0, 1);
    const actual = service.covertDate(dateConvert);
    expect(actual).toEqual(dateConvert);
  });
});
