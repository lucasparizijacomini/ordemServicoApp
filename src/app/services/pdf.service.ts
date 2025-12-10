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
    // agora criamos o PDF assincronamente
    const doc = await this.criarPDF(ordem);
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
   * note: agora é async para suportar carregamento de imagens
   */
  private async criarPDF(ordem: any): Promise<jsPDF> {
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

    const infos = [
      ['Modelo:', ordem.modelo?.toString() ?? '-'],
      ['Frota:', ordem.frota?.toString() ?? '-'],
      ['Hodômetro:', `${ordem.hodometro?.toString() ?? '-'} km`],
      ['Local:', ordem.local?.toString() ?? '-'],
      ['Tipo:', this.getTipoManutencao(String(ordem.tipoManutencao ?? ''))],
      ['Data Abertura:', this.formatarData(ordem.dataAbertura)]
    ];

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    infos.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(String(label), 15, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), 55, yPosition);
      yPosition += 7;
    });

    yPosition += 5;

    // ===== PROGRESSO =====
    const problemasConcluidos = ordem.problemas?.filter((p: any) => p.concluido).length ?? 0;
    const totalProblemas = ordem.problemas?.length ?? 0;
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
    yPosition += 8;

    if (!ordem.problemas || ordem.problemas.length === 0) {
      yPosition += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(128, 128, 128);
      doc.text('Nenhum problema registrado', 15, yPosition);
      yPosition += 10;
    } else {
      // Em vez de usar autoTable para problemas, desenhamos cada problema e, em seguida, sua(s) imagem(ns)
      doc.setFontSize(12);
      doc.setTextColor(0,0,0);

      for (let i = 0; i < ordem.problemas.length; i++) {
        const p = ordem.problemas[i];

        // Quebra de página preventiva
        const pageHeight = doc.internal.pageSize.getHeight();
        if (yPosition > pageHeight - 120) {
          doc.addPage();
          yPosition = 20;
        }

        // Cabeçalho do problema
        doc.setFont('helvetica', 'bold');
        doc.text(`${i + 1}. ${p.tipo || 'Problema'}`, 15, yPosition);
        yPosition += 7;

        // Situação / Observação / Hora conclusão
        doc.setFont('helvetica', 'normal');
        const situacao = p.situacao === 'em_andamento' ? 'Em Andamento' :
                        p.situacao === 'pendente' ? 'Pendente' : 'Concluído';
        doc.text(`Situação: ${situacao}`, 20, yPosition);
        yPosition += 7;

        if (p.observacao) {
          // texto longo quebrado em linhas
          const obsLines = doc.splitTextToSize(`Observação: ${p.observacao}`, pageWidth - 40);
          doc.text(obsLines, 20, yPosition);
          yPosition += obsLines.length * 7;
        }

        const hora = (p.concluido && p.horaConclusao) ? p.horaConclusao : '-';
        doc.text(`Conclusão: ${hora}`, 20, yPosition);
        yPosition += 8;

        // Se existir foto(s) no problema, carregar e inserir aqui
        // suportamos um único campo p.fotoUrl (string) ou p.fotos (array)
        const fotos: string[] = [];
        if (p.fotoUrl) fotos.push(p.fotoUrl);
        if (Array.isArray(p.fotos)) fotos.push(...p.fotos);

        for (const fotoUrl of fotos) {
          if (!fotoUrl) continue;

          // tenta carregar base64 (se falhar, pula)
          let imgBase64: string | null = null;
          try {
            imgBase64 = await this.carregarImagemBase64(fotoUrl);
          } catch (e) {
            console.warn('Não foi possível carregar imagem:', fotoUrl, e);
            imgBase64 = null;
          }

          if (!imgBase64) continue;

          // calcula dimensões mantendo proporção
          // vamos usar máxima largura com margem e máximo de altura razoável
          const maxWidth = pageWidth - 30; // margem 15px cada lado
          const maxHeight = 160;

          // cria img temporária para pegar dimensões reais
          const img = new Image();
          img.src = imgBase64;
          await new Promise<void>((res) => {
            img.onload = () => res();
            img.onerror = () => res();
          });

          let imgW = img.width || maxWidth;
          let imgH = img.height || maxHeight;
          const ratio = imgW / imgH;

          if (imgW > maxWidth) {
            imgW = maxWidth;
            imgH = imgW / ratio;
          }
          if (imgH > maxHeight) {
            imgH = maxHeight;
            imgW = imgH * ratio;
          }

          // quebra de página se não couber
          const pageHeightNow = doc.internal.pageSize.getHeight();
          if (yPosition + imgH > pageHeightNow - 30) {
            doc.addPage();
            yPosition = 20;
          }

          // inserir imagem
          try {
            doc.addImage(imgBase64, 'JPEG', 15, yPosition, imgW, imgH, undefined, 'FAST');
            yPosition += imgH + 10;
          } catch (e) {
            console.warn('Erro ao inserir imagem no PDF:', e);
          }
        } // end fotos loop

        // espaço entre problemas
        yPosition += 6;
      } // end problemas loop
    }

    // ===== RODAPÉ =====
    const pageHeightFinal = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
      pageWidth / 2,
      pageHeightFinal - 10,
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
   * Converte uma URL de imagem em base64 (funciona em web; em mobile se usar file:// ou content:// pode ser necessário adaptar)
   */
  private async carregarImagemBase64(url: string): Promise<string | null> {
    try {
      // suporte básico para caminhos locais do capacitor/file system
      if (url.startsWith('file://') || url.startsWith('content://') || url.startsWith('capacitor://')) {
        // tenta ler diretamente (pode precisar ajustar dependendo de como você guarda as imagens)
        const read = await Filesystem.readFile({ path: url }).catch(() => null);
        if (read && (read as any).data) {
          return `data:image/jpeg;base64,${(read as any).data}`;
        }
        // fallback: tenta fetch normalmente
      }

      // tenta fetch normalmente (funciona para URLs públicas HTTPS)
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();

      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error('Erro ao carregar imagem:', e);
      return null;
    }
  }

  /**
   * Formata data para exibição
   */
  private formatarData(data: any): string {
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
    const tipos: any = {
      '1': 'Preventiva',
      '2': 'Corretiva',
    };
    return tipos[tipo] || tipo;
  }
}
