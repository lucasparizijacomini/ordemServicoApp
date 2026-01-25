import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { ModalController } from '@ionic/angular';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  buildOutline,
  cameraOutline,
  close,
  flagOutline,
  saveOutline,
  timeOutline,
} from 'ionicons/icons';
import { Problemas } from 'src/app/models/ordem.inteface';
import { PhotoEditor } from '@capawesome/capacitor-photo-editor';

@Component({
  selector: 'app-modal-ordem',
  templateUrl: './modal-ordem.component.html',
  styleUrls: ['./modal-ordem.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButtons,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonContent,
    IonItem,
    IonInput,
    IonIcon,
    IonCard,
    IonCardContent,
    IonLabel,
  ],
})
export class ModalOrdemComponent {
  problema: Problemas = {
    id: 0,
    tipo: '',
    situacao: 'pendente',
    observacao: [],
    pecas: [],
    fotoUrl: '',
  };

  constructor(private modalCtrl: ModalController) {
    addIcons({
      'flag-outline': flagOutline,
      'time-outline': timeOutline,
      'build-outline': buildOutline,
      close: close,
      'camera-outline': cameraOutline,
      'save-outline': saveOutline,
    });
  }

  // Método para fechar o modal
  close() {
    this.modalCtrl.dismiss();
  }

  // Método para definir a situação
  setSituacao(situacao: string) {
    this.problema.situacao = situacao;
  }

  async tirarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });

      const fileName = `foto_os_${Date.now()}.jpeg`;

      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: image.base64String!,
        directory: Directory.Documents,
      });

      const nativePath = savedFile.uri; // file://...
      const webPath = Capacitor.convertFileSrc(savedFile.uri);

      await PhotoEditor.editPhoto({
        path: nativePath,
      });

      // 🔴 MUITO IMPORTANTE
      this.problema.fotoPath = nativePath; // para compartilhar
      this.problema.fotoUrl = webPath;     // para exibir

      console.log('Native:', nativePath);
      console.log('Web:', webPath);

    } catch (error) {
      console.error('Erro ao tirar/salvar foto:', error);
    }
  }


  // Retorna o ícone baseado na situação
  getStatusIcon(): string {
    const icons: { [key: string]: string } = {
      pendente: 'time-outline',
      em_andamento: 'build-outline',
      concluido: 'checkmark-circle-outline',
    };
    return icons[this.problema.situacao] || 'help-outline';
  }

  // Retorna o label baseado na situação
  getStatusLabel(): string {
    const labels: { [key: string]: string } = {
      pendente: 'Pendente',
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
    };
    return labels[this.problema.situacao] || '';
  }

  // Retorna a descrição baseada na situação
  getStatusDescription(): string {
    const descriptions: { [key: string]: string } = {
      pendente: 'Problema aguardando início da execução',
      em_andamento: 'Problema sendo resolvido no momento',
      concluido: 'Problema já foi resolvido',
    };
    return descriptions[this.problema.situacao] || '';
  }

  // Método para salvar e retornar o problema
  salvar() {
    if (this.problema.tipo && this.problema.situacao) {
      this.modalCtrl.dismiss(this.problema);
    } else {
      // Opcional: Adicionar um toast de erro
      console.log('Preencha os campos obrigatórios');
    }
  }
}
