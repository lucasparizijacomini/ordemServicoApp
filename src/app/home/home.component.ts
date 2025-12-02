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
  IonCardTitle
} from '@ionic/angular/standalone';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  downloadOutline,
  constructOutline,
  playCircleOutline,
  createOutline
} from 'ionicons/icons';

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
    IonCardTitle
  ]
})
export class HomeComponent  {

  constructor(private router: Router) {
    addIcons({
      'download-outline': downloadOutline,
      'construct-outline': constructOutline,
      'play-circle-outline': playCircleOutline,
      'create-outline': createOutline
    });
  }

  navegarParaOrdens() {
    //this.router.navigate(['/criar-ordem']);
  }

  navegarParaServicosAndamento() {
    console.log('Navegar para Serviços em Andamento');
    this.router.navigate(['/ordens-andamento']);
  }

  navegarParaCriarOrdem() {
    console.log('Navegar para Criar Ordem');
    this.router.navigate(['/criar-ordem']);
    // this.router.navigate(['/criar-ordem']);
  }

}
