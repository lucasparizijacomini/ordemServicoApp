import { IonContent, IonButton, IonList, IonItem, IonLabel, IonToolbar, IonHeader, IonTitle, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cadastros',
  templateUrl: './cadastros.component.html',
  styleUrls: ['./cadastros.component.css'],
  imports: [
    CommonModule,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonBackButton
  ]
})
export class CadastrosComponent implements OnInit {

  private router = inject(Router)

  constructor() { }

  ngOnInit() {
  }

  navegarCategorias(){
    this.router.navigate(['categorias']);
  }

}
