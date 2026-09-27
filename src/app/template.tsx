"use client";

import { motion } from "motion/react";

/* Remounts on every navigation, so each page fades in while the 3D field
   behind it morphs into the new page's shape. Opacity only, on purpose:
   a transform or filter here would become the containing block for the
   photo lightbox and trap it inside the page. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
