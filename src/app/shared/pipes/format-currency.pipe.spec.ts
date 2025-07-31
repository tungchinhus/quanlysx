import { FormatCurrencyPipe } from './format-currency.pipe';

describe('FormatCurrencyPipe', () => {
  it('create an instance', () => {
    const pipe = new FormatCurrencyPipe();
    expect(pipe).toBeTruthy();
  });

  it('format with arg', () => {
    const pipe = new FormatCurrencyPipe();
    expect(pipe.transform('2000000')).toEqual('2.000.000');
  });
});
