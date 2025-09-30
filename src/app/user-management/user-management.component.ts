import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';


@Component({
    selector: 'app-user-management',
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.css'],
    standalone: false
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  newUser = {
    username: '',
    password: '',
    role: 'User'
  };
  errorMessage = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(
      (users) => {
        this.users = users;
      },
      (error) => {
        this.errorMessage = 'Failed to load users';
      }
    );
  }

  addUser(): void {
  this.userService.addUser(this.newUser).subscribe(
    (createdUser) => {
      this.newUser = { username: '', password: '', role: 'User' };
      this.loadUsers();
    },
    (error) => {
      this.errorMessage = 'Failed to add user';
    }
  );
}

deleteUser(username: string): void {
  this.userService.deleteUser(username).subscribe(
    () => {
      this.loadUsers();
    },
    (error) => {
      this.errorMessage = 'Failed to delete user';
    }
  );
}

}
