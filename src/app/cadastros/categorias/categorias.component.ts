import {
  IonContent,
  IonToggle,
  IonText,
  IonIcon,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { CommonModule, NgFor } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ICategoria } from 'src/app/models/categorias.interface';
import { DbService } from 'src/app/services/db.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss'],
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
    IonBackButton,
    IonIcon,
    IonText,
    IonToggle,
  ],
})
export class CategoriasComponent implements OnInit {
  public categorias: ICategoria[];
  private dbService = inject(DbService);
  private alertCtrl = inject(AlertController);

  constructor() {
    this.categorias = [];
  }

  ionViewWillEnter() {
    this.carregarCategorias();
  }

  ngOnInit() {}

  async carregarCategorias() {
    this.categorias = await this.dbService.getAllCategorias();
  }

  async toggleStatus(categoria: ICategoria) {
    categoria.ativo = !categoria.ativo;
    await this.dbService.updateCategoria(categoria);
  }

  async abrirModalNovaCategoria() {
    const alert = await this.alertCtrl.create({
      header: 'Nova Categoria',
      inputs: [
        {
          name: 'nome',
          type: 'text',
          placeholder: 'Nome da categoria',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salvar',
          handler: async (data) => {
            if (!data.nome) return false;

            await this.dbService.addCategoria({
              nome: data.nome,
              ativo: true,
              criadoEm: new Date(),
            });

            this.carregarCategorias();
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  async editarCategoria(categoria: ICategoria) {
    const alert = await this.alertCtrl.create({
      header: 'Editar Categoria',
      inputs: [
        {
          name: 'nome',
          type: 'text',
          value: categoria.nome,
          placeholder: 'Nome da categoria',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salvar',
          handler: async (data) => {
            if (!data.nome) return false;

            categoria.nome = data.nome;
            await this.dbService.updateCategoria(categoria);

            this.carregarCategorias();
            return true
          },
        },
      ],
    });

    await alert.present();
  }

  async excluirCategoria(categoria: ICategoria) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: `Deseja desativar a categoria <strong>${categoria.nome}</strong>?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Desativar',
          role: 'destructive',
          handler: async () => {
            categoria.ativo = false;
            await this.dbService.updateCategoria(categoria);
            this.carregarCategorias();
          },
        },
      ],
    });

    await alert.present();
  }
}
