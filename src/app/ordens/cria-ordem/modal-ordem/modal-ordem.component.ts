import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { ModalController, ActionSheetController } from '@ionic/angular/standalone';

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
  IonToggle,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  buildOutline,
  cameraOutline,
  close,
  flagOutline,
  imageOutline,
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
    IonToggle,
  ],
})
export class ModalOrdemComponent implements OnInit {
  problema: Problemas = {
    id: 0,
    tipo: '',
    situacao: 'pendente',
    observacao: [],
    pecas: [],
    fotoUrl: '',
  };

  habilitarEdicao: boolean = true;

  constructor(
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController
  ) {
    addIcons({
      'flag-outline': flagOutline,
      'time-outline': timeOutline,
      'build-outline': buildOutline,
      close: close,
      'camera-outline': cameraOutline,
      'image-outline': imageOutline,
      'save-outline': saveOutline,
    });
  }

  ngOnInit() {
    // Carregar preferência salva
    const saved = localStorage.getItem('habilitarEdicaoFoto');
    this.habilitarEdicao = saved !== null ? saved === 'true' : true;
  }

  toggleEdicao() {
    localStorage.setItem('habilitarEdicaoFoto', String(this.habilitarEdicao));
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
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Selecionar Foto',
      buttons: [
        {
          text: 'Câmera',
          icon: 'camera-outline',
          handler: () => {
            this.capturePhoto(CameraSource.Camera);
          }
        },
        {
          text: 'Galeria',
          icon: 'image-outline',
          handler: () => {
            this.capturePhoto(CameraSource.Photos);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async capturePhoto(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: source,
      });

      const fileName = `foto_os_${Date.now()}.jpeg`;

      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: image.base64String!,
        directory: Directory.Documents,
      });

      const nativePath = savedFile.uri; // file://...
      const webPath = Capacitor.convertFileSrc(savedFile.uri);

      // 🔴 MUITO IMPORTANTE: Se não for web E o editor estiver habilitado
      if (Capacitor.getPlatform() !== 'web' && this.habilitarEdicao) {
        try {
          await PhotoEditor.editPhoto({
             path: nativePath
          });
          
          console.log('Editor concluído para:', nativePath);
          
          this.problema.fotoPath = nativePath;
          // Adicionamos um timestamp para forçar o recarregamento da imagem
          this.problema.fotoUrl = `${Capacitor.convertFileSrc(nativePath)}?t=${Date.now()}`;
        } catch (editorError) {
          console.warn('Editor cancelado ou erro:', editorError);
          this.problema.fotoPath = nativePath;
          this.problema.fotoUrl = webPath;
        }
      } else {
        // Web: Mantém a original
        this.problema.fotoPath = nativePath;
        this.problema.fotoUrl = webPath;
      }

      console.log('Final Native Path:', this.problema.fotoPath);
      console.log('Final Web Path:', this.problema.fotoUrl);

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
