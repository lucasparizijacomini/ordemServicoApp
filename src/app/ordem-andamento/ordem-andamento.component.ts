import { Component, OnInit } from '@angular/core';
import { OrdemServico } from '../models/ordem.inteface';
import { OrdemDbService } from '../services/ordem-db.service';
import { Router } from '@angular/router';

import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle, IonList, IonButton, IonSearchbar, IonInfiniteScroll, IonInfiniteScrollContent, IonButtons, IonLabel, IonSegment, IonSegmentButton, IonBackButton } from '@ionic/angular/standalone';
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
    IonSearchbar,
    IonInfiniteScroll,
    IonButtons,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonInfiniteScrollContent,
    IonBackButton
]
})
export class OrdemAndamentoComponent  implements OnInit {

  ordens: OrdemServico[] = [];
  pageSize = 10;
  page = 0;
  loading = false;
  finished = false;

  // filtros / busca
  searchTerm = '';
  filtroTipo: string | undefined; // '1' or '2' or undefined

  totalCount = 0; // total de ordens que batem no filtro (para contador)

  constructor(private ordemDb: OrdemDbService, private router: Router) {}

  async ngOnInit() {
    await this.resetAndLoad();
  }

  async ionViewWillEnter() {
    // recarregar ao entrar na tela
    await this.resetAndLoad();
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
      situacao: 1,
      tipo: this.filtroTipo,
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
      situacao: 1, // andamento = 1
      tipo: this.filtroTipo,
      search: this.searchTerm
    });

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

  // filtro por tipo (segment or select)
  async onFiltroTipoChange(newTipo?: any) {
    this.filtroTipo = newTipo;
    await this.resetAndLoad();
  }

  executarOS(os: OrdemServico) {
    // navegar para a página de execução (passa o id)
    this.router.navigate(['/executar', os.id]);
  }

  // ordens: OrdemServico[];

  // constructor(private ordemDb: OrdemDbService,
  //   private router: Router
  // ) {
  //   this.ordens = [];
  // }

  // async ngOnInit() {
  //   await this.carregarOrdens();
  // }

  // async ionViewWillEnter() {
  //   await this.carregarOrdens();
  // }

  // async carregarOrdens() {
  //   // Busca todas as OS onde situacao === 1
  //   this.ordens =  await this.ordemDb.getEmAndamento();
  // }

  // executarOS(os: OrdemServico) {
  //   this.router.navigate(['/executar', os.id]);
  // }

}
