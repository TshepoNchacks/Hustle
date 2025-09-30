// import { Component, OnInit } from '@angular/core';
// import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { AccountService } from '../account.service';

// @Component({
//   selector: 'app-registration',
//   templateUrl: './registration.component.html',
//   styleUrls: ['./registration.component.css']
// })
// export class RegistrationComponent implements OnInit {
//   registrationForm!: FormGroup;
//   errorMessage: string = '';

//   constructor(private fb: FormBuilder, private router: Router, private accountService: AccountService) {}

//   ngOnInit(): void {
//     this.registrationForm = this.fb.group({
//       username: ['', [Validators.required, Validators.minLength(4)]],
//       email: ['', [Validators.required, Validators.email]],
//       password: ['', [Validators.required, Validators.minLength(6)]],
//       confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
//     }, {
//       validators: this.passwordMatcher
//     });
//   }

//   // Custom validator to check if password and confirm password match
//   passwordMatcher(group: FormGroup): { [key: string]: boolean } | null {
//     const password = group.get('password')?.value;
//     const confirmPassword = group.get('confirmPassword')?.value;
//     return password === confirmPassword ? null : { 'mismatch': true };
//   }

//   onSubmit(): void {
//     if (this.registrationForm.valid) {
//       this.accountService.register(this.registrationForm.value).subscribe({
//         next: (response) => {
//           console.log('Registration successful:', response);
//           this.router.navigate(['/login']);
//         },
//         error: (err) => {
//           this.errorMessage = err.message || 'Registration failed. Please try again.';
//         }
//       });
//     }
//   }

//   cancel(): void {
//     this.router.navigate(['/login']);
//   }
// }


import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../account.service';
import { UserService } from '../user.service';

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.css'],
    standalone: false
})
export class RegistrationComponent implements OnInit {
  registrationForm!: FormGroup;
  errorMessage: string = '';
  users: any[] = [];

  constructor(private fb: FormBuilder, private router: Router, private accountService: AccountService, private userService: UserService) {}

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, {
      validators: this.passwordMatcher
    });

     // 2️⃣ Load the list of users that Admin has added
     this.userService.getUsers().subscribe(users => {
       this.users = users;
     });
  }

  passwordMatcher(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { 'mismatch': true };
  }

  // onSubmit(): void {
  //   if (this.registrationForm.valid) {
  //     this.accountService.register(this.registrationForm.value).subscribe({
  //       next: () => {
  //         alert('Registration successful!');
  //         this.router.navigate(['/login']);
  //       },
  //       error: (err) => {
  //         this.errorMessage = err.message || 'Registration failed. Please try again.';
  //       }
  //     });
  //   }
  // }

  cancel(): void {
        this.router.navigate(['/login']);
      }
}
