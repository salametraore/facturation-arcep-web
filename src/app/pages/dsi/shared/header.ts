import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'] // <-- attention : styleUrls (pluriel)
})
export class Header {
  searchText = '';
  showProfile = false;
  showNotifications = false;

  notifications = [
    { title: 'Nouveau message', message: 'Vous avez reçu un nouveau mail.', time: 'Aujourd’hui' },
    { title: 'Alerte sécurité', message: 'Connexion depuis un nouvel appareil.', time: 'Hier' },
    { title: 'Rapport disponible', message: 'Votre rapport mensuel est prêt.', time: 'Il y a 3 jours' }
  ];

  // Toggle avec protection contre propagation et logs pour debug
  toggleProfile(event?: Event) {
    event?.stopPropagation();
    this.showProfile = !this.showProfile;
    if (this.showProfile) this.showNotifications = false;
    console.log('toggleProfile ->', this.showProfile);
  }

  toggleNotifications(event?: Event) {
    event?.stopPropagation();
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) this.showProfile = false;
    console.log('toggleNotifications ->', this.showNotifications);
  }

  // Ferme les dropdowns si on clique en dehors
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (this.showProfile || this.showNotifications) {
      this.showProfile = false;
      this.showNotifications = false;
      console.log('closed dropdowns by outside click');
    }
  }
}
