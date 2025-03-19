import FollowingPointerDemo from "@/components/following-pointer-demo";

export default function PointerPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-pixel mb-8 text-center">
        Pixel Cursor Effect
      </h1>
      <p className="font-mono text-center mb-12 max-w-2xl mx-auto">
        This demo showcases a custom pixel-art cursor that follows your mouse
        movements. Move your cursor over the cards below to see the effect in
        action.
      </p>

      <FollowingPointerDemo />
    </div>
  );
}
