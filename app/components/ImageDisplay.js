export default function ImageDisplay({ images }) {
  return (
    <div className="mt-6 space-y-4">
      {images.map((src, index) => (
        <div key={index} className="flex flex-col items-center">
          <img src={src} alt={`Generated ${index + 1}`} className="rounded max-w-full" />
          <a
            href={src}
            download={`image-${index + 1}.png`}
            className="mt-2 text-sm text-blue-600 underline"
          >
            Download
          </a>
        </div>
      ))}
    </div>
  );
}
