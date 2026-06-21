import { OrdemDbService } from './../../services/ordem-db.service';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { ToastController, ModalController } from '@ionic/angular';

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
  AlertController,
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  buildOutline,
  carSportOutline,
  chatboxEllipsesOutline,
  checkboxOutline,
  checkmarkCircle,
  checkmarkCircleOutline,
  checkmarkDoneOutline,
  clipboardOutline,
  constructOutline,
  createOutline,
  documentTextOutline,
  informationCircleOutline,
  listOutline,
  locationOutline,
  pricetagOutline,
  speedometerOutline,
  swapHorizontalOutline,
  timeOutline,
  trashOutline,
  arrowUndoOutline,
  cube
} from 'ionicons/icons';
import {
  IPeca,
  ModalPecasComponent,
} from 'src/app/components/modal-pecas/modal-pecas.component';
import {
  IObservacoes,
  OrdemServico,
  Problemas,
} from 'src/app/models/ordem.inteface';
import { ModalOrdemComponent } from 'src/app/ordens/cria-ordem/modal-ordem/modal-ordem.component';
import { PdfGeneratorService } from 'src/app/services/pdf.service';

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
    IonSegment,
    IonSegmentButton,
    IonLabel,
  ],
  providers: [ModalController],
})
export class OrdensExecucaoComponent implements OnInit {
  ordem: OrdemServico = new OrdemServico();
  osId: number = 0;
  tipo: string = '';
  pecas: IPeca[] = [];
  filtroTipo: string = 'pendente';

  ordemFiltrada: OrdemServico = new OrdemServico();

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private alertCtrl = inject(AlertController);
  private toastController = inject(ToastController);
  private ordemDbService = inject(OrdemDbService);
  private pdfGenerator = inject(PdfGeneratorService);
  private modalCtrl = inject(ModalController);

  constructor() {
    this.osId = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    this.tipo = this.activatedRoute.snapshot.paramMap.get('type') ?? '';
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
      'checkmark-circle-outline': checkmarkCircleOutline,
      'add-circle-outline': addCircleOutline,
      'trash-outline': trashOutline,
      'chatbox-ellipses-outline': chatboxEllipsesOutline,
      'arrow-undo-outline': arrowUndoOutline,
      'cube': cube
    });
  }

  get disabledButtons(): boolean {
    if (this.tipo === 'false') {
      return false;
    }

    return true;
  }

  ngOnInit() {
    if (this.osId) {
      this.carregarOS(this.osId);
    }
  }

  async solicitar(problema: Problemas) {
    if (!problema.fotoPath) {
      await this.mostrarToast('Foto não encontrada!', 'danger');
      return;
    }

    try {
      await Share.share({
        title: 'Foto do problema',
        text: '',
        files: [problema.fotoPath],
        dialogTitle: 'Compartilhar via',
      });
    } catch (error) {
      console.error(error);
      await this.mostrarToast('Erro ao compartilhar', 'danger');
    }
  }

  async abrirModalPecas(problema: Problemas) {
    if (!problema.pecas) {
      problema.pecas = [];
    }

    const modal = await this.modalCtrl.create({
      component: ModalPecasComponent,
      componentProps: {
        pecas: problema.pecas,
      },
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        problema.pecas = result.data; // Atualiza lista após salvar
        this.ordemDbService.atualizarProblema(this.osId, problema.id, problema);
      }
    });

    await modal.present();
  }

  async togglePecaDisponivel(ev: Event, problema: Problemas) {
    ev?.stopPropagation();
    problema.pecaDisponivel = await this.ordemDbService.togglePecaDisponivel(this.osId, problema.id);
  }

  onFiltroSituacao(newTipo: any) {
    this.filtroTipo = newTipo;
    if (this.ordem && this.ordem.problemas) {
      this.ordemFiltrada.problemas = this.ordem.problemas.filter(
        (problema) => problema.situacao === this.filtroTipo
      );
    }
  }

  async carregarOS(id: number) {
    // Simula carregamento do backend
    this.ordem = await this.ordemDbService.getById(id);

    if (!this.ordem) {
      console.error('Ordem não encontrada');
      return;
    }

    // Verifica se veio um problemId via query string
    const problemId = Number(this.activatedRoute.snapshot.queryParamMap.get('problemId'));
    if (problemId) {
      const problema = this.ordem.problemas.find(p => p.id === problemId);
      if (problema) {
        // Ajusta o filtro para a situação do problema clicado
        this.filtroTipo = problema.situacao;
      }
    }

    this.ordemFiltrada.problemas = this.ordem.problemas.filter(
      (problema) => problema.situacao === this.filtroTipo,
    );

    if (this.tipo === 'false') {
      this.ordem.status = 'em_execucao';
      this.ordem.dataInicio = new Date().toLocaleTimeString('pt-BR');
      this.ordemDbService.update(this.ordem);
    }

    console.log('Carregando OS:', id);

    // Se tiver problemId, rola para ele após o render
    if (problemId) {
      setTimeout(() => {
        const el = document.getElementById(`problem-${problemId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Destaque visual temporário
          el.style.transition = 'background-color 0.5s';
          const originalBg = el.style.backgroundColor;
          el.style.backgroundColor = 'rgba(var(--ion-color-primary-rgb), 0.1)';
          setTimeout(() => {
            el.style.backgroundColor = originalBg;
          }, 2000);
        }
      }, 300);
    }
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
          checked: problema.situacao === 'pendente',
        },
        {
          type: 'radio',
          label: 'Em Andamento',
          value: 'em_andamento',
          checked: problema.situacao === 'em_andamento',
        },
        {
          type: 'radio',
          label: 'Concluído',
          value: 'concluido',
          checked: problema.situacao === 'concluido',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: async (data) => {
            problema.situacao = data;
            problema.concluido = data === 'concluido';

            if (problema.concluido) {
              problema.horaConclusao = new Date().toLocaleTimeString('pt-BR');
            }
            await this.ordemDbService.atualizarProblema(
              this.osId,
              problema.id,
              problema,
            );

            //this.ordem = await this.ordemDbService.getById(this.osId);
            this.verificarConclusaoTotal();
            this.onFiltroSituacao(this.filtroTipo);
          },
        },
      ],
    });

    await alert.present();
  }

  get podeFinalizar(): boolean {
    return (
      this.ordem.status === 'concluida' ||
      !this.ordem.problemas.every((el) => el.situacao === 'concluido')
    );
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
      await this.ordemDbService.update(this.ordem);
      this.ordem = await this.ordemDbService.getById(this.osId);
      this.onFiltroSituacao(this.filtroTipo);
    }
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
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Salvar',
          handler: async (data) => {
            // Impede salvar observação vazia
            if (!data.observacao || data.observacao.trim().length === 0) {
              this.mostrarToast('Digite uma observação.', 'warning');
              return false;
            }

            // Cria objeto de observação
            const novaObs: IObservacoes = {
              id: problema.observacao.length + 1,
              descricaoObservacao: data.observacao.trim(),
            };

            if (!problema.observacao) {
              problema.observacao = [];
            }

            // Adiciona no array
            problema.observacao.push(novaObs);

            // Salva no banco
            await this.ordemDbService.atualizarProblema(
              this.osId,
              problema.id,
              problema,
            );

            this.mostrarToast('Observação salva!', 'success');
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  async editarObservacao(problema: Problemas, observacao: IObservacoes) {
    const alert = await this.alertCtrl.create({
      header: 'Editar Observação',
      inputs: [
        {
          name: 'observacao',
          type: 'textarea',
          value: observacao.descricaoObservacao,
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salvar',
          handler: async (data: any) => {
            observacao.descricaoObservacao = data.observacao;

            await this.ordemDbService.atualizarProblema(
              this.osId,
              problema.id,
              problema,
            );

            this.mostrarToast('Observação atualizada!', 'success');
          },
        },
      ],
    });

    await alert.present();
  }

  async removerObservacao(problema: Problemas, observacao: IObservacoes) {
    const alert = await this.alertCtrl.create({
      header: 'Excluir Observação?',
      message: 'Deseja realmente remover esta observação?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: async () => {
            problema.observacao = problema.observacao.filter(
              (o) => o.id !== observacao.id,
            );

            await this.ordemDbService.atualizarProblema(
              this.osId,
              problema.id,
              problema,
            );

            this.mostrarToast('Observação removida.', 'danger');
          },
        },
      ],
    });

    await alert.present();
  }

  // Verifica se todos problemas foram concluídos
  verificarConclusaoTotal() {
    const todosResolvidos = this.ordem.problemas.every((p) => p.concluido);

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
          role: 'cancel',
        },
        {
          text: 'Sim, Finalizar',
          handler: () => {
            this.finalizarOS();
          },
        },
      ],
    });

    await alert.present();
  }

  async finalizarOS() {
    this.ordem.dataConclusao = new Date().toISOString();
    this.ordem.status = 'concluida';
    await this.ordemDbService.update(this.ordem);
    this.mostrarToast('Ordem de serviço finalizada com sucesso!', 'success');
    this.router.navigate(['/ordens']);
  }

  async mostrarToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top',
    });
    await toast.present();
  }

  // Getters para UI
  get progresso(): number {
    if (this.ordem && this.ordem.problemas) {
      if (this.ordem.problemas.length === 0) return 0;
      const concluidos = this.ordem.problemas.filter((p) => p.concluido).length;
      return concluidos / this.ordem.problemas.length;
    } else {
      return 0;
    }
  }

  get problemasConcluidos(): number {
    if (this.ordem && this.ordem.problemas) {
      return this.ordem.problemas.filter((p) => p.concluido).length;
    } else {
      return 0;
    }
  }

  get totalProblemas(): number {
    if (this.ordem && this.ordem.problemas) {
      return this.ordem.problemas.length;
    } else {
      return 0;
    }
  }

  getStatusIcon(situacao: string): string {
    const icons: { [key: string]: string } = {
      pendente: 'time-outline',
      em_andamento: 'build-outline',
      concluido: 'checkmark-circle-outline',
    };
    return icons[situacao] || 'help-outline';
  }

  getStatusColor(situacao: string): string {
    const colors: { [key: string]: string } = {
      pendente: 'warning',
      em_andamento: 'primary',
      concluido: 'success',
    };
    return colors[situacao] || 'medium';
  }

  getTipoManutencaoLabel(): string {
    return this.ordem.tipoManutencao === '1' ? 'Corretiva' : 'Preventiva';
  }

  async gerarPDF() {
    try {
      await this.pdfGenerator.gerarPdfOS(this.ordem);
      await this.mostrarToast('PDF gerado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      await this.mostrarToast('Erro ao gerar PDF. Tente novamente.', 'danger');
    }
  }

  /**
   * Compartilha o PDF
   */
  async compartilharPDF() {
    // Você pode implementar compartilhamento via Capacitor Share API
    // ou gerar e baixar o PDF
    await this.gerarPDF();
  }
}
