"use client";

import { FollowerPointerCard } from "@/components/ui/following-pointer";
import { motion } from "motion/react";

export default function FollowingPointerDemo() {
  return (
    <div className="mx-auto max-w-4xl my-12">
      <h2 className="text-2xl font-pixel text-center mb-6">
        Interactive Pointer Demo
      </h2>
      <FollowerPointerCard className="w-full" pointerColor="#4ade80">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {[1, 2, 3, 4].map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item * 0.1 }}
              className="group relative h-full overflow-hidden rounded-lg border-2 border-gray-700 bg-gray-800 transition duration-200 hover:bg-gray-700"
            >
              <div className="p-4">
                <h2 className="my-2 text-lg font-bold font-mono text-green-400">
                  Multimodal Element {item}
                </h2>
                <p className="my-2 text-sm font-normal text-gray-300">
                  Move your cursor over this interactive card to see the custom
                  pixel pointer effect.
                </p>
                <div className="mt-8 flex flex-row items-center justify-between">
                  <span className="text-sm text-gray-500">Hover me!</span>
                  <button className="relative z-10 block rounded-md border border-green-500 bg-gray-900 px-4 py-1.5 text-xs font-bold text-green-400">
                    Interact
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </FollowerPointerCard>
      <p className="text-center text-sm font-mono mt-4 text-gray-400">
        Custom pixel pointer follows your cursor within the card area
      </p>
    </div>
  );
}
