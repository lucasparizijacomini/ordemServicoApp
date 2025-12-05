import { OrdemDbService } from './../../services/ordem-db.service';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonButton,
  IonProgressBar,
  IonBadge,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { buildOutline, carSportOutline, checkboxOutline, checkmarkCircle, checkmarkCircleOutline, checkmarkDoneOutline, clipboardOutline, constructOutline, createOutline, documentTextOutline, informationCircleOutline, listOutline, locationOutline, pricetagOutline, speedometerOutline, swapHorizontalOutline, timeOutline } from 'ionicons/icons';
import { OrdemServico, Problemas } from 'src/app/models/ordem.inteface';

@Component({
  selector: 'app-ordens-execucao',
  templateUrl: './ordens-execucao.component.html',
  styleUrls: ['./ordens-execucao.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonProgressBar,
    IonBackButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonBadge,
    IonButton,
  ]
})
export class OrdensExecucaoComponent implements OnInit {

  ordem: OrdemServico = new OrdemServico();
  osId: number = 0;

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute)
  private alertCtrl = inject(AlertController)
  private toastCtrl = inject(ToastController)
  private ordemDbService = inject(OrdemDbService)

  constructor() {
    this.osId = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    addIcons({
      'build-outline': buildOutline,
      'checkmark-done-outline': checkmarkDoneOutline,
      'document-text-outline': documentTextOutline,
      'create-outline': createOutline,
      'swap-horizontal-outline': swapHorizontalOutline,
      'checkbox-outline': checkboxOutline,
      'list-outline': listOutline,
      'time-outline': timeOutline,
      'information-circle-outline': informationCircleOutline,
      'car-sport-outline': carSportOutline,
      'pricetag-outline': pricetagOutline,
      'speedometer-outline': speedometerOutline,
      'location-outline': locationOutline,
      'construct-outline': constructOutline,
      'clipboard-outline': clipboardOutline,
      'checkmark-circle': checkmarkCircle,
      'checkmark-circle-outline': checkmarkCircleOutline
    });
  }

  ngOnInit() {
    if (this.osId) {
      this.carregarOS(this.osId);
    }
  }

  async carregarOS(id: number) {
    // Simula carregamento do backend
    this.ordem = await this.ordemDbService.getById(id)

    if (!this.ordem) {
      console.error("Ordem não encontrada");
      return;
    }

    this.ordem.status = 'em_execucao';
    this.ordem.dataInicio = new Date().toLocaleTimeString('pt-BR');
    this.ordemDbService.update(this.ordem)
    console.log('Carregando OS:', id);
  }

  // Mudar status com botão
  async alterarStatusProblema(problema: Problemas) {
    const alert = await this.alertCtrl.create({
      header: 'Alterar Status',
      subHeader: problema.tipo,
      inputs: [
        {
          type: 'radio',
          label: 'Pendente',
          value: 'pendente',
          checked: problema.situacao === 'pendente'
        },
        {
          type: 'radio',
          label: 'Em Andamento',
          value: 'em_andamento',
          checked: problema.situacao === 'em_andamento'
        },
        {
          type: 'radio',
          label: 'Concluído',
          value: 'concluido',
          checked: problema.situacao === 'concluido'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: (data) => {
            problema.situacao = data;
            problema.concluido = data === 'concluido';
            if (problema.concluido) {
              problema.horaConclusao = new Date().toLocaleTimeString('pt-BR');
            }
            this.ordemDbService.atualizarProblema(this.osId, problema.id, problema)
            this.verificarConclusaoTotal();
          }
        }
      ]
    });

    await alert.present();
  }

  get podeFinalizar(): boolean {
    return this.ordem.status === 'concluida' ||
          !this.ordem.problemas.every(el => el.situacao === 'concluido');
  }


  // Adicionar observação ao problema
  async adicionarObservacao(problema: Problemas) {
    const alert = await this.alertCtrl.create({
      header: 'Adicionar Observação',
      subHeader: problema.tipo,
      inputs: [
        {
          name: 'observacao',
          type: 'textarea',
          placeholder: 'Digite a observação...',
          value: problema.observacao
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Salvar',
          handler: (data) => {
            problema.observacao = data.observacao;
            this.mostrarToast('Observação salva!', 'success');
          }
        }
      ]
    });

    await alert.present();
  }

  // Verifica se todos problemas foram concluídos
  verificarConclusaoTotal() {
    const todosResolvidos = this.ordem.problemas.every(p => p.concluido);

    if (todosResolvidos && this.ordem.status === 'em_execucao') {
      this.mostrarAlertaConclusao();
    }
  }

  async mostrarAlertaConclusao() {
    const alert = await this.alertCtrl.create({
      header: 'Todos os problemas resolvidos!',
      message: 'Deseja finalizar esta ordem de serviço?',
      buttons: [
        {
          text: 'Não',
          role: 'cancel'
        },
        {
          text: 'Sim, Finalizar',
          handler: () => {
            this.finalizarOS();
          }
        }
      ]
    });

    await alert.present();
  }

  async finalizarOS() {

    this.ordem.dataConclusao = new Date().toISOString();
    this.ordem.status = 'concluida';
    await this.ordemDbService.update(this.ordem);
    this.mostrarToast('Ordem de serviço finalizada com sucesso!', 'success');
    this.router.navigate(['/ordens'])

  }

  async mostrarToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  // Getters para UI
  get progresso(): number {
    if(this.ordem && this.ordem.problemas){
      if (this.ordem.problemas.length === 0) return 0;
      const concluidos = this.ordem.problemas.filter(p => p.concluido).length;
      return concluidos / this.ordem.problemas.length;
    }else{
      return 0;
    }
  }

  get problemasConcluidos(): number {
    if(this.ordem && this.ordem.problemas){
      return this.ordem.problemas.filter(p => p.concluido).length;
    }else{
      return 0;
    }
  }

  get totalProblemas(): number {
    if(this.ordem && this.ordem.problemas){
      return this.ordem.problemas.length;
    }else{
      return 0;
    }
  }

  getStatusIcon(situacao: string): string {
    const icons: { [key: string]: string } = {
      'pendente': 'time-outline',
      'em_andamento': 'build-outline',
      'concluido': 'checkmark-circle-outline'
    };
    return icons[situacao] || 'help-outline';
  }

  getStatusColor(situacao: string): string {
    const colors: { [key: string]: string } = {
      'pendente': 'warning',
      'em_andamento': 'primary',
      'concluido': 'success'
    };
    return colors[situacao] || 'medium';
  }

  getTipoManutencaoLabel(): string {
    return this.ordem.tipoManutencao === '1' ? 'Corretiva' : 'Preventiva';
  }
}
