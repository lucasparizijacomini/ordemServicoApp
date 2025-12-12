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
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  downloadOutline,
  constructOutline,
  playCircleOutline,
  createOutline
} from 'ionicons/icons';
import { OrdemDbService } from '../services/ordem-db.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    NgIf,
    IonTitle,
    IonContent,
    IonButtons,
    IonMenuButton,
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
export class HomeComponent  {

  totalAndamento: number;
  totalAguardandoExecucao: number;

  constructor(private router: Router, private ordemDb: OrdemDbService) {
    addIcons({
      'download-outline': downloadOutline,
      'construct-outline': constructOutline,
      'play-circle-outline': playCircleOutline,
      'create-outline': createOutline
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

  private async loadedTotal (){
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

  navegarParaOrdensFinalizadas(){
    this.router.navigate(['/ordens-finalizadas']);
  }
}
