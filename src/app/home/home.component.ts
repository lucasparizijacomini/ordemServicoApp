import { addIcons } from 'ionicons';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonBadge
} from '@ionic/angular/standalone';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  downloadOutline,
  constructOutline,
  playCircleOutline,
  createOutline,
  moonOutline,
  sunnyOutline
} from 'ionicons/icons';
import { OrdemDbService } from '../services/ordem-db.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonBadge
  ]
})
export class HomeComponent {

  totalAndamento: number;
  totalAguardandoExecucao: number;

  private router = inject(Router)
  private ordemDb = inject(OrdemDbService)
  public themeService = inject(ThemeService);

  constructor() {
    addIcons({
      'download-outline': downloadOutline,
      'construct-outline': constructOutline,
      'play-circle-outline': playCircleOutline,
      'create-outline': createOutline,
      'moon-outline': moonOutline,
      'sunny-outline': sunnyOutline
    });
    this.totalAndamento = 0;
    this.totalAguardandoExecucao = 0;
  }

  async ngOnInit() {
    await this.loadedTotal();
  }

  async ionViewWillEnter() {
    await this.loadedTotal();
  }

  private async loadedTotal() {
    this.totalAndamento = await this.ordemDb.countByStatus('em_execucao'); // 1 = Em andamento
    this.totalAguardandoExecucao = await this.ordemDb.countByStatus('aguardando_execucao')
  }

  navegarParaOrdens() {
    this.router.navigate(['/ordens']);
  }

  navegarParaServicosAndamento() {
    console.log('Navegar para Serviços em Andamento');
    this.router.navigate(['/ordens-andamento']);
  }

  navegarParaOrdensFinalizadas() {
    this.router.navigate(['/ordens-finalizadas']);
  }

  navegarParaCadastros() {
    this.router.navigate(['/cadastros'])
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
