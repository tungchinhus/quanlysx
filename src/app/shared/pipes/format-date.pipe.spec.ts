import { FormatDatePipe } from "./format-date.pipe";
let moment = require('moment');

describe('FormatDatePipe', () => {
  beforeEach(() => {
    (<any>window).moment = moment;
  });
  it('create an instance', () => {
    const pipe = new FormatDatePipe();
    expect(pipe).toBeTruthy();
  });

  it('format with null value', () => {
    const pipe = new FormatDatePipe();
    expect(pipe.transform(null)).toEqual('');
  });

  it('format with undefined value', () => {
    const pipe = new FormatDatePipe();
    expect(pipe.transform(undefined)).toEqual('');
  });
  it('format with value', () => {
    const pipe = new FormatDatePipe();
    expect(pipe.transform('01/01/2000')).toEqual('01/01/2000');
  });
});
