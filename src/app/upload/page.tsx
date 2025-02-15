import { UploadDiario } from "@/components/upload/upload-diario";

export default function UploadPage() {
  return (
    <main className="min-h-screen p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8">Upload do Diário</h1>
      <UploadDiario />
    </main>
  );
}
