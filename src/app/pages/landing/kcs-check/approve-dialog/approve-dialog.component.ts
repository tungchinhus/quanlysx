import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { KcsCheckService } from '../kcs-check.service';

export interface ApproveDialogData {
  itemId: number;
  itemName: string;
  itemType: string;
}

@Component({
  selector: 'app-approve-dialog',
  templateUrl: './approve-dialog.component.html',
  styleUrls: ['./approve-dialog.component.scss']
})
export class ApproveDialogComponent implements OnInit {
  approveForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ApproveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ApproveDialogData,
    private kcsService: KcsCheckService
  ) {
    this.approveForm = this.fb.group({
      notes: ['Đạt tiêu chuẩn chất lượng KCS'],
      qualityScore: [5],
      inspectorName: [''],
      inspectionDate: [new Date()]
    });
  }

  ngOnInit(): void {
    // Form is already initialized in constructor
  }

  onSubmit(): void {
    this.isLoading = true;
    
    const formData = this.approveForm.value;
    const approvalData = {
      itemId: this.data.itemId,
      notes: formData.notes,
      qualityScore: formData.qualityScore,
      inspectorName: formData.inspectorName,
      inspectionDate: formData.inspectionDate,
      approvedAt: new Date().toISOString(),
      itemType: this.data.itemType
    };

    // Call service to approve item
    this.kcsService.approveItem(this.data.itemType, this.data.itemId, approvalData)
      .subscribe({
        next: (response) => {
          if (response.IsSuccess) {
            this.dialogRef.close({
              IsSuccess: true,
              Message: response.Message || 'Đã duyệt KCS thành công',
              data: approvalData
            });
          } else {
            this.dialogRef.close({
              IsSuccess: false,
              Message: response.Message || 'Lỗi khi duyệt'
            });
          }
        },
        error: (error) => {
          console.error('Error approving item:', error);
          this.dialogRef.close({
            IsSuccess: false,
            Message: 'Lỗi khi duyệt. Vui lòng thử lại.'
          });
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getItemTypeDisplayName(itemType: string): string {
    switch (itemType) {
      case 'boiDayHa':
        return 'Bối dây hạ';
      case 'boiDayCao':
        return 'Bối dây cao';
      case 'epBoiDay':
        return 'Ép bối dây';
      default:
        return itemType;
    }
  }
}
