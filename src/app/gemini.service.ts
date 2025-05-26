import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private apiUrl =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDi9SagxzdCkchnALiZU0v5q-IQzXs-Kio';

  constructor(private http: HttpClient) {}

  sendMessage(conversation: {role: string, parts: {text: string}[]}[]): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
    const body = { contents: conversation };
  
    return this.http.post(this.apiUrl, body, { headers });
  }
  
}
