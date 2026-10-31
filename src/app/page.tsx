import BootSequence from "@/components/boot/BootSequence";

/**
 * `/` is the cinematic boot experience (Sprint 5). This file is a Server
 * Component specifically so the `<link rel="preload">` below is emitted
 * server-side and hoisted into `<head>` by React/Next — letting the
 * browser's preload scanner start fetching the cinematic before any
 * client JS has hydrated, rather than waiting for `BootSequence`'s
 * `<video>` element to mount. `BootSequence` (auth check + the actual
 * `<video>`) is the client boundary; nothing here is interactive.
 */
export default function Home() {
  return (
    <>
      <link rel="preload" href="/media/loader.mp4" as="video" type="video/mp4" />
      <BootSequence />
    </>
  );
}
