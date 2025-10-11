import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './otp.html',
  styleUrls: ['./otp.css']
})
export class OtpPage {
  otpCode: string = '';

  constructor(private router: Router) {}

  submitOtp() {
    if (this.otpCode === '123456') {
      this.router.navigate(['/dsi/dashboard']);
    } else {
      alert('Code OTP invalide !');
    }
  }

  resendOtp() {
    alert('Nouveau code envoyé');
  }
}
