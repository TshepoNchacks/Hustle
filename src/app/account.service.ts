import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environment.prod';

export interface User {
  username: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  constructor(private http: HttpClient) {}

login(credentials: { username: string; password: string }): Observable<User> {
   return this.http.post(`${environment.baseUrl}/api/login`, credentials, { observe: 'response' })
    .pipe(
      map(resp => {
        console.log('🔹 Full HTTP response:', resp);
        this.setUser(resp.body as User);
        return resp.body as User;
      }),
      catchError(err => {
        console.error('❌ HTTP error:', err);
        return throwError(() => new Error(err.error?.detail || 'Login failed'));
      })
    );
}



  setUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getUser(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  logout(): void {
    localStorage.removeItem('currentUser');

  }
}
