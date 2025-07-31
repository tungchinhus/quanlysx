import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { emailValidator } from './email-validator.directive';


describe('EmailValidatorDirective', () => {
  let formGroup: FormGroup;
  const email = 'email';
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: []
    }).compileComponents();
  });
  beforeEach(() => {
    formGroup = new FormGroup({
      email: new FormControl('', [emailValidator()])
    });
  });
  it('should valid email', () => {
    formGroup.patchValue({email: "email@gmail.com"});
    expect(formGroup.get(email)?.valid).toBeTruthy();
  });
  it('should valid email', () => {
    formGroup.patchValue({email: "email@gmail.net.com"});
    expect(formGroup.get(email)?.valid).toBeTruthy();
  });
  it('should invalid email', () => {
    formGroup.patchValue({email: "thisismail"});
    expect(formGroup.get(email)?.valid).toBeFalsy();
  });
  it('should invalid email', () => {
    formGroup.patchValue({email: "email@email"});
    expect(formGroup.get(email)?.valid).toBeFalsy();
  });
  it('should invalid email', () => {
    formGroup.patchValue({email: "email@email...com"});
    expect(formGroup.get(email)?.valid).toBeFalsy();
  });
  it('should throw error pattern', () => {
    formGroup.patchValue({email: "asdasdsa"});
    formGroup.markAllAsTouched();
    expect(formGroup.get(email)?.errors?.['pattern']).toBeTruthy();
  });

  it('should not throw error pattern', () => {
    formGroup.patchValue({email: "email@gmail.com"});
    formGroup.markAllAsTouched();
    expect(formGroup.get(email)?.errors?.['pattern']).toBeFalsy();
  });

  it('should invalid email (local part > 64 )', () => {
    formGroup.patchValue({email: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@email.com"});
    expect(formGroup.get(email)?.valid).toBeFalsy();
  });

  it('should invalid email (domain part > 255 )', () => {
    formGroup.patchValue({email: "email@aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.com"});
    expect(formGroup.get(email)?.valid).toBeFalsy();
  });

  it('should invalid email (local part is empty )', () => {
    formGroup.patchValue({email: "@email.com"});
    expect(formGroup.get(email)?.valid).toBeFalsy();
  });
});
