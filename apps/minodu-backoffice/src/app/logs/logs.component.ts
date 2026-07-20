import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LogsService } from '../_services/logs.service';
import { DateUtilsService } from '../_helpers/dateutils.service';
import { LoaderService } from '../_helpers/loader.service';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.css'
})
export class LogsComponent implements OnInit, OnDestroy {
  logs: any[] = [];
  loading = false;
  loadingMore = false;
  errorMessage = '';
  successMessage = '';
  logsText = '';
  isDownloading = false;
  isClearing = false;
  activeTab: 'default' | 'error' | 'access' = 'default';
  logSource: 'frontend' | 'backend' | 'rag' = 'frontend';
  currentLines: number = 500;
  readonly LINES_INCREMENT: number = 500;
  private destroy$ = new Subject<void>();

  constructor(
    public dateUtilsService: DateUtilsService,
    public loaderService: LoaderService,
    private logsService: LogsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLogs() {
    this.loading = true;
    this.errorMessage = '';
    this.currentLines = 500; // Reset to default when switching tabs
    
    this.logsService.getNginxLogs(this.activeTab, this.currentLines, this.logSource).subscribe({
      next: data => {
        this.logsText = data || 'No logs available yet';
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erreur lors du chargement des logs';
        this.logsText = '';
        if (err.status === 401) this.authService.logout();
      }
    });
  }

  loadMoreLogs() {
    this.loadingMore = true;
    this.errorMessage = '';
    this.currentLines += this.LINES_INCREMENT;
    
    this.logsService.getNginxLogs(this.activeTab, this.currentLines, this.logSource).subscribe({
      next: data => {
        this.logsText = data || 'No logs available yet';
        this.loadingMore = false;
      },
      error: err => {
        this.loadingMore = false;
        this.errorMessage = err.error?.message || 'Erreur lors du chargement des logs supplémentaires';
        // Restore previous line count on error
        this.currentLines -= this.LINES_INCREMENT;
        if (err.status === 401) this.authService.logout();
      }
    });
  }

  switchTab(tab: 'default' | 'error' | 'access') {
    this.activeTab = tab;
    this.loadLogs();
  }

  switchLogSource(source: 'frontend' | 'backend' | 'rag') {
    this.logSource = source;
    // Reset to default tab when switching sources
    this.activeTab = 'default';
    this.loadLogs();
  }

  // Check if tabs should be displayed (only for frontend logs)
  get showTabs(): boolean {
    return this.logSource === 'frontend';
  }

  // Get the label for the current log source
  get logSourceLabel(): string {
    switch (this.logSource) {
      case 'frontend': return 'Logs Frontend';
      case 'backend': return 'Logs Backend';
      case 'rag': return 'Logs RAG';
      default: return 'Logs';
    }
  }

  confirmClearLogs(event?: Event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('clear-logs-modal');
    if (modal && (window as any).bootstrap) {
      (window as any).bootstrap.Modal.getOrCreateInstance(modal).show();
    }
  }

  clearLogs() {
    this.isClearing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.logsService.clearLogs(this.logSource).subscribe({
      next: () => {
        this.successMessage = 'Logs vidés avec succès';
        this.logsText = '';
        this.isClearing = false;
        const modal = document.getElementById('clear-logs-modal');
        if (modal && (window as any).bootstrap) {
          (window as any).bootstrap.Modal.getOrCreateInstance(modal).hide();
        }
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: err => {
        this.isClearing = false;
        this.errorMessage = err.error?.message || 'Erreur lors du vidage des logs';
        if (err.status === 401) this.authService.logout();
      }
    });
  }



  // Labels dynamiques selon la source active
  get downloadButtonLabel(): string {
    const labels: Record<string, string> = {
      frontend: 'Télécharger les logs du frontend',
      backend:  'Télécharger les logs du backend',
      rag:      'Télécharger les logs du RAG',
    };
    return labels[this.logSource] ?? 'Télécharger les logs';
  }

  get downloadFileName(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
    return `logs_${this.logSource}_${stamp}.txt`;
  }

  // ---- Méthode de téléchargement ----
  downloadLogs(): void {
    if (this.isDownloading) return;
    this.isDownloading = true;

    this.logsService.downloadLogs(this.logSource)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob: Blob) => {
          // Créer un lien temporaire et déclencher le téléchargement
          const url  = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href  = url;
          link.download = this.downloadFileName;
          link.click();
          window.URL.revokeObjectURL(url);
          this.isDownloading = false;
        },
        error: (err) => {
          console.error('Erreur téléchargement logs:', err);
          this.isDownloading = false;
        }
      });
  }

}