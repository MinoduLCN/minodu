import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL, CONTENT_TYPE } from '../_helpers/constants';

const httpOptions = {
  headers: new HttpHeaders(CONTENT_TYPE)
};

@Injectable({ providedIn: 'root' })
export class LogsService {

  constructor(private http: HttpClient) {}

  // ---- Lecture des logs ----

  getNginxLogs(
    type: 'default' | 'error' | 'access' = 'default',
    lines: number = 500,
    source: 'frontend' | 'backend' | 'rag' = 'frontend'
  ): Observable<any> {
    const endpoint = this.resolveEndpoint(source);
    return this.http.get(`${API_URL}${endpoint}?type=${type}&lines=${lines}`, {
      ...httpOptions,
      responseType: 'text'
    });
  }

  // ---- Suppression des logs ----

  clearLogs(source: 'backend' | 'frontend' | 'rag' = 'backend'): Observable<any> {
    const endpoint = this.resolveEndpoint(source);
    return this.http.delete(`${API_URL}${endpoint}`, httpOptions);
  }

  // ---- Téléchargement des logs (blob depuis le backend) ----

  downloadLogs(source: 'frontend' | 'backend' | 'rag' = 'frontend'): Observable<Blob> {
    const endpoint = this.resolveDownloadEndpoint(source);
    return this.http.get(`${API_URL}${endpoint}`, {
      headers: new HttpHeaders(CONTENT_TYPE),
      responseType: 'blob'
    });
  }

  // ---- Résolution des endpoints ----

  private resolveEndpoint(source: 'frontend' | 'backend' | 'rag'): string {
    if (source === 'backend') return 'backend-logs';
    if (source === 'rag')     return 'rag-logs';
    return 'nginx-logs';  // frontend
  }

  private resolveDownloadEndpoint(source: 'frontend' | 'backend' | 'rag'): string {
    if (source === 'backend') return 'backend-logs/download';
    if (source === 'rag')     return 'rag-logs/download';
    return 'nginx-logs/download';  // frontend
  }
}