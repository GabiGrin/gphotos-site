"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import Link from "next/link";

export default function UpgradeSuccessPage() {
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const confettiInterval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(confettiInterval);
        return;
      }

      confetti({
        particleCount: 3,
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { y: 0.6 },
        colors: ["#60A5FA", "#34D399", "#A78BFA"],
      });
    }, 50);

    return () => clearInterval(confettiInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
            >
              <CheckCircle2 className="w-20 h-20 text-green-500" />
            </motion.div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            You've been upgraded for free!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our payment system is still in development. Meanwhile we've upgraded
            your account for free for the next 2 months. In return - We'd love
            to talk to get some feedback on how to improve MyPhotos.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              What's Next?
            </h2>
            <p className="text-gray-600">
              Explore all the premium features now available to you. We're
              excited to see what you'll create!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Let's Connect
            </h2>
            <p className="text-gray-600">
              We will reach out soon to hear your thoughts and ideas on making
              MyPhotos even better.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center px-8 py-3 text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:shadow-xl"
          >
            Go to Dashboard
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="ml-2"
            >
              →
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
