import { Injectable } from '@angular/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Platform } from '@ionic/angular';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  constructor(private platform: Platform) { }

  /**
   * Gera PDF da Ordem de Serviço
   */
  async gerarPdfOS(ordem: any): Promise<void> {
    const doc = this.criarPDF(ordem);
    const nomeArquivo = `OS_${ordem.id}.pdf`;

    // Verifica se é mobile ou web
    if (this.platform.is('capacitor')) {
      // Mobile - Salva e compartilha
      await this.salvarPDFMobile(doc, nomeArquivo);
    } else {
      // Web - Download direto
      doc.save(nomeArquivo);
    }
  }

  /**
   * Cria o documento PDF
   */
  private criarPDF(ordem: any): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // ===== CABEÇALHO =====
    doc.setFillColor(63, 81, 181);
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDEM DE SERVIÇO', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(14);
    doc.text(`#${ordem.id}`, pageWidth / 2, 25, { align: 'center' });

    yPosition = 45;
    doc.setTextColor(0, 0, 0);

    // ===== STATUS =====
    const status = ordem.status === 'em_execucao' ? 'Em Execução' :
                   ordem.status === 'concluida' ? 'Concluída' : 'Pausada';
    const statusColor: [number, number, number] = ordem.status === 'concluida' ? [76, 175, 80] : [63, 81, 181];


    doc.setFillColor(...statusColor);
    doc.roundedRect(pageWidth - 50, yPosition - 5, 40, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(status, pageWidth - 30, yPosition, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    yPosition += 15;

    // ===== INFORMAÇÕES DA OS =====
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Informações da OS', 15, yPosition);
    yPosition += 8;

    console.log("ordem", ordem)

    const infos = [
      ['Modelo:', ordem.modelo.toString()],
      ['Frota:', ordem.frota.toString()],
      ['Hodômetro:', `${ordem.hodometro.toString()} km`],
      ['Local:', ordem.local.toString()],
      ['Tipo:', this.getTipoManutencao(ordem.tipoManutencao.toString())],
      ['Data Abertura:', this.formatarData(ordem.dataAbertura)]
    ];

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    infos.forEach(([label, value]) => {
      console.log("label", label)
      console.log("value", value)
      doc.setFont('helvetica', 'bold');
      doc.text(label, 15, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 55, yPosition);
      yPosition += 7;
    });

    yPosition += 5;

    // ===== PROGRESSO =====
    const problemasConcluidos = ordem.problemas.filter((p: any) => p.concluido).length;
    const totalProblemas = ordem.problemas.length;
    const progresso = totalProblemas > 0 ? (problemasConcluidos / totalProblemas * 100) : 0;

    doc.setFont('helvetica', 'bold');
    doc.text('Progresso:', 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(`${problemasConcluidos}/${totalProblemas} concluídos (${progresso.toFixed(0)}%)`, 55, yPosition);

    // Barra de progresso
    yPosition += 5;
    const barWidth = 100;
    const barHeight = 5;
    doc.setDrawColor(200, 200, 200);
    doc.rect(15, yPosition, barWidth, barHeight);
    doc.setFillColor(progresso === 100 ? 76 : 63, progresso === 100 ? 175 : 81, progresso === 100 ? 80 : 181);
    doc.rect(15, yPosition, (barWidth * progresso / 100), barHeight, 'F');

    yPosition += 15;

    // ===== PROBLEMAS =====
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Problemas da OS', 15, yPosition);
    yPosition += 5;

    if (ordem.problemas.length === 0) {
      yPosition += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(128, 128, 128);
      doc.text('Nenhum problema registrado', 15, yPosition);
    } else {
      const tableData = ordem.problemas.map((p: any, index: number) => {
        const situacao = p.situacao === 'em_andamento' ? 'Em Andamento' :
                        p.situacao === 'pendente' ? 'Pendente' : 'Concluído';

        return [
          (index + 1).toString(),
          p.tipo,
          situacao,
          p.observacao || '-',
          p.concluido && p.horaConclusao ? p.horaConclusao : '-'
        ];
      });

      autoTable(doc, {
        startY: yPosition,
        head: [['#', 'Tipo', 'Status', 'Observação', 'Conclusão']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [63, 81, 181],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 40 },
          2: { cellWidth: 30 },
          3: { cellWidth: 60 },
          4: { cellWidth: 35 }
        }
      });
    }

    // ===== RODAPÉ =====
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    return doc;
  }

  /**
   * Salva PDF no mobile e oferece compartilhamento
   */
  private async salvarPDFMobile(doc: jsPDF, nomeArquivo: string): Promise<void> {
    try {
      // Converte PDF para base64
      const pdfBase64 = doc.output('datauristring').split(',')[1];

      // Salva no diretório de documentos
      const result = await Filesystem.writeFile({
        path: nomeArquivo,
        data: pdfBase64,
        directory: Directory.Documents,
        recursive: true
      });

      console.log('PDF salvo:', result.uri);

      // Compartilha o PDF
      await Share.share({
        title: `Ordem de Serviço #${nomeArquivo.split('_')[1]}`,
        text: 'Histórico da Ordem de Serviço',
        url: result.uri,
        dialogTitle: 'Compartilhar PDF'
      });

    } catch (error) {
      console.error('Erro ao salvar PDF mobile:', error);
      throw error;
    }
  }

  /**
   * Formata data para exibição
   */
  private formatarData(data: any): string {
    console.log("data", data)
    if (!data) return '-';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Retorna label do tipo de manutenção
   */
  private getTipoManutencao(tipo: string): string {
    console.log("tipo", tipo)
    const tipos: any = {
      '1': 'Preventiva',
      '2': 'Corretiva',
    };
    return tipos[tipo] || tipo;
  }
}
