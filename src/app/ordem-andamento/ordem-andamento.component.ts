import { Component, OnInit } from '@angular/core';
import { OrdemServico } from '../models/ordem.inteface';
import { OrdemDbService } from '../services/ordem-db.service';
import { Router } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonCardSubtitle,
  IonList,
  IonButton,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ordem-andamento',
  templateUrl: './ordem-andamento.component.html',
  styleUrls: ['./ordem-andamento.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonCardSubtitle,
    IonButton,
  ]
})
export class OrdemAndamentoComponent  implements OnInit {

  ordens: OrdemServico[];

  constructor(private ordemDb: OrdemDbService,
    private router: Router
  ) {
    this.ordens = [];
  }

  async ngOnInit() {
    await this.carregarOrdens();
  }

  async ionViewWillEnter() {
    await this.carregarOrdens();
  }

  async carregarOrdens() {
    // Busca todas as OS onde situacao === 1
    this.ordens =  await this.ordemDb.getEmAndamento();
  }

  executarOS(os: OrdemServico) {
    this.router.navigate(['/executar', os.id]);
  }

}
