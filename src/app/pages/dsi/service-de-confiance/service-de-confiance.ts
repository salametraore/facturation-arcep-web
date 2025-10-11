import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-service-de-confiance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule
  ],
  templateUrl: './service-de-confiance.html',
  styleUrls: ['./service-de-confiance.css']
})
export class ServiceDeConfiancePage {
  search = '';
  statusFilter = '';
  fromDate: Date | null = null;
  toDate: Date | null = null;

  demandes = [
    { id: '1', name: 'Prestataire Alpha', serviceCategory: 'Archivage électronique', receivedAt: '2025-01-20', status: 'nouveau', selected: false },
    { id: '2', name: 'Prestataire Bêta', serviceCategory: 'Certification électronique', receivedAt: '2025-02-10', status: 'en_cours', selected: false },
    { id: '3', name: 'Prestataire Gamma', serviceCategory: 'Horodatage électronique', receivedAt: '2025-03-02', status: 'validé', selected: false }
  ];

  selectedFileName: string | null = null;
  selectAll = false;

  constructor(private router: Router) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (input?.files?.length) this.selectedFileName = input.files[0].name;
    else this.selectedFileName = null;
  }

  toggleSelectAll() {
    this.demandes.forEach(d => d.selected = this.selectAll);
  }

  get filteredDemandes() {
    return this.demandes.filter(d => {
      const matchesSearch = this.search
        ? d.name.toLowerCase().includes(this.search.toLowerCase()) ||
          d.serviceCategory.toLowerCase().includes(this.search.toLowerCase())
        : true;
      const matchesStatus = this.statusFilter ? d.status === this.statusFilter : true;
      const matchesFromDate = this.fromDate ? new Date(d.receivedAt) >= this.fromDate : true;
      const matchesToDate = this.toDate ? new Date(d.receivedAt) <= this.toDate : true;
      return matchesSearch && matchesStatus && matchesFromDate && matchesToDate;
    });
  }

  resetFilters() {
    this.search = '';
    this.statusFilter = '';
    this.fromDate = null;
    this.toDate = null;
  }

  openDetail(id: string) {
    this.router.navigate(['/dsi/service-de-confiance-detail', id]);
  }

  // 🌟 Imprimer les éléments sélectionnés
  printSelected() {
    const selected = this.demandes.filter(d => d.selected);
    if (selected.length === 0) { alert('Veuillez sélectionner au moins une demande.'); return; }

    let html = `<h2>Liste des demandes sélectionnées</h2>
                <table border="1" cellspacing="0" cellpadding="6">
                  <tr>
                    <th>Nom du Prestataire</th>
                    <th>Catégorie</th>
                    <th>Date de Réception</th>
                    <th>Statut</th>
                  </tr>`;
    selected.forEach(d => {
      html += `<tr>
                 <td>${d.name}</td>
                 <td>${d.serviceCategory}</td>
                 <td>${d.receivedAt}</td>
                 <td>${d.status}</td>
               </tr>`;
    });
    html += `</table>`;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  }

  // 🌟 Exporter en CSV
  exportSelected() {
    const selected = this.demandes.filter(d => d.selected);
    if (selected.length === 0) { alert('Veuillez sélectionner au moins une demande.'); return; }

    const header = ['Nom du Prestataire', 'Catégorie', 'Date de Réception', 'Statut'];
    const rows = selected.map(d => [d.name, d.serviceCategory, d.receivedAt, d.status]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [header.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'demandes_selectionnees.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

    // 🚀 Rediriger vers la page de création d'une nouvelle FT
  goToCreate() {
    this.router.navigate(['/dsi/service-de-confiance-create']);
  }

}
