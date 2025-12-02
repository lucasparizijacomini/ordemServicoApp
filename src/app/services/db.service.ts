import { Injectable } from '@angular/core';
import { OrdemServico } from '../models/ordem.inteface';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private dbName = 'OSDatabase';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;

        // // Criar store de clientes
        // if (!db.objectStoreNames.contains('clientes')) {
        //   const clientesStore = db.createObjectStore('clientes', {
        //     keyPath: 'id',
        //     autoIncrement: true
        //   });
        //   clientesStore.createIndex('nome', 'nome', { unique: false });
        //   clientesStore.createIndex('telefone', 'telefone', { unique: false });
        // }

        // Criar store de ordens
        if (!db.objectStoreNames.contains('ordens')) {
          const ordensStore = db.createObjectStore('ordens', {
            keyPath: 'id',
            autoIncrement: true
          });
          ordensStore.createIndex('numero', 'numero', { unique: true });
          ordensStore.createIndex('clienteId', 'clienteId', { unique: false });
          ordensStore.createIndex('status', 'status', { unique: false });
          ordensStore.createIndex('data', 'data', { unique: false });
        }
      };
    });
  }

  // ========== CLIENTES ==========
  // async addCliente(cliente: Cliente): Promise<number> {
  //   const db = await this.getDB();
  //   return new Promise((resolve, reject) => {
  //     const transaction = db.transaction(['clientes'], 'readwrite');
  //     const store = transaction.objectStore('clientes');
  //     const request = store.add(cliente);

  //     request.onsuccess = () => resolve(request.result as number);
  //     request.onerror = () => reject(request.error);
  //   });
  // }

  // async getAllClientes(): Promise<Cliente[]> {
  //   const db = await this.getDB();
  //   return new Promise((resolve, reject) => {
  //     const transaction = db.transaction(['clientes'], 'readonly');
  //     const store = transaction.objectStore('clientes');
  //     const request = store.getAll();

  //     request.onsuccess = () => resolve(request.result);
  //     request.onerror = () => reject(request.error);
  //   });
  // }

  // async updateCliente(cliente: Cliente): Promise<number> {
  //   const db = await this.getDB();
  //   return new Promise((resolve, reject) => {
  //     const transaction = db.transaction(['clientes'], 'readwrite');
  //     const store = transaction.objectStore('clientes');
  //     const request = store.put(cliente);

  //     request.onsuccess = () => resolve(request.result as number);
  //     request.onerror = () => reject(request.error);
  //   });
  // }

  // async deleteCliente(id: number): Promise<void> {
  //   const db = await this.getDB();
  //   return new Promise((resolve, reject) => {
  //     const transaction = db.transaction(['clientes'], 'readwrite');
  //     const store = transaction.objectStore('clientes');
  //     const request = store.delete(id);

  //     request.onsuccess = () => resolve();
  //     request.onerror = () => reject(request.error);
  //   });
  // }

  // ========== ORDENS ==========
  async addOrdem(ordem: OrdemServico): Promise<number> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['ordens'], 'readwrite');
      const store = transaction.objectStore('ordens');
      const request = store.add(ordem);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllOrdens(): Promise<OrdemServico[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['ordens'], 'readonly');
      const store = transaction.objectStore('ordens');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateOrdem(ordem: OrdemServico): Promise<number> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['ordens'], 'readwrite');
      const store = transaction.objectStore('ordens');
      const request = store.put(ordem);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteOrdem(id: number): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['ordens'], 'readwrite');
      const store = transaction.objectStore('ordens');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async countOrdens(): Promise<number> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['ordens'], 'readonly');
      const store = transaction.objectStore('ordens');
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return await this.initDB();
  }
}
