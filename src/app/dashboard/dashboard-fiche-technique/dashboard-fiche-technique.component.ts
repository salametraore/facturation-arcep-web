import {Component, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";

@Component({
  selector: 'app-dashboard-fiche-technique',
  templateUrl: './dashboard-fiche-technique.component.html',
  styleUrl: './dashboard-fiche-technique.component.scss'
})
export class DashboardFicheTechniqueComponent implements OnInit{
// Filtres
  instanceNameFilter = new FormControl('');
  startDate = new FormControl(new Date('2025-09-23T11:03:00Z')); // 11:03 AM GMT, 23 sept 2025
  endDate = new FormControl(new Date('2025-09-23T11:03:00Z')); // 11:03 AM GMT, 23 sept 2025
  serviceFilter = new FormControl('');
  statusFilter = new FormControl('');

  // Données de la table
  displayedColumns: string[] = ['instance', 'dateSubmission', 'service', 'status', 'actions'];
  dataSource = new MatTableDataSource([
    {
      instance: 'Instance 1',
      dateSubmission: '30 avril 2025',
      service: 'Gestion des instances',
      status: 'En attente',
      actions: 'Traiter'
    },
    {
      instance: 'Instance 2',
      dateSubmission: '13 mars 2025',
      service: 'Gestion des instances',
      status: 'Transmis',
      actions: 'Traiter'
    }
    // Ajoutez d'autres données si nécessaire
  ]);

  // Pagination
  pageSize = 10;
  currentPage = 1;
  totalItems = 68; // Total des éléments selon la pagination

  constructor() {}

  ngOnInit() {
    this.applyFilters();
  }

  applyFilters() {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const matchInstance = data.instance.toLowerCase().includes(this.instanceNameFilter.value?.toLowerCase() || '');
      const matchService = data.service.toLowerCase().includes(this.serviceFilter.value?.toLowerCase() || '');
      const matchStatus = data.status.toLowerCase().includes(this.statusFilter.value?.toLowerCase() || '');
      const matchDate = (!this.startDate.value || new Date(data.dateSubmission) >= this.startDate.value) &&
        (!this.endDate.value || new Date(data.dateSubmission) <= this.endDate.value);
      return matchInstance && matchService && matchStatus && matchDate;
    };
    this.dataSource.filter = ' '; // Réapplique le filtre
  }

  onPageChange(page: number) {
    this.currentPage = page;
    // Logique pour charger les données de la page correspondante
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'transmis':
        return 'status-transmis';
      case 'en attente':
        return 'status-en-attente';
      case 'clos':
        return 'status-clos';
      case 'abandon':
        return 'status-abandon';
      default:
        return '';
    }
  }
}
