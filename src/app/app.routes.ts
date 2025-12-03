import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(c => c.HomeComponent),
  },
  {
    path: 'criar-ordem',
    loadComponent: () => import('./cria-ordem/cria-ordem.page').then(m => m.CriaOrdemComponent)
  },
  {
    path: 'ordens-andamento',
    loadComponent: () => import('./ordem-andamento/ordem-andamento.component').then(c => c.OrdemAndamentoComponent)
  },
  {
    path: 'executar/:id',
    loadComponent: () => import('./ordem-andamento/ordens-execucao/ordens-execucao.component').then(c => c.OrdensExecucaoComponent)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];
