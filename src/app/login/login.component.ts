import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../account.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: false
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false; // Track loading state

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log('🔹 Login form submitted with:', this.loginForm.value);

      // Show progress bar
      this.isLoading = true;

      this.accountService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('✅ Login successful, backend response:', response);
          this.accountService.setUser(response);
          alert('Login successful!');
          this.router.navigate(['/home']).then(nav => {
            console.log('➡️ Navigation result:', nav);
            // Hide progress bar after navigation
            this.isLoading = false;
          }).catch(err => {
            console.error('❌ Navigation error:', err);
            // Hide progress bar on error
            this.isLoading = false;
          });
        },
        error: (err) => {
          console.error('❌ Login error:', err);
          this.errorMessage = err.message || 'Login failed. Please try again.';
          // Hide progress bar on error
            this.isLoading = false;
        }
      });
    } else {
      console.warn('⚠️ Login form is invalid:', this.loginForm.value);
    }
  }
}
