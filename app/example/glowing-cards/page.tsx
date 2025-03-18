import GlowingEffectDemoSecond from "@/components/glowing-effect-demo-2";

export default function GlowingCardsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-pixel mb-6 text-center">
        Interactive Glowing Cards
      </h1>
      <p className="font-mono mb-8 text-center">
        Move your cursor around the cards to see the glowing effect
      </p>

      <div className="px-4 py-8">
        <GlowingEffectDemoSecond />
      </div>
    </div>
  );
}
