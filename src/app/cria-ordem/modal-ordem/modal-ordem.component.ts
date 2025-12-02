import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonItem,
  IonInput,
  IonButton,
} from '@ionic/angular/standalone';
import { Problemas } from 'src/app/models/ordem.inteface';

@Component({
  selector: 'app-modal-ordem',
  templateUrl: './modal-ordem.component.html',
  styleUrls: ['./modal-ordem.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButtons,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonContent,
    IonItem,
    IonInput,
  ]
})
export class ModalOrdemComponent {

  problema: Problemas = {
    id: 0,
    tipo: '',
    situacao: '',
    observacao: ''
  };

  constructor(private modal: ModalController) {}

  close() {
    this.modal.dismiss();
  }

  salvar() {
    this.modal.dismiss(this.problema);
  }

}

