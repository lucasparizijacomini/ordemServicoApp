import { CadastrosComponent } from './cadastros/cadastros.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(c => c.HomeComponent),
  },
   {
    path: 'ordens',
    loadComponent: ()=> import('./ordens/ordens.page').then(c => c.OrdensPage)
  },
  {
    path: 'criar-ordem',
    loadComponent: () => import('./ordens/cria-ordem/cria-ordem.page').then(m => m.CriaOrdemComponent)
  },
  {
    path: 'ordens-andamento',
    loadComponent: () => import('./ordem-andamento/ordem-andamento.component').then(c => c.OrdemAndamentoComponent)
  },
  {
    path: 'executar/:id/:type',
    loadComponent: () => import('./ordem-andamento/ordens-execucao/ordens-execucao.component').then(c => c.OrdensExecucaoComponent)
  },
  {
    path: 'ordens-finalizadas',
    loadComponent: ()=> import('./ordens-finalizadas/ordens-finalizadas.page').then(c => c.OrdensFinalizadasPage)
  },
  {
    path: 'cadastros',
    loadComponent: ()=> import('./cadastros/cadastros.component').then(c => c.CadastrosComponent)
  },
  {
    path: 'categorias',
    loadComponent: () => import('./cadastros/categorias/categorias.component').then(c => c.CategoriasComponent)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];
