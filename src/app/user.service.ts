import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface User {
  id: number;
  email: string;
  password: string;
  watchedMovies: { id: number; title: string; genres: string[] }[];
  watchedTvShows: { id: number; title: string; genres: string[] }[];
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'assets/users.json';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl); // because JSON is an array directly
  }

  login(email: string, password: string): Observable<User | undefined> {
    return this.getUsers().pipe(
      map((users) =>
        users.find((user) => user.email === email && user.password === password)
      )
    );
  }
getUserById(userId: number): Observable<any | undefined> {
  return this.getUsers().pipe(
    map((users) => users.find((user) => user.id === userId))
  );
}
  getUserByEmail(email: string): Observable<User | undefined> {
    return this.getUsers().pipe(
      map((users) => users.find((user) => user.email === email))
    );
  }
}
