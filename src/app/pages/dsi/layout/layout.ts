import { Component } from '@angular/core';
import { Sidebar } from '../shared/sidebar';
import { Header } from '../shared/header'; // ✅ correspond exactement à export class Header
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [Sidebar, Header, RouterOutlet], // ✅ standalone, donc imports ici
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class DsiLayout {}
