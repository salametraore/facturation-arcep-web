import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatDividerModule
  ],
  templateUrl: './client.html',
  styleUrls: ['./client.css']
})
export class ClientPage {
  search = '';
  typeFilter = '';
  fromDate: Date | null = null;
  toDate: Date | null = null;
  selectAll = false;
  selectedFileName: string | null = null;

  clients = [
    { id: '1', name: 'Client Alpha', email: 'alpha@email.com', logo: 'assets/logo1.png', accountNumber: '123456', registeredAt: '2025-01-10', invoiceCount: 12, selected: false, type: 'gros' },
    { id: '2', name: 'Client Bêta', email: 'beta@email.com', logo: 'assets/logo2.png', accountNumber: '654321', registeredAt: '2025-02-05', invoiceCount: 5, selected: false, type: 'moyen' },
    { id: '3', name: 'Client Gamma', email: 'gamma@email.com', logo: 'assets/logo3.png', accountNumber: '112233', registeredAt: '2025-03-01', invoiceCount: 8, selected: false, type: 'petit' }
  ];

  constructor(private router: Router) {}

  get filteredClients() {
    return this.clients.filter(c => {
      const matchesSearch = this.search
        ? c.name.toLowerCase().includes(this.search.toLowerCase()) ||
          c.email.toLowerCase().includes(this.search.toLowerCase())
        : true;
      const matchesType = this.typeFilter ? c.type === this.typeFilter : true;
      const matchesFromDate = this.fromDate ? new Date(c.registeredAt) >= this.fromDate : true;
      const matchesToDate = this.toDate ? new Date(c.registeredAt) <= this.toDate : true;
      return matchesSearch && matchesType && matchesFromDate && matchesToDate;
    });
  }

  resetFilters() {
    this.search = '';
    this.typeFilter = '';
    this.fromDate = null;
    this.toDate = null;
  }

  toggleSelectAll() {
    this.clients.forEach(c => c.selected = this.selectAll);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (input?.files?.length) this.selectedFileName = input.files[0].name;
    else this.selectedFileName = null;
  }

  printSelected() {
    const selected = this.clients.filter(c => c.selected);
    if (!selected.length) { alert('Veuillez sélectionner au moins un client.'); return; }

    let html = `<h2>Liste des clients sélectionnés</h2>
                <table border="1" cellspacing="0" cellpadding="6">
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Numéro de compte</th>
                    <th>Date d'enregistrement</th>
                    <th>Nombre de factures</th>
                  </tr>`;
    selected.forEach(c => {
      html += `<tr>
                 <td>${c.name}</td>
                 <td>${c.email}</td>
                 <td>${c.accountNumber}</td>
                 <td>${c.registeredAt}</td>
                 <td>${c.invoiceCount}</td>
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

  exportSelected() {
    const selected = this.clients.filter(c => c.selected);
    if (!selected.length) { alert('Veuillez sélectionner au moins un client.'); return; }

    const header = ['Nom', 'Email', 'Numéro de compte', 'Date d\'enregistrement', 'Nombre de factures'];
    const rows = selected.map(c => [c.name, c.email, c.accountNumber, c.registeredAt, c.invoiceCount]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'clients_selectionnes.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  goToCreate() {
    this.router.navigate(['/dsi/client-create']);
  }

  openDetail(id: string) {
  this.router.navigate(['/dsi/client-detail', id]);
}
}
