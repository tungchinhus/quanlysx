import { FormatUpperCase } from "./format-uppercase-name";

describe('FormatUpperCase', () => {
  it('create an instance', () => {
    const pipe = new FormatUpperCase();
    expect(pipe).toBeTruthy();
  });
  it("with empty value", () => {
    const pipe = new FormatUpperCase();
    expect(pipe.transform("")).toEqual("");
  });
  it("with defined value", () => {
    const pipe = new FormatUpperCase();
    expect(pipe.transform("Nguyễn Văn A")).toEqual("NGUYEN VAN A");
  });
  it("with null value", () => {
    const pipe = new FormatUpperCase();
    expect(pipe.transform(null)).toEqual(null);
  });
  it("with undefined value", () => {
    const pipe = new FormatUpperCase();
    expect(pipe.transform(undefined)).toEqual(undefined);
  });
});