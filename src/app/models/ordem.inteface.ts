import { IPeca } from "../components/modal-pecas/modal-pecas.component";

export class OrdemServico implements IOrdemServico {

  id?: number;
  modelo: string;
  frota: number;
  hodometro: string;
  local: string;
  tipoManutencao: string;
  fotoUrl?: string | undefined;
  operador: string;
  problemas: Problemas[];
  status: "aguardando_execucao" | "em_execucao" | "concluida" | "pausada";
  dataInicio?: string | undefined;
  dataAbertura?: string | undefined;
  dataConclusao?: string | undefined;


  constructor(){
    this.modelo = '';
    this.frota = 0;
    this.hodometro = '';
    this.local = '';
    this.tipoManutencao = '1';
    this.operador = '';
    this.fotoUrl = '';
    this.status = 'aguardando_execucao';
    this.problemas = [];
    this.dataAbertura = new Date().toISOString();
  }

}

export interface IOrdemServico {
  id?: number;
  modelo: string;
  frota: number;
  hodometro: string;
  operador: string;
  local: string;
  tipoManutencao: string;
  fotoUrl?: string;
  problemas: Problemas[];
  status: 'aguardando_execucao' | 'em_execucao' | 'concluida' | 'pausada';
  dataInicio?: string;
  dataAbertura?: string;
  dataConclusao?: string;
}

export interface Problemas {
  id: number;
  tipo: string;
  situacao: string;
  observacao: IObservacoes[];
  pecas: IPeca[];
  concluido?: boolean;
  fotoUrl: string;
  horaConclusao?: string;
}

export interface IObservacoes {
  id: number;
  descricaoObservacao: string
}



