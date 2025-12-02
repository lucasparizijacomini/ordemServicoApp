export class OrdemServico implements IOrdemServico{
  id?: number;
  modelo: string;
  frota: string;
  hodometro: number;
  local: string;
  tipoManutencao: string;
  operador: string;
  fotoUrl: string;
  situacao: number;
  problemas: Problemas[];

  constructor(){
    this.modelo = '';
    this.frota = '';
    this.hodometro = 0;
    this.local = '';
    this.tipoManutencao = '1';
    this.operador = '';
    this.fotoUrl = '';
    this.situacao = 1;
    this.problemas = []
  }

}

export interface IOrdemServico {
  id?: number;
  modelo: string;
  frota: string;
  hodometro: number;
  local: string
  tipoManutencao: string;
  operador: string;
  fotoUrl: string;
  situacao: number;
  problemas: Problemas[];
}

export interface Problemas {
  id: number;
  tipo: string;
  observacao: string;
  situacao: string;
}

