import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // nécessaire pour [(ngModel)] si utilisé
//import { NgClass } from '@angular/common';       nécessaire pour [ngClass]
import { Router } from '@angular/router';       // ✅ IMPORT OUBLIÉ

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginPage {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;                // ✅ AJOUT DE LA VARIABLE

  constructor(private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  login() {
    console.log('Username:', this.username);
  console.log('Password:', this.password);

    if (this.username.trim() === 'admin' && this.password.trim() === 'admin') {
      this.router.navigate(['/otp']);
    } else {
      alert('Identifiants invalides');
    }
  }
}
