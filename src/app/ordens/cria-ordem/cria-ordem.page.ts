import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonCard,
  IonCardContent,
  IonButton,
  IonBadge,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  alertCircleOutline,
  calendarOutline,
  cameraOutline,
  carSportOutline,
  checkmarkCircleOutline,
  clipboardOutline,
  close,
  constructOutline,
  saveOutline,
  trashOutline,
  warningOutline,
} from 'ionicons/icons';
import { ModalOrdemComponent } from './modal-ordem/modal-ordem.component';
import { OrdemServico } from 'src/app/models/ordem.inteface';
import { OrdemDbService } from 'src/app/services/ordem-db.service';
import { ICategoria } from 'src/app/models/categorias.interface';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-criar-ordem',
  templateUrl: './cria-ordem.page.html',
  styleUrls: ['./cria-ordem.page.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonIcon,
    IonCard,
    IonCardContent,
    IonBadge,
    IonButton,
  ],
  providers: [ModalController],
})
export class CriaOrdemComponent {
  ordem!: OrdemServico;
  categorias: ICategoria[] = [];

  private dbService = inject(DbService)

  constructor(
    private router: Router,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private ordemDb: OrdemDbService
  ) {
    addIcons({
      'camera-outline': cameraOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'save-outline': saveOutline,
      close: close,
      'car-sport-outline': carSportOutline,
      'construct-outline': constructOutline,
      'warning-outline': warningOutline,
      'calendar-outline': calendarOutline,
      'alert-circle-outline': alertCircleOutline,
      'add-circle-outline': addCircleOutline,
      'clipboard-outline': clipboardOutline,
      'trash-outline': trashOutline,
    });
    this.ordem = new OrdemServico();
  }

  ionViewWillEnter() {
    this.carregarCategorias();
  }

  async carregarCategorias() {
    this.categorias = await this.dbService.getAllCategorias();
  }

  async openModalProblema() {
    const modal = await this.modalCtrl.create({
      component: ModalOrdemComponent,
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      // Gera um ID único para o problema
      data.id = this.ordem.problemas.length + 1;
      this.ordem.problemas.push(data);
    }
  }

  async finalizarOS() {
    // Validações simples
    if (!this.ordem.modelo || !this.ordem.frota) {
      const alert = await this.alertController.create({
        header: 'Campos obrigatórios',
        message: 'Preencha Modelo e Frota.',
        buttons: ['OK'],
      });
      return alert.present();
    }

    // MARCA COMO EM ANDAMENTO
    this.ordem.status = 'aguardando_execucao';

    // SALVA NO BANCO
    await this.ordemDb.add(this.ordem);

    const alert = await this.alertController.create({
      header: 'Sucesso',
      message: 'Ordem de Serviço criada!',
      buttons: [
        {
          text: 'OK',
          handler: () => this.router.navigate(['/ordens']),
        },
      ],
    });

    await alert.present();
  }

  adicionarProblema() {
    if (!this.ordem.problemas) {
      this.ordem.problemas = [];
    }

    this.ordem.problemas.push({
      id: 0,
      tipo: '',
      observacao: [],
      pecas: [],
      situacao: '',
      fotoUrl: '',
    });
  }

  removerProblema(index: number) {
    this.ordem.problemas.splice(index, 1);
  }
}
