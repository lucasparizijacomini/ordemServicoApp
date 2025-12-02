import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
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
  IonLabel,
  IonIcon,
  IonTextarea,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItemDivider,
  IonButton,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { OrdemServico } from '../models/ordem.inteface';
import { ModalOrdemComponent } from './modal-ordem/modal-ordem.component';
import { OrdemDbService } from '../services/ordem-db.service';

import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';



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
    IonLabel,
    IonIcon,
    IonList,
    IonItemDivider,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    // IonRadioGroup,
    // IonRadio,
    // IonTextarea,
    IonButton,
  ],
  providers: [ModalController]
})
export class CriaOrdemComponent {

  ordem!: OrdemServico;

 constructor(
  private router: Router,
  private alertController: AlertController,
  private modalCtrl: ModalController,
  private ordemDb: OrdemDbService
) {
  addIcons({ 'camera-outline': cameraOutline });
  this.ordem = new OrdemServico();
}

  async openModalProblema() {
    const modal = await this.modalCtrl.create({
      component: ModalOrdemComponent
    });

    modal.onDidDismiss().then(result => {
      const problema = result.data;

      if (problema) {
        this.ordem.problemas.push(problema);
      }
    });

    return await modal.present();
  }

  async tirarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });

      const fileName = `foto_os_${Date.now()}.jpeg`;

      // Salvar no Filesystem
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: image.base64String!,
        directory: Directory.Data
      });

      // Salvar APENAS o caminho no objeto da OS
        const webPath = Capacitor.convertFileSrc(savedFile.uri);

      // Armazena o caminho convertido
      this.ordem.fotoUrl = webPath;

      console.log('Foto salva em:', webPath);

    } catch (error) {
      console.error('Erro ao tirar/salvar foto:', error);
    }
  }


  async finalizarOS() {
    // Validações simples
    if (!this.ordem.modelo || !this.ordem.frota) {
      const alert = await this.alertController.create({
        header: 'Campos obrigatórios',
        message: 'Preencha Modelo e Frota.',
        buttons: ['OK']
      });
      return alert.present();
    }

    // MARCA COMO EM ANDAMENTO
    this.ordem.situacao = 1;

    // SALVA NO BANCO
    await this.ordemDb.add(this.ordem);

    const alert = await this.alertController.create({
      header: 'Sucesso',
      message: 'Ordem de Serviço criada!',
      buttons: [
        {
          text: 'OK',
          handler: () => this.router.navigate(['/home'])
        }
      ]
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
      observacao: '',
      situacao: ''
    });
  }

  removerProblema(index: number) {
    this.ordem.problemas.splice(index, 1);
  }

}
