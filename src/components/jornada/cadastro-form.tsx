"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { jornadaSchema } from "@/lib/schemas";
import { gerarDatasAula } from "@/lib/utils";
import { Printer } from "lucide-react"; // Adicione este import
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
interface Feriado {
  data: Date;
  nome: string;
}
const diasSemana = [
  { id: "segunda", label: "Segunda-feira" },
  { id: "terca", label: "Terça-feira" },
  { id: "quarta", label: "Quarta-feira" },
  { id: "quinta", label: "Quinta-feira" },
  { id: "sexta", label: "Sexta-feira" },
];

const turmas = [
  { value: "C3A", label: "Creche 3 A" },
  { value: "C3B", label: "Creche 3 B" },
  { value: "C3C", label: "Creche 3 C" },
  { value: "C4A", label: "Creche 4 A" },
  { value: "C4B", label: "Creche 4 B" },
  { value: "C4C", label: "Creche 4 C" },
  { value: "C4E", label: "Creche 4 E" },
  { value: "C4F", label: "Creche 4 F" },
  { value: "C4G", label: "Creche 4 G" },
  { value: "P1A", label: "PRÉ 1 A" },
  { value: "P1B", label: "PRÉ 1 B" },
  { value: "P1C", label: "PRÉ 1 C" },
  { value: "P1D", label: "PRÉ 1 D" },
  { value: "P1E", label: "PRÉ 1 E" },
  { value: "P1F", label: "PRÉ 1 F" },
  { value: "P1G", label: "PRÉ 1 G" },
  { value: "P2A", label: "PRÉ 2 A" },
  { value: "P2B", label: "PRÉ 2 B" },
  { value: "P2C", label: "PRÉ 2 C" },
  { value: "P2D", label: "PRÉ 2 D" },
  { value: "P2E", label: "PRÉ 2 E" },
  { value: "P2F", label: "PRÉ 2 F" },
  { value: "P2G", label: "PRÉ 2 G" },
  { value: "P2H", label: "PRÉ 2 H" },
];

const trimestres = [
  { value: "1", label: "1º Trimestre" },
  { value: "2", label: "2º Trimestre" },
  { value: "3", label: "3º Trimestre" },
  { value: "4", label: "4º Trimestre" },
];

export const FERIADOS_2025 = [
  { data: new Date(2025, 0, 1), nome: "Ano Novo" },
  { data: new Date(2025, 2, 4), nome: "Carnaval" },
  { data: new Date(2025, 2, 5), nome: "Carnaval" },
  { data: new Date(2025, 2, 6), nome: "Quarta-feira de Cinzas" },
  { data: new Date(2025, 3, 18), nome: "Sexta-feira Santa" },
  { data: new Date(2025, 3, 21), nome: "Tiradentes" },
  { data: new Date(2025, 4, 1), nome: "Dia do Trabalho" },
  { data: new Date(2025, 5, 19), nome: "Corpus Christi" },
  { data: new Date(2025, 8, 7), nome: "Independência" },
  { data: new Date(2025, 9, 12), nome: "Nossa Senhora Aparecida" },
  { data: new Date(2025, 10, 2), nome: "Finados" },
  { data: new Date(2025, 10, 15), nome: "Proclamação da República" },
  { data: new Date(2025, 11, 25), nome: "Natal" },
];

const getFeriados = () => {
  const savedFeriados = localStorage.getItem("feriados-2025");
  if (savedFeriados) {
    const parsedFeriados = JSON.parse(savedFeriados);
    return parsedFeriados.map((f: Feriado) => ({
      data: new Date(f.data),
      nome: f.nome,
    }));
  }
  return FERIADOS_2025; // fallback to default holidays if nothing in localStorage
};
export function CadastroJornadaForm() {
  const [diasSelecionados, setDiasSelecionados] = useState<{
    [key: string]: number;
  }>({});
  const [datasAula, setDatasAula] = useState<Date[]>([]);
  const [programacao, setProgramacao] = useState<string[]>([]);

  const form = useForm({
    resolver: zodResolver(jornadaSchema),
    defaultValues: {
      professor: "",
      turma: "",
      trimestre: 1,
      ano: new Date().getFullYear(),
    },
  });
  const feriados = getFeriados();
  const getDiaSemana = (data: Date) => {
    const dias = {
      0: "domingo",
      1: "segunda",
      2: "terca",
      3: "quarta",
      4: "quinta",
      5: "sexta",
      6: "sabado",
    };
    return dias[data.getDay() as keyof typeof dias];
  };

  const handleDiaSelecionado = (diaId: string, checked: boolean) => {
    if (checked) {
      setDiasSelecionados((prev) => ({
        ...prev,
        [diaId]: 1,
      }));
    } else {
      const novosDias = { ...diasSelecionados };
      delete novosDias[diaId];
      setDiasSelecionados(novosDias);
    }
  };

  const handleTemposSelecionados = (diaId: string, tempos: string) => {
    setDiasSelecionados((prev) => ({
      ...prev,
      [diaId]: parseInt(tempos),
    }));
  };
  interface FormData {
    professor: string;
    turma: string;
    trimestre: number;
    ano: number;
  }
  const onSubmit = (data: FormData) => {
    // Validação dos dias selecionados
    if (Object.keys(diasSelecionados).length === 0) {
      alert("Selecione pelo menos um dia da semana");
      return;
    }

    // Validação dos tempos
    const temposInvalidos = Object.values(diasSelecionados).some(
      (tempo) => tempo === 0
    );
    if (temposInvalidos) {
      alert("Selecione a quantidade de tempos para todos os dias marcados");
      return;
    }

    const diasParaProcessar = Object.keys(diasSelecionados);
    const datas = gerarDatasAula(data.trimestre, data.ano, diasParaProcessar);
    setDatasAula(datas);

    const programacaoGerada = diasParaProcessar.map((diaId) => {
      const diaLabel = diasSemana.find((d) => d.id === diaId)?.label;
      return `${diaLabel}: ${diasSelecionados[diaId]} tempos`;
    });

    setProgramacao(programacaoGerada);
  };

  return (
    <Card className="w-full ">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Cadastro de Jornada do Professor</CardTitle>
        <Link href="/confg">
          <Button className="text-white bg-green-500 hover:bg-green-600">
            ADM
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="professor">Nome do Professor</Label>
            <Input
              id="professor"
              {...form.register("professor")}
              placeholder="Digite o nome do professor"
            />
            {form.formState.errors.professor && (
              <p className="text-sm text-red-500">
                {form.formState.errors.professor.message}
              </p>
            )}
          </div>

          <div className="space-y-2 ">
            <Label>Turma</Label>
            <Select onValueChange={(value) => form.setValue("turma", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a turma" />
              </SelectTrigger>
              <SelectContent>
                {turmas.map((turma) => (
                  <SelectItem key={turma.value} value={turma.value}>
                    {turma.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Trimestre</Label>
              <Select
                onValueChange={(value) =>
                  form.setValue("trimestre", Number(value))
                }
                defaultValue="1"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o trimestre" />
                </SelectTrigger>
                <SelectContent>
                  {trimestres.map((trim) => (
                    <SelectItem key={trim.value} value={trim.value}>
                      {trim.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ano</Label>
              <Input
                type="number"
                {...form.register("ano", { valueAsNumber: true })}
                defaultValue={new Date().getFullYear()}
              />
            </div>
          </div>

          <div className="space-y-4">
            {diasSemana.map((dia) => (
              <div key={dia.id} className="flex items-center gap-4">
                <div className="flex items-center space-x-2 w-32">
                  <Checkbox
                    id={dia.id}
                    checked={dia.id in diasSelecionados}
                    onCheckedChange={(checked) =>
                      handleDiaSelecionado(dia.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={dia.id}>{dia.label}</Label>
                </div>
                <Select
                  disabled={!(dia.id in diasSelecionados)}
                  value={diasSelecionados[dia.id]?.toString()}
                  onValueChange={(value) =>
                    handleTemposSelecionados(dia.id, value)
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Tempos" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((tempo) => (
                      <SelectItem key={tempo} value={tempo.toString()}>
                        {tempo} {tempo === 1 ? "tempo" : "tempos"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full">
            Gerar Programação
          </Button>
        </form>

        {datasAula.length > 0 && (
          <div className="mt-8">
            <div
              className="bg-white p-4 rounded-lg border print:border-none"
              id="tabelaProgramacao"
            >
              <div className="mb-3 text-sm">
                <h2 className="text-xl font-bold text-center mb-2">
                  Programação de Aulas
                </h2>
                <div className="grid grid-cols-3 gap-2 mb-4 ">
                  <p className="text-lg">
                    <span className="font-semibold text-lg">Professor(a):</span>{" "}
                    {form.getValues("professor")}
                  </p>
                  <p className="text-lg">
                    <span className="font-semibold text-lg">Turma:</span>{" "}
                    {form.getValues("turma")}
                  </p>
                  <p className="text-lg">
                    <span className="font-semibold text-lg">Período:</span>{" "}
                    {
                      trimestres.find(
                        (t) =>
                          t.value === form.getValues("trimestre").toString()
                      )?.label
                    }
                    /{form.getValues("ano")}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end print:hidden gap-2 items-center py-2">
                <Button
                  onClick={() => window.print()}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2">
                {datasAula.map((data, index) => {
                  const diaSemana = getDiaSemana(data);
                  const tempos = diasSelecionados[diaSemana];
                  const feriado = feriados.find(
                    (f: Feriado) =>
                      f.data.getDate() === data.getDate() &&
                      f.data.getMonth() === data.getMonth()
                  );
                  return (
                    <div
                      key={index}
                      className={` ${
                        feriado ? "bg-red-50 border-red-200" : ""
                      }${
                        !feriado && tempos === 1
                          ? "bg-blue-50 border-blue-200"
                          : ""
                      }
    ${!feriado && tempos === 2 ? "bg-green-50 border-green-200" : ""}
    ${!feriado && tempos === 3 ? "bg-purple-50 border-purple-200" : ""}
    ${!feriado && tempos === 4 ? "bg-amber-50 border-amber-200" : ""}
    ${
      !feriado && tempos === 5 ? "bg-rose-50 border-rose-200" : ""
    }border rounded-lg p-2 aspect-square flex flex-col bg-gray-50`}
                    >
                      <div className="text-center border-b pb-1">
                        <div className="font-medium">
                          {format(data, "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                        <div
                          className={`text-xs capitalize
    ${
      feriado
        ? "text-red-600 font-medium"
        : `
      ${tempos === 1 && "text-blue-700"}
      ${tempos === 2 && "text-green-700"}
      ${tempos === 3 && "text-purple-700"}
      ${tempos === 4 && "text-amber-700"}
      ${tempos === 5 && "text-rose-700"}
    `
    }
  `}
                        >
                          {feriado ? feriado.nome : ""}
                        </div>
                        <div
                          className={`text-xs capitalize
      ${tempos === 1 && "text-blue-700"}
      ${tempos === 2 && "text-green-700"}
      ${tempos === 3 && "text-purple-700"}
      ${tempos === 4 && "text-amber-700"}
      ${tempos === 5 && "text-rose-700"}
    `}
                        >
                          {format(data, "EEEE", { locale: ptBR })}
                        </div>
                      </div>
                      {!feriado && (
                        <>
                          <div className="flex-1 flex flex-col items-center justify-center">
                            <div
                              className={`text-base font-bold
              ${tempos === 1 ? "text-blue-600" : ""}
              ${tempos === 2 ? "text-green-600" : ""}
              ${tempos === 3 ? "text-purple-600" : ""}
              ${tempos === 4 ? "text-amber-600" : ""}
              ${tempos === 5 ? "text-rose-600" : ""}
            `}
                            >
                              <span className="pr-1">{tempos}</span>
                              <span className="text-lg">
                                {tempos === 1 ? "tempo" : "tempos"}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 border-t pt-1 sm:text-sm">
                            Observação:__________
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {programacao.length > 0 && (
          <div className="mt-6 p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Programação Gerada:</h3>
            <ul className="space-y-1">
              {programacao.map((dia, index) => (
                <li key={index}>{dia}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
