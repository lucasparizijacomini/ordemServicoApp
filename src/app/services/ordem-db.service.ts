import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase, DBSchema } from 'idb';
import { OrdemServico } from '../models/ordem.inteface';

interface OrdemDB extends DBSchema {
  ordens: {
    key: number;
    value: OrdemServico;
    indexes: { 'by-situacao': number; 'by-tipo': string };
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
    this.db = await openDB<OrdemDB>('ordemServicoDB', 1, {
      upgrade(db) {
        const store = db.createObjectStore('ordens', {
          keyPath: 'id',
          autoIncrement: true
        });

        // índices úteis
        store.createIndex('by-situacao', 'situacao');
        store.createIndex('by-tipo', 'tipoManutencao');
      }
    });
  }

  async countBySituacao(situacao: number): Promise<number> {
    await this.ready;
    const tx = this.db.transaction('ordens', 'readonly');
    const store = tx.objectStore('ordens');

    let count = 0;
    let cursor = await store.openCursor();

    while (cursor) {
      if (cursor.value.situacao === situacao) count++;
      cursor = await cursor.continue();
    }

    return count;
  }


  // Add retorna o id gerado
  async add(ordem: OrdemServico): Promise<number> {
    await this.ready;
    return this.db.add('ordens', ordem);
  }

  async update(ordem: OrdemServico) {
    await this.ready;
    return this.db.put('ordens', ordem);
  }

  async getAll() {
    return this.db.getAll('ordens');
  }

  async get(id: number) {
    await this.ready;
    return this.db.get('ordens', id);
  }

  async getEmAndamento() {
    return this.db.getAllFromIndex('ordens', 'by-situacao', 1);
  }

  async getFinalizadas() {
    return this.db.getAllFromIndex('ordens', 'by-situacao', 2);
  }

  async delete(id: number) {
    await this.ready;
    return this.db.delete('ordens', id);
  }

  // busca por situação usando índice
  async getBySituacao(situacao: number): Promise<OrdemServico[]> {
    await this.ready;
    return this.db.getAllFromIndex('ordens', 'by-situacao', situacao);
  }

  // Contagem de ordens com filtros (usado para mostrar total)
  async countFiltered(options?: { situacao?: number; tipo?: string; search?: string }): Promise<number> {
    await this.ready;
    const all = await this.db.getAll('ordens');
    return this.filterArray(all, options).length;
  }

  // Paginação simples: skip/limit depois de filtrar (suficiente para app local)
  async getPaged(options: {
    skip: number;
    limit: number;
    situacao?: number;
    tipo?: string; // '1' or '2' or undefined
    search?: string;
  }): Promise<OrdemServico[]> {
    await this.ready;
    const all = await this.db.getAll('ordens');
    const filtered = this.filterArray(all, {
      situacao: options.situacao,
      tipo: options.tipo,
      search: options.search
    });

    return filtered.slice(options.skip, options.skip + options.limit);
  }

  private filterArray(all: OrdemServico[], opts?: { situacao?: number; tipo?: string; search?: string }) {
    let arr = all;

    if (opts?.situacao !== undefined) {
      arr = arr.filter(a => a.situacao === opts.situacao);
    }

    if (opts?.tipo) {
      arr = arr.filter(a => a.tipoManutencao === opts.tipo);
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
