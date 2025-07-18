import UploadForm from './components/UploadForm';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F5F1F2] text-[#1F2937] flex flex-col items-center justify-center px-4 py-10">
      <section className="text-center mb-8 max-w-xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">AI Outfit Visualizer</h1>
        <p className="text-xl md:text-xl font-regular text-[#1F2937]/90 p-4">
          Upload a model and a clothing item to see AI-generated previews of how they look together — front and back.
        </p>
      </section>

      <UploadForm />
    </main>
  );
}
