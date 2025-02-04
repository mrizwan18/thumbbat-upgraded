"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"; // Framer Motion for animations

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      router.push("/game"); // ✅ Redirect if logged in
    }
  }, [router]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-r from-green-600 via-green-700 to-trasnparent text-white px-6 py-12 relative overflow-hidden">
      {/* Animated Background with Slow Movement */}
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-40 animate-background"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2967&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
        }}
      ></div>

      {/* Main content container */}
      <div className="text-center w-full max-w-lg mx-auto relative z-10">
        {/* Heading with animation */}
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: -50 }} // Initial state: hidden and above
          animate={{ opacity: 1, y: 0 }} // Final state: visible and in place
          transition={{ duration: 1, ease: "easeOut" }}
        >
          ThumbBat 🏏
        </motion.h1>

        {/* Subheading with animation */}
        <motion.p
          className="text-sm md:text-lg text-gray-200 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        >
          Angoo-thaah! Let&apos;s relive our favorite childhood game, Heads or
          tails. Let&apos;s Go.
        </motion.p>

        {/* Action Button with animation */}
        <Link href="/login">
          <motion.button
            className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-8 rounded-lg text-lg font-medium w-full max-w-xs mx-auto mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.6 }}
            whileHover={{ scale: 1.05 }} // Hover effect: scale up
            whileTap={{ scale: 0.95 }} // Tap effect: scale down
          >
            Let&apos;s Go
          </motion.button>
        </Link>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-xs text-gray-300 w-full text-center">
        <p>© 2025 ThumbBat. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
