import UploadForm from './components/UploadForm';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">AI Image Generator</h1>
        <UploadForm />
      </div>
    </main>
  );
}
