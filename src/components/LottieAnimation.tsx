// components/LottieAnimation.tsx
"use client";

import Lottie from 'lottie-react';
import makeupArtistAnim from '@/assets/lottie/makeup-artist.json';

export default function LottieAnimation() {
  return (
    <Lottie
      animationData={makeupArtistAnim}
      loop={true}
      autoplay={true}
      className="w-full h-130 xl:h-175"
      rendererSettings={{
        preserveAspectRatio: 'xMidYMid slice'
      }}
    />
  );
}