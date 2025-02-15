"use client";
import { FERIADOS_2025 } from "@/components/jornada/cadastro-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

import { useEffect, useState } from "react";

interface Feriado {
  data: Date;
  nome: string;
}

const ConfgPage = () => {
  const STORAGE_KEY = "feriados-2025";
  const [feriados, setFeriados] = useState<Feriado[]>(() => {
    const savedFeriados = localStorage.getItem(STORAGE_KEY);
    if (savedFeriados) {
      // Converte as strings de data de volta para objetos Date
      const parsedFeriados = JSON.parse(savedFeriados);
      return parsedFeriados.map((f: { data: string; nome: string }) => ({
        ...f,
        data: new Date(f.data),
      }));
    }
    return FERIADOS_2025;
  });
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(feriados));
  }, [feriados]);
  const [novoFeriado, setNovoFeriado] = useState<{
    data: string;
    nome: string;
  }>({
    data: "",
    nome: "",
  });
  const feriadosOrdenados = [...feriados].sort((a, b) => {
    return a.data.getTime() - b.data.getTime();
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const handleAddFeriado = () => {
    if (novoFeriado.nome && novoFeriado.data) {
      const [year, month, day] = novoFeriado.data.split("-").map(Number);
      const novosFeriados = [...feriados];

      if (editingIndex !== null) {
        novosFeriados[editingIndex] = {
          data: new Date(year, month - 1, day),
          nome: novoFeriado.nome,
        };
      } else {
        novosFeriados.push({
          data: new Date(year, month - 1, day),
          nome: novoFeriado.nome,
        });
      }

      // Sort in descending order
      novosFeriados.sort((a, b) => b.data.getTime() - a.data.getTime());

      setFeriados(novosFeriados);
      setNovoFeriado({ data: "", nome: "" });
      setEditingIndex(null);
    }
  };
  const handleEdit = (index: number) => {
    const feriado = feriados[index];
    const formattedDate = feriado.data.toISOString().split("T")[0];
    setNovoFeriado({
      data: formattedDate,
      nome: feriado.nome,
    });
    setEditingIndex(index);
  };
  const handleDeleteFeriado = (index: number) => {
    // Encontra o feriado que queremos excluir na lista ordenada
    const feriadoParaExcluir = feriadosOrdenados[index];

    // Filtra a lista original removendo o feriado
    const novosFeriados = feriados.filter(
      (feriado) =>
        feriado.data.getTime() !== feriadoParaExcluir.data.getTime() ||
        feriado.nome !== feriadoParaExcluir.nome
    );

    setFeriados(novosFeriados);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="container mx-auto py-4 px-4 sm:py-10 sm:px-10">
      <Card className="w-full p-4">
        <div className="flex justify-between sm:flex-row items-center gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold mb-4">
            Configurações de Feriados 2025
          </h1>
          <Link href="/">
            <Button className="flex-1 bg-blue-900 hover:bg-blue-800 sm:flex-none">
              Voltar
            </Button>
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <Input
            className="w-full"
            type="text"
            placeholder="Nome do feriado"
            value={novoFeriado.nome}
            onChange={(e) =>
              setNovoFeriado({ ...novoFeriado, nome: e.target.value })
            }
          />
          <Input
            className="w-full"
            type="date"
            value={novoFeriado.data}
            onChange={(e) =>
              setNovoFeriado({ ...novoFeriado, data: e.target.value })
            }
          />
          <Button className="w-full sm:w-auto" onClick={handleAddFeriado}>
            {editingIndex !== null ? "Atualizar" : "Adicionar"}
          </Button>
        </div>

        <div className="space-y-4">
          {feriadosOrdenados.map((feriado, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded gap-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-medium">{feriado.nome}</span>
                <span className="text-gray-600">
                  {formatDate(feriado.data)}
                </span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  className="flex-1 sm:flex-none"
                  variant="outline"
                  onClick={() => handleEdit(index)}
                >
                  Editar
                </Button>
                <Button
                  className="flex-1 sm:flex-none"
                  variant="destructive"
                  onClick={() => handleDeleteFeriado(index)}
                >
                  Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ConfgPage;
