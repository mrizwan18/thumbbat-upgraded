import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ThumbBat | Angoothaah",
  description: "A cricket game for the masses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        {/* Global motion safety net (Sprint 1): every Framer Motion
            animation in the app automatically respects the user's
            prefers-reduced-motion setting without each component having
            to check it individually. */}
        {/* No persistent Navbar (Sprint 5): ThumbBat is now a game-first
            experience — navigation is contextual per-screen, not a
            permanent website chrome bar. See docs/THUMBBAT_UI_AUDIT.md,
            Sprint 5, for the intentional temporary reachability gap this
            creates until Sprint 6/7 add game-native navigation. */}
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
    </html>
  );
}
