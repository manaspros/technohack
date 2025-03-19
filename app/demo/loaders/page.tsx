import PixelLoader from "@/components/ui/pixel-loader";

export default function LoaderDemoPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-pixel mb-8 text-center">Pixel Loaders</h1>
      <p className="text-center font-mono mb-12">
        Retro-styled pixel art loading animations for your pixel-perfect
        application
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
        <div className="flex flex-col items-center gap-6 bg-gray-800 p-8 rounded-lg border border-gray-700">
          <h3 className="text-xl font-pixel">Small</h3>
          <PixelLoader size="small" text="Loading" />
        </div>

        <div className="flex flex-col items-center gap-6 bg-gray-800 p-8 rounded-lg border border-gray-700">
          <h3 className="text-xl font-pixel">Medium</h3>
          <PixelLoader size="medium" text="Processing" />
        </div>

        <div className="flex flex-col items-center gap-6 bg-gray-800 p-8 rounded-lg border border-gray-700">
          <h3 className="text-xl font-pixel">Large</h3>
          <PixelLoader size="large" text="Initializing AI" />
        </div>
      </div>

      <div className="mt-16 text-center font-mono">
        <h2 className="text-xl font-pixel mb-4">Usage</h2>
        <p className="mb-6">
          The pixel loader appears when the main page is loading and disappears
          once content is ready.
        </p>
        <code className="bg-gray-900 p-4 rounded-lg text-sm">
          &lt;PixelLoader size="medium" text="Loading" /&gt;
        </code>
      </div>
    </div>
  );
}
