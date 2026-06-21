import { CommonModule, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { OrdemDbService } from '../services/ordem-db.service';
import { Router } from '@angular/router';
import { DbService } from '../services/db.service';
import { ICategoria } from '../models/categorias.interface';
import { addIcons } from 'ionicons';
import { closeCircleOutline, checkmark, cube } from 'ionicons/icons';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonCardSubtitle, IonList, IonButton, 
  IonSearchbar, IonInfiniteScroll, IonInfiniteScrollContent, IonButtons, 
  IonLabel, IonSegment, IonSegmentButton, IonBackButton,
  IonSelect, IonSelectOption, IonIcon, IonItem, IonInput
} from '@ionic/angular/standalone';
import { OrdemServico } from '../models/ordem.inteface';

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
    IonBackButton,
    IonSelect,
    IonSelectOption,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput
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
  filtroCategoria = '';
  filtroDataInicio = '';
  filtroDataFim = '';

  categorias: ICategoria[] = [];
  totalCount = 0;

  private ordemDb = inject(OrdemDbService);
  private router = inject(Router);
  private dbService = inject(DbService);

  constructor() {
    addIcons({
      'close-circle-outline': closeCircleOutline,
      'checkmark': checkmark,
      'cube': cube
    });
  }

  async ngOnInit() {
    this.categorias = await this.dbService.getAllCategorias();
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
      search: this.searchTerm,
      categoriaId: this.filtroCategoria,
      dataInicio: this.filtroDataInicio,
      dataFim: this.filtroDataFim
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
      search: this.searchTerm,
      categoriaId: this.filtroCategoria,
      dataInicio: this.filtroDataInicio,
      dataFim: this.filtroDataFim
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

  async togglePecaDisponivel(ev: Event, os: OrdemServico, problemaId: number) {
    ev.stopPropagation(); // Impede o clique no card/imagem principal
    await this.ordemDb.togglePecaDisponivel(os.id!, problemaId);
    // Não precisa carregar tudo de novo se estivermos apenas mudando uma flag local no objeto
    const p = os.problemas.find(p => p.id === problemaId);
    if (p) p.pecaDisponivel = !p.pecaDisponivel;
  }

  executarOS(os: OrdemServico, problemId?: number) {
    // navegar para a página de execução (passa le o id)
    this.router.navigate(['/executar', os.id, false], {
      queryParams: problemId ? { problemId } : {}
    });
  }

  async limparFiltros() {
    this.searchTerm = '';
    this.filtroCategoria = '';
    this.filtroDataInicio = '';
    this.filtroDataFim = '';
    await this.resetAndLoad();
  }

}
