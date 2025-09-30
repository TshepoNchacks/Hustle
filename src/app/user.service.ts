import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environment.prod';

export interface User {
  id?: number;
  username: string;
  password: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
  return this.http.get<User[]>(`${environment.baseUrl}/api/users`);
}

 addUser(user: User): Observable<User> {
  return this.http.post<User>(`${environment.baseUrl}/api/users`, user);
}
  deleteUser(username: string): Observable<any> {
  return this.http.delete(`${environment.baseUrl}/api/users/${username}`);
}
}
