
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

interface RequestItem {
  id: string;
  name: string;
  serviceCategory: string;
  receivedAt: string; // ISO date
  status: 'nouveau' | 'en_cours' | 'traité' | 'rejeté';
}

@Component({
  selector: 'app-nom-de-domaine',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './nom-de-domaine.html',
  styleUrls: ['./nom-de-domaine.css']
})
export class NomDeDomainePage {
  // filtres / UI state
  search = '';
  statusFilter = '';
  fromDate = '';
  toDate = '';

  // données (exemples — remplace par appel API si besoin)
  requests: RequestItem[] = [
    { id: '1', name: 'internetpuissance.bf', serviceCategory: "Bureau d'enregistrement", receivedAt: '2025-01-20', status: 'nouveau' },
    { id: '2', name: 'afrix-telecom.bf', serviceCategory: "Serv d'archivage électronique", receivedAt: '2025-02-13', status: 'en_cours' },
    { id: '3', name: 'netis.bf', serviceCategory: "Bureau d'enregistrement", receivedAt: '2025-02-13', status: 'nouveau' },
    { id: '4', name: 'orange.bf', serviceCategory: "Serv d'archivage électronique", receivedAt: '2025-04-01', status: 'nouveau' },
  ];

  constructor(private router: Router) {}

  // filtre appliqué
  get filteredRequests(): RequestItem[] {
    return this.requests.filter(r => {
      if (this.statusFilter && r.status !== this.statusFilter) return false;
      if (this.search) {
        const q = this.search.toLowerCase();
        if (!(`${r.name} ${r.serviceCategory}`.toLowerCase().includes(q))) return false;
      }
      if (this.fromDate) {
        if (new Date(r.receivedAt) < new Date(this.fromDate)) return false;
      }
      if (this.toDate) {
        if (new Date(r.receivedAt) > new Date(this.toDate)) return false;
      }
      return true;
    });
  }

  goToCreate() {
    this.router.navigate(['/dsi/nom-de-domaine/new']);
  }

  goToDetail(id: string) {
    this.router.navigate(['/dsi/nom-de-domaine', id]);
  }

  // export CSV (simple)
  exportCSV() {
    const rows = [
      ['id','nom du domaine','catégorie','date réception','status'],
      ...this.filteredRequests.map(r => [r.id, r.name, r.serviceCategory, r.receivedAt, r.status])
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `nom_de_domaine_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // import CSV basique (attendu colonnes: id,name,serviceCategory,receivedAt,status)
  importCSV(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length <= 1) return;
      const newRows = lines.slice(1).map(line => {
        const cols = line.split(',').map(c => c.replace(/^"|"$/g,'').trim());
        return {
          id: cols[0] || String(Date.now()),
          name: cols[1] || 'inconnu',
          serviceCategory: cols[2] || '—',
          receivedAt: cols[3] || new Date().toISOString().slice(0,10),
          status: (cols[4] as any) || 'nouveau'
        } as RequestItem;
      });
      // ajoute au début
      this.requests = [...newRows, ...this.requests];
    };
    reader.readAsText(file);
  }

  // print (imprime la section tableau)
  printTable() {
    window.print();
  }
}
