import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPeriodoTrimestre(
  trimestre: number,
  ano: number
): [Date, Date] {
  const periodos = {
    1: {
      inicio: new Date(ano, 1, 10), // 10/02
      fim: new Date(ano, 4, 23), // 23/05
    },
    2: {
      inicio: new Date(ano, 4, 26), // 26/05
      fim: new Date(ano, 8, 5), // 05/09
    },
    3: {
      inicio: new Date(ano, 8, 8), // 08/09
      fim: new Date(ano, 11, 12), // 12/12
    },
  };

  const periodo = periodos[trimestre as keyof typeof periodos];
  return [periodo.inicio, periodo.fim];
}

export function gerarDatasAula(
  trimestre: number,
  ano: number,
  diasSelecionados: string[]
): Date[] {
  const [dataInicio, dataFim] = getPeriodoTrimestre(trimestre, ano);
  const datas: Date[] = [];

  const mapaDias = {
    segunda: 1,
    terca: 2,
    quarta: 3,
    quinta: 4,
    sexta: 5,
  };

  const dataAtual = new Date(dataInicio);

  while (dataAtual <= dataFim) {
    const diaSemana = dataAtual.getDay();
    const diaString = Object.entries(mapaDias).find(
      ([, value]) => value === diaSemana
    )?.[0];

    if (diaString && diasSelecionados.includes(diaString)) {
      datas.push(new Date(dataAtual));
    }

    dataAtual.setDate(dataAtual.getDate() + 1);
  }

  return datas;
}
