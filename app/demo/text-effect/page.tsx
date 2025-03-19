import TextGenerateEffectDemo from "@/components/text-generate-effect-demo";

export default function TextEffectDemoPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-pixel mb-8 text-center">
        Text Generate Effect
      </h1>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 max-w-3xl mx-auto">
        <TextGenerateEffectDemo />
      </div>

      <div className="mt-12 max-w-xl mx-auto text-center">
        <p className="text-lg mb-4 font-mono">
          This effect animates text generation word by word, creating a typing
          effect that reveals text gradually with a subtle blur transition.
        </p>
        <p className="text-gray-400 font-mono">
          Used in the chatbot for AI-generated responses.
        </p>
      </div>
    </div>
  );
}
