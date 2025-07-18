// components/OutputImage.js
export default function OutputImage({ src, index }) {
  return (
    <div className="w-full p-4">
      <img
        src={src}
        alt={`Generated ${index}`}
        className="w-full max-w-xl mx-auto rounded-lg shadow-md object-contain"
      />
      <div className="text-center mt-2">
        <a
          href={src}
          download={`output-${index}.png`}
          className="text-sm text-primary underline"
        >
          Download Image
        </a>
      </div>
    </div>
  );
}
