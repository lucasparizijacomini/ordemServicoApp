import { Component, OnInit } from '@angular/core';
import { OrdemDbService } from '../services/ordem-db.service';
import { Router } from '@angular/router';

import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonCardSubtitle, IonList, IonButton, 
  IonSearchbar, IonInfiniteScroll, IonInfiniteScrollContent, IonButtons, 
  IonLabel, IonSegment, IonSegmentButton, IonBackButton,
  IonSelect, IonSelectOption, IonIcon, IonItem, IonInput
} from '@ionic/angular/standalone';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdemServico } from '../models/ordem.inteface';
import { DbService } from '../services/db.service';
import { ICategoria } from '../models/categorias.interface';
import { addIcons } from 'ionicons';
import { closeCircleOutline, checkmark, cube } from 'ionicons/icons';

@Component({
  selector: 'app-ordem-andamento',
  templateUrl: './ordem-andamento.component.html',
  styleUrls: ['./ordem-andamento.component.scss'],
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
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonInfiniteScrollContent,
    IonBackButton,
    IonSelect,
    IonSelectOption,
    IonIcon,
    IonItem,
    IonInput
]
})
export class OrdemAndamentoComponent  implements OnInit {

  ordens: OrdemServico[] = [];
  pageSize = 10;
  page = 0;
  loading = false;
  finished = false;

  // filtros / busca
  searchTerm: string = '';
  filtroTipo: string | undefined; // '1' or '2' or undefined
  filtroCategoria = '';
  filtroDataInicio = '';
  filtroDataFim = '';

  categorias: ICategoria[] = [];
  totalCount = 0;

  constructor(
    private ordemDb: OrdemDbService, 
    private router: Router,
    private dbService: DbService
  ) {
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
      status: 'em_execucao',
      tipo: this.filtroTipo,
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
      status: 'em_execucao',
      tipo: this.filtroTipo,
      search: this.searchTerm,
      categoriaId: this.filtroCategoria,
      dataInicio: this.filtroDataInicio,
      dataFim: this.filtroDataFim
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

  async togglePecaDisponivel(ev: Event, os: OrdemServico, problemaId: number) {
    ev.stopPropagation();
    await this.ordemDb.togglePecaDisponivel(os.id!, problemaId);
    const p = os.problemas.find((p: any) => p.id === problemaId);
    if (p) p.pecaDisponivel = !p.pecaDisponivel;
  }

  executarOS(os: OrdemServico, problemId?: number) {
    // navegar para a página de execução (passa o id)
    this.router.navigate(['/executar', os.id, false], {
      queryParams: problemId ? { problemId } : {}
    });
  }

  async limparFiltros() {
    this.searchTerm = '';
    this.filtroTipo = undefined;
    this.filtroCategoria = '';
    this.filtroDataInicio = '';
    this.filtroDataFim = '';
    await this.resetAndLoad();
  }


}
