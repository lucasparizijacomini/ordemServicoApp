import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase, DBSchema } from 'idb';
import { OrdemServico } from '../models/ordem.inteface';

interface OrdemDB extends DBSchema {
  ordens: {
    key: number;
    value: OrdemServico;
    indexes: { 'by-situacao': number };
  };
}

@Injectable({ providedIn: 'root' })
export class OrdemDbService {
  private db!: IDBPDatabase<OrdemDB>;

  constructor() {
    this.initDB();
  }

  private async initDB() {
    this.db = await openDB<OrdemDB>('ordemServicoDB', 1, {
      upgrade(db) {
        const store = db.createObjectStore('ordens', {
          keyPath: 'id',
          autoIncrement: true
        });

        store.createIndex('by-situacao', 'situacao');
      }
    });
  }

  async add(ordem: OrdemServico) {
    return this.db.add('ordens', ordem);
  }

  async update(ordem: OrdemServico) {
    return this.db.put('ordens', ordem);
  }

  async getAll() {
    return this.db.getAll('ordens');
  }

  async get(id: number) {
    return this.db.get('ordens', id);
  }

  async getEmAndamento() {
    return this.db.getAllFromIndex('ordens', 'by-situacao', 1);
  }

  async getFinalizadas() {
    return this.db.getAllFromIndex('ordens', 'by-situacao', 2);
  }

  async delete(id: number) {
    return this.db.delete('ordens', id);
  }
}
