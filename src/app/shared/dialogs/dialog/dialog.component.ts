import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {
  selectedUser: string = ''; // For single user selection (e.g., general gia cong)
  selectedUser1: string = ''; // For process 1 (e.g., quấn dây 1)
  selectedUser2: string = ''; // For process 2 (e.g., quấn dây 2)

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Set default values based on the type of dialog being opened
    if (this.data.showProcessUsers) {
      // If two process users are needed
      if (this.data.users && this.data.users.length > 0) {
        this.selectedUser1 = this.data.users[0];
        // Ensure selectedUser2 is different if possible, or same if only one option
        this.selectedUser2 = this.data.users.length > 1 ? this.data.users[1] : this.data.users[0];
      }
    } else if (this.data.showUserSelect) { // For the single user select case
      if (this.data.users && this.data.users.length > 0) {
        this.selectedUser = this.data.users[0];
      }
    }
  }

  onConfirm(): void {
    if (this.data.showProcessUsers) {
      // Return both users for gia cong process
      this.dialogRef.close({
        confirmed: true,
        user1: this.selectedUser1,
        user2: this.selectedUser2
      });
    } else if (this.data.showUserSelect) {
      // Return single user for general user selection
      this.dialogRef.close({
        confirmed: true,
        selectedUser: this.selectedUser
      });
    } else {
      // Default confirmation without user selection
      this.dialogRef.close(true);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false); // Close with false for cancellation
  }

  // Refined method to determine if the confirm button should be disabled
  isConfirmButtonDisabled(): boolean {
    if (this.data.showProcessUsers) {
      // Nếu hai người dùng gia công được yêu cầu, cả hai phải được chọn
      // VÀ phải khác nhau.
      return !this.selectedUser1 || !this.selectedUser2 || (this.selectedUser1 === this.selectedUser2);
    } else if (this.data.showUserSelect) {
      // Nếu yêu cầu chọn một người dùng duy nhất, người dùng đó phải được chọn
      return !this.selectedUser;
    }
    // Nếu không yêu cầu chọn người dùng, nút luôn được kích hoạt
    return false;
  }
}