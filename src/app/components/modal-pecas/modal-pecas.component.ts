import { IonHeader } from '@ionic/angular/standalone';
import { ModalController, IonicModule } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface IPeca {
  descricao: string;
  quantidade: number;
}

@Component({
  selector: 'app-modal-pecas',
  templateUrl: './modal-pecas.component.html',
  styleUrls: ['./modal-pecas.component.css'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class ModalPecasComponent {

  @Input() pecas: IPeca[] = [];

  novaPeca: IPeca = {
    descricao: '',
    quantidade: 1
  };

  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  adicionarPeca() {
    if (!this.novaPeca.descricao || !this.novaPeca.quantidade) {
      return;
    }

    this.pecas.push({ ...this.novaPeca });

    // reset
    this.novaPeca = { descricao: '', quantidade: 1 };
  }

  removerPeca(peca: IPeca) {
    this.pecas = this.pecas.filter(p => p !== peca);
  }

  finalizar() {
    this.modalCtrl.dismiss(this.pecas);
  }

}
