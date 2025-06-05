import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User, UserService } from '../user.service';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'verify-age',
  templateUrl: './verify-age.component.html',
  styleUrls: ['./verify-age.component.scss'],
})
export class VerifyAgeComponent {
  @Input() showAgeModal: boolean = false;
  @Input() birthDate: Date | null = null;


@Output() onClose = new EventEmitter<void>();
  closeDialog() {
    this.onClose.emit();
  }


constructor(private userService: UserService, private messageService: MessageService){}


  openAgeModal() {
    this.showAgeModal = true;
  }

  closeAgeModal() {
    this.showAgeModal = false;
    this.birthDate = null;
  }



  saveBirthDate() {
    this.showAgeModal = false;
  }
  verifyAge() {
    if (this.showAgeModal === false) {
      this.openAgeModal();
    }

    if (this.birthDate) {
      const age = this.calculateAge(this.birthDate);
      if (age >= 18) {
        this.userService.setIsAdult(true);
        this.messageService.add({
          severity: 'success',
          summary: 'Access granted',
          detail: 'You are verified as 18+.',
        });
      } else {
        this.userService.setIsAdult(false);

        this.messageService.add({
          severity: 'error',
          summary: 'Access denied',
          detail: 'You must be 18 or older.',
        });
      }
      this.userService.setWentThroughVerification(true);
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid',
        detail: 'Please select your birth date.',
      });
    }
    this.closeAgeModal();
  }
  calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

}
