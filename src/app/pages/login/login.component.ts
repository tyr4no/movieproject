import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../user.service';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  passwordVisible: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false],
    });
  }
  ngOnInit() {
    if (this.authService.isLoggedIn()) this.router.navigate(['/home']);
  }
  onLogin() {
    if (this.loginForm.valid) {
      const email = this.loginForm.get('username')?.value;
      const password = this.loginForm.get('password')?.value;

      this.userService.login(email, password).subscribe((user) => {
        if (user) {
          this.authService.login(user.id, user);
          console.log(email);
          console.log('Logged in successfully');
          this.router.navigate(['/main/home']);
          // optionally redirect here:
          // this.router.navigate(['/home']);
        } else {
          console.log('Login failed: Incorrect credentials');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}
