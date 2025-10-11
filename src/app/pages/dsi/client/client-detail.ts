import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-client-detail',
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
    MatTabsModule,
    MatTableModule,
    MatDividerModule,
    MatCardModule
  ],
  templateUrl: './client-detail.html',
  styleUrls: ['./client-detail.css']
})
export class ClientDetailPage implements OnInit {
  clientId: string | null = null;
  client: any = null;

  // Tabs data
  ficheTechnique: any[] = [];
  devis: any[] = [];
  factures: any[] = [];
  documents: any[] = [];

  // Liste fictive de clients pour test
  clients = [
    { id: '1', name: 'Client Alpha', email: 'alpha@email.com', accountNumber: '123456', registeredAt: '2025-01-10', invoiceCount: 12 },
    { id: '2', name: 'Client Bêta', email: 'beta@email.com', accountNumber: '654321', registeredAt: '2025-02-05', invoiceCount: 5 },
    { id: '3', name: 'Client Gamma', email: 'gamma@email.com', accountNumber: '112233', registeredAt: '2025-03-01', invoiceCount: 8 }
  ];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.clientId = this.route.snapshot.paramMap.get('id');

    // Ici tu chargerais le client via un service réel
    this.client = this.clients.find(c => c.id === this.clientId) || {
      id: this.clientId,
      name: 'Client inconnu',
      logo: 'assets/logo1.png',
      registeredAt: '2025-01-10',
      accountNumber: '123456',
      ifu: 'IFU123456',
      rccm: 'RCCM98765',
      phone: '+226 70 00 00 00',
      email: 'alpha@email.com',
      address: 'Ouagadougou, Burkina Faso',
      unpaidInvoices: 3
    };

    // Exemple de données tabulaires
    this.ficheTechnique = [
      { reference: 'FT-001', serviceType: 'Nom de domaine', status: 'En cours', submissionDate: '2025-01-15', lastAction: 'Transmis à DFC' },
      { reference: 'FT-002', serviceType: 'Service de confiance', status: 'Clôturée', submissionDate: '2025-01-20', lastAction: 'Paiement reçu' }
    ];

    this.devis = [
      { reference: 'DV-001', amount: 100000, status: 'Impayé', dueDate: '2025-02-10' }
    ];

    this.factures = [
      { reference: 'FAC-001', amount: 150000, status: 'Payé', dueDate: '2025-02-15' }
    ];

    this.documents = [
      { title: 'Contrat Alpha', uploadedAt: '2025-01-12' }
    ];
  }

  // 🚀 Navigation corrigée
  goToServiceCreate(type: string) {
    if (type === 'nom-de-domaine') {
      // Route correcte pour créer un nom de domaine
      this.router.navigate(['/dsi/nom-de-domaine/new']);
    }
    if (type === 'service-de-confiance') {
      // Route correcte pour créer un service de confiance
      this.router.navigate(['/dsi/service-de-confiance-create']);
    }
  }

  editLogo() {
    alert('Fonction de modification du logo ici');
  }

  viewDocument(doc: any) {
    alert('Voir document: ' + doc.title);
  }
}
