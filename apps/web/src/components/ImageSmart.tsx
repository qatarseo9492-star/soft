// src/components/ImageSmart.tsx
import Image, { type ImageProps } from "next/image";

type Props = ImageProps & { sizes?: string };

export default function ImageSmart(p: Props) {
  const sizes = p.sizes ?? "(max-width: 768px) 100vw, 50vw";
  // keep props flexible; Next requires src+alt at call sites
  return <Image {...p} sizes={sizes} />;
}
