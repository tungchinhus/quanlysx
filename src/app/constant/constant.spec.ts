import { Constant } from './constant';

describe('Constant', () => {
  it('should create an instance', () => {
    const http: any = null;
    Constant.createTranslateLoader(http);
    expect(new Constant()).toBeTruthy();
  });
});
