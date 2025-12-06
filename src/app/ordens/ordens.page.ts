import { CommonModule, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle, IonList, IonButton, IonSearchbar, IonInfiniteScroll, IonInfiniteScrollContent, IonButtons, IonLabel, IonSegment, IonSegmentButton, IonBackButton } from '@ionic/angular/standalone';
import { OrdemServico } from '../models/ordem.inteface';
import { OrdemDbService } from '../services/ordem-db.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ordens',
  templateUrl: './ordens.page.html',
  styleUrls: ['./ordens.page.css'],
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
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
    IonSearchbar,
    IonInfiniteScroll,
    IonButtons,
    IonInfiniteScrollContent,
    IonBackButton
  ]
})
export class OrdensPage implements OnInit {

  ordens: OrdemServico[] = [];
  pageSize = 10;
  page = 0;
  loading = false;
  finished = false;

  // filtros / busca
  searchTerm = '';

  totalCount = 0; // total de ordens que batem no filtro (para contador)

  private ordemDb = inject(OrdemDbService);
  private router = inject(Router);

  constructor() {}

  async ngOnInit() {
    await this.resetAndLoad();
  }

  async ionViewWillEnter() {
    await this.resetAndLoad();
  }

  navegarParaCriarOrdem() {
    this.router.navigate(['/criar-ordem']);
  }


  async resetAndLoad() {
    this.page = 0;
    this.ordens = [];
    this.finished = false;
    await this.updateTotalCount();
    await this.loadNextPage();
  }

  async updateTotalCount() {
    this.totalCount = await this.ordemDb.countFiltered({
      status: 'aguardando_execucao',
      search: this.searchTerm
    });
  }

  async loadNextPage(event?: any) {
    if (this.loading || this.finished) {
      if (event) event.target.complete();
      return;
    }

    this.loading = true;

    const skip = this.page * this.pageSize;
    const result = await this.ordemDb.getPaged({
      skip,
      limit: this.pageSize,
      status: 'aguardando_execucao',
      search: this.searchTerm
    });

    console.log("result", result)

    // adicionar ao array
    this.ordens = [...this.ordens, ...result];

    // se menos que pageSize foi retornado, chegamos ao fim
    if (result.length < this.pageSize) {
      this.finished = true;
    } else {
      this.page++;
    }

    this.loading = false;

    if (event) {
      event.target.complete();
    }
  }

  // handler do infinite scroll
  async loadMore(event: any) {
    await this.loadNextPage(event);
  }

  // busca/digitar no searchbar
  async onSearchChange(ev: any) {
    this.searchTerm = ev.detail.value;
    await this.resetAndLoad();
  }

  executarOS(os: OrdemServico) {
    // navegar para a página de execução (passa o id)
    this.router.navigate(['/executar', os.id, false]);
  }

}
