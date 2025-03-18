import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-5xl font-pixel mb-6">404 - Visual Error</h1>
      <p className="font-mono text-xl mb-6">
        Even our multimodal AI can't see this page!
      </p>
      <Link
        href="/"
        className="font-pixel bg-green-600 text-black px-6 py-3 text-lg rounded-lg hover:bg-green-500 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
