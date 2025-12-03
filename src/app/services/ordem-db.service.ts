import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase, DBSchema } from 'idb';
import { IOrdemServico, OrdemServico } from '../models/ordem.inteface';

interface OrdemDB extends DBSchema {
  ordens: {
    key: number;
    value: IOrdemServico;
    indexes: { 'by-situacao': number; 'by-tipo': string; 'by-status': string };
  };
}

@Injectable({ providedIn: 'root' })
export class OrdemDbService {
  private db!: IDBPDatabase<OrdemDB>;
  private ready: Promise<void>;

  constructor() {
    this.ready = this.initDB();
  }

  private async initDB() {
    this.db = await openDB<OrdemDB>('ordemServicoDB', 2, {
      upgrade(db, oldVersion) {
        // Se já existe a store, não recria
        let store;
        if (!db.objectStoreNames.contains('ordens')) {
          store = db.createObjectStore('ordens', {
            keyPath: 'id',
            autoIncrement: true
          });
        } else {
          // Pega referência da store existente no upgrade
          // (via transaction)
        }

        // Cria os índices se ainda não existem
        if (oldVersion < 1) {
          if (!store) {
            // se não criou agora, já existia - mas ainda não tem os índices
            // Nota: no upgrade, você pode acessar a store via transaction
          }
          store?.createIndex('by-situacao', 'situacao');
          store?.createIndex('by-tipo', 'tipoManutencao');
        }

        // Novo índice para status de execução (v2)
        if (oldVersion < 2 && store) {
          if (!store.indexNames.contains('by-status')) {
            store.createIndex('by-status', 'status');
          }
        }
      }
    });
  }

  // ==================== CRUD BÁSICO ====================

  async add(ordem: IOrdemServico): Promise<number> {
    await this.ready;
    return this.db.add('ordens', ordem);
  }

  async update(ordem: IOrdemServico) {
    await this.ready;
    return this.db.put('ordens', ordem);
  }

  async getAll() {
    await this.ready;
    return this.db.getAll('ordens');
  }

  async getById(id: number): Promise<any> {
    await this.ready;
    return this.db.get('ordens', id)
  }

  async delete(id: number) {
    await this.ready;
    return this.db.delete('ordens', id);
  }

  // ==================== QUERIES POR STATUS ====================

  async getEmAndamento() {
    await this.ready;
    return this.db.getAllFromIndex('ordens', 'by-situacao', 1);
  }

  async getFinalizadas() {
    await this.ready;
    return this.db.getAllFromIndex('ordens', 'by-situacao', 2);
  }

  async getBySituacao(situacao: number): Promise<IOrdemServico[]> {
    await this.ready;
    return this.db.getAllFromIndex('ordens', 'by-situacao', situacao);
  }

  // ==================== EXECUÇÃO DE OS ====================

  /**
   * Retorna OSs que estão em execução (status: 'em_execucao')
   */
  async getOSEmExecucao(): Promise<IOrdemServico[]> {
    await this.ready;
    const all = await this.db.getAll('ordens');
    return all.filter(os => os.status === 'em_execucao');
  }

  /**
   * Retorna OSs concluídas (status: 'concluida')
   */
  async getOSConcluidas(): Promise<IOrdemServico[]> {
    await this.ready;
    const all = await this.db.getAll('ordens');
    return all.filter(os => os.status === 'concluida');
  }

  /**
   * Inicia a execução de uma OS
   */
  async iniciarExecucao(id: number): Promise<void> {
    await this.ready;
    const ordem = await this.getById(id);
    if (ordem) {
      ordem.status = 'em_execucao';
      ordem.dataInicio = new Date().toISOString();
      await this.update(ordem);
    }
  }

  /**
   * Finaliza uma OS
   */
  async finalizarOS(id: number): Promise<void> {
    await this.ready;
    const ordem = await this.getById(id);
    if (ordem) {
      ordem.status = 'concluida';
      ordem.dataConclusao = new Date().toISOString();
      await this.update(ordem);
    }
  }

  /**
   * Atualiza um problema específico dentro de uma OS
   */
  async atualizarProblema(osId: number, problemaId: number, dados: Partial<any>): Promise<void> {
    await this.ready;
    const ordem = await this.getById(osId);

    if (ordem && ordem.problemas) {
      const index = ordem.problemas.findIndex((p: any) => p.id === problemaId);
      if (index !== -1) {
        ordem.problemas[index] = { ...ordem.problemas[index], ...dados };
        await this.update(ordem);
      }
    }
  }

  /**
   * Marca um problema como concluído
   */
  async concluirProblema(osId: number, problemaId: number): Promise<void> {
    await this.ready;
    const ordem = await this.getById(osId);

    if (ordem && ordem.problemas) {
      const problema = ordem.problemas.find((p: any) => p.id === problemaId);
      if (problema) {
        problema.concluido = true;
        problema.situacao = 'concluido';
        problema.horaConclusao = new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });
        await this.update(ordem);
      }
    }
  }

  /**
   * Reabre um problema (desmarca como concluído)
   */
  async reabrirProblema(osId: number, problemaId: number): Promise<void> {
    await this.ready;
    const ordem = await this.getById(osId);

    if (ordem && ordem.problemas) {
      const problema = ordem.problemas.find((p: any) => p.id === problemaId);
      if (problema) {
        problema.concluido = false;
        problema.situacao = 'em_andamento';
        problema.horaConclusao = undefined;
        await this.update(ordem);
      }
    }
  }

  /**
   * Verifica se todos os problemas foram concluídos
   */
  async todosProblemasResolvidos(osId: number): Promise<boolean> {
    await this.ready;
    const ordem = await this.getById(osId);

    if (!ordem || !ordem.problemas || ordem.problemas.length === 0) {
      return false;
    }

    return ordem.problemas.every((p: any) => p.concluido === true);
  }

  /**
   * Retorna o progresso de uma OS (% de problemas concluídos)
   */
  async getProgressoOS(osId: number): Promise<number> {
    await this.ready;
    const ordem = await this.getById(osId);

    if (!ordem || !ordem.problemas || ordem.problemas.length === 0) {
      return 0;
    }

    const concluidos = ordem.problemas.filter((p: any)=> p.concluido).length;
    return (concluidos / ordem.problemas.length) * 100;
  }

  // ==================== CONTAGENS E ESTATÍSTICAS ====================

  async countByStatus(status: string): Promise<number> {
    await this.ready;
    const all = await this.db.getAll('ordens');
    return all.filter(os => os.status === status).length;
  }

  /**
   * Estatísticas gerais do sistema
   */
  async getEstatisticas(): Promise<{
    total: number;
    emExecucao: number;
    concluidas: number;
    pausadas: number;
  }> {
    await this.ready;
    const all = await this.db.getAll('ordens');

    return {
      total: all.length,
      emExecucao: all.filter(os => os.status === 'em_execucao').length,
      concluidas: all.filter(os => os.status === 'concluida').length,
      pausadas: all.filter(os => os.status === 'pausada').length,
    };
  }

  // ==================== PAGINAÇÃO E FILTROS ====================

  async countFiltered(options?: {
    situacao?: number;
    tipo?: string;
    search?: string;
    status?: string;
  }): Promise<number> {
    await this.ready;
    const all = await this.db.getAll('ordens');
    return this.filterArray(all, options).length;
  }

  async getPaged(options: {
    skip: number;
    limit: number;
    situacao?: number;
    tipo?: string;
    search?: string;
    status?: string;
  }): Promise<IOrdemServico[]> {
    await this.ready;
    const all = await this.db.getAll('ordens');
    const filtered = this.filterArray(all, {
      situacao: options.situacao,
      tipo: options.tipo,
      search: options.search,
      status: options.status
    });

    return filtered.slice(options.skip, options.skip + options.limit);
  }

  private filterArray(
    all: IOrdemServico[],
    opts?: {
      situacao?: number;
      tipo?: string;
      search?: string;
      status?: string;
    }
  ) {
    let arr = all;

    if (opts?.tipo) {
      arr = arr.filter(a => a.tipoManutencao === opts.tipo);
    }

    if (opts?.status) {
      arr = arr.filter(a => a.status === opts.status);
    }

    if (opts?.search && opts.search.trim() !== '') {
      const term = opts.search.toLowerCase();
      arr = arr.filter(o =>
        (o.modelo || '').toLowerCase().includes(term) ||
        (o.frota || '').toLowerCase().includes(term) ||
        (o.local || '').toLowerCase().includes(term) ||
        (o.operador || '').toLowerCase().includes(term)
      );
    }

    // ordenar por id decrescente (últimas primeiro)
    arr.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    return arr;
  }
}
