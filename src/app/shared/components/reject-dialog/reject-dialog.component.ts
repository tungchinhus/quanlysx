import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface RejectDialogData {
  title: string;
  message: string;
  itemName: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-reject-dialog',
  templateUrl: './reject-dialog.component.html',
  styleUrls: ['./reject-dialog.component.scss']
})
export class RejectDialogComponent {
  rejectForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<RejectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RejectDialogData,
    private fb: FormBuilder
  ) {
    this.rejectForm = this.fb.group({
      reason: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onConfirm(): void {
    if (this.rejectForm.valid) {
      this.dialogRef.close({
        confirmed: true,
        reason: this.rejectForm.get('reason')?.value
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close({
      confirmed: false,
      reason: ''
    });
  }

  getErrorMessage(): string {
    const reasonControl = this.rejectForm.get('reason');
    if (reasonControl?.hasError('required')) {
      return 'Ghi chú là bắt buộc';
    }
    if (reasonControl?.hasError('minlength')) {
      return 'Ghi chú phải có ít nhất 10 ký tự';
    }
    return '';
  }
}
