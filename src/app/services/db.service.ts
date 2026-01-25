import { Injectable } from '@angular/core';
import { OrdemServico } from '../models/ordem.inteface';
import { ICategoria } from '../models/categorias.interface';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  private readonly dbName = 'OSDatabase';
  private readonly dbVersion = 2;

  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  // ================== INIT DB ==================
  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event: any) => {
        const db: IDBDatabase = event.target.result;
        const transaction = event.target.transaction;

        // ===== VERSÃO 1 =====
        if (event.oldVersion < 1) {
          const ordensStore = db.createObjectStore('ordens', {
            keyPath: 'id',
            autoIncrement: true
          });

          ordensStore.createIndex('numero', 'numero', { unique: true });
          ordensStore.createIndex('clienteId', 'clienteId', { unique: false });
          ordensStore.createIndex('status', 'status', { unique: false });
          ordensStore.createIndex('data', 'data', { unique: false });
        }

        // ===== VERSÃO 2 =====
        if (event.oldVersion < 2) {

          // Categorias
          if (!db.objectStoreNames.contains('categorias')) {
            const categoriasStore = db.createObjectStore('categorias', {
              keyPath: 'id',
              autoIncrement: true
            });

            categoriasStore.createIndex('nome', 'nome', { unique: true });
            categoriasStore.createIndex('ativo', 'ativo', { unique: false });
          }

          // Índice categoriaId em ordens
          const ordensStore = transaction.objectStore('ordens');

          if (!ordensStore.indexNames.contains('categoriaId')) {
            ordensStore.createIndex('categoriaId', 'categoriaId', { unique: false });
          }
        }
      };
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }
    return this.initDB();
  }

  // ================== ORDENS ==================
  async addOrdem(ordem: OrdemServico): Promise<number> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction('ordens', 'readwrite');
      const store = tx.objectStore('ordens');
      const req = store.add(ordem);

      req.onsuccess = () => resolve(req.result as number);
      req.onerror = () => reject(req.error);
    });
  }

  async getAllOrdens(): Promise<OrdemServico[]> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction('ordens', 'readonly');
      const store = tx.objectStore('ordens');
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async updateOrdem(ordem: OrdemServico): Promise<number> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction('ordens', 'readwrite');
      const store = tx.objectStore('ordens');
      const req = store.put(ordem);

      req.onsuccess = () => resolve(req.result as number);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteOrdem(id: number): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction('ordens', 'readwrite');
      const store = tx.objectStore('ordens');
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async countOrdens(): Promise<number> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction('ordens', 'readonly');
      const store = tx.objectStore('ordens');
      const req = store.count();

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // ================== CATEGORIAS ==================
  async addCategoria(categoria: ICategoria): Promise<number> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction('categorias', 'readwrite');
      const store = tx.objectStore('categorias');
      const req = store.add(categoria);

      req.onsuccess = () => resolve(req.result as number);
      req.onerror = () => reject(req.error);
    });
  }

  async getAllCategorias(): Promise<ICategoria[]> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction('categorias', 'readonly');
      const store = tx.objectStore('categorias');
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async updateCategoria(categoria: ICategoria): Promise<number> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction('categorias', 'readwrite');
      const store = tx.objectStore('categorias');
      const req = store.put(categoria);

      req.onsuccess = () => resolve(req.result as number);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteCategoria(id: number): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction('categorias', 'readwrite');
      const store = tx.objectStore('categorias');
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}
