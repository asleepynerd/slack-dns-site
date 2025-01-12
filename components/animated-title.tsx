"use client";

import { motion } from "framer-motion";

const letterVariants = {
  hidden: { y: 100, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      type: "spring",
      damping: 10,
      stiffness: 100,
    },
  }),
};

export function AnimatedTitle() {
  const title1 = "Subdomains".split("");
  const title2 = "for".split("");
  const title3 = "Hackclubbers".split("");

  return (
    <div className="relative py-8">
      <h1 className="text-center text-5xl font-extrabold tracking-tight sm:text-7xl flex flex-col items-center gap-6">
        <div className="flex overflow-visible py-4">
          {title1.map((letter, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={letterVariants}
              initial="hidden"
              animate="visible"
              className="text-white relative inline-block"
              whileHover={{
                y: -20,
                scale: 1.2,
                color: "#3b82f6",
                transition: { type: "spring", stiffness: 300 },
              }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </div>
        <div className="flex overflow-visible py-4">
          {title2.map((letter, i) => (
            <motion.span
              key={i}
              custom={i + title1.length}
              variants={letterVariants}
              initial="hidden"
              animate="visible"
              className="text-zinc-400 relative inline-block"
              whileHover={{
                y: -20,
                scale: 1.2,
                color: "#3b82f6",
                transition: { type: "spring", stiffness: 300 },
              }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </div>
        <div className="flex relative overflow-visible py-4 mb-8">
          {title3.map((letter, i) => (
            <motion.span
              key={i}
              custom={i + title1.length + title2.length}
              variants={letterVariants}
              initial="hidden"
              animate="visible"
              className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent relative inline-block leading-none"
              whileHover={{
                y: -20,
                scale: 1.2,
                transition: { type: "spring", stiffness: 300 },
              }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
          <motion.div
            className="absolute -bottom-4 left-0 right-0 h-1 bg-blue-500/50"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              delay: 1.5,
              duration: 1,
              ease: "easeInOut",
            }}
          />
        </div>
      </h1>
    </div>
  );
}
