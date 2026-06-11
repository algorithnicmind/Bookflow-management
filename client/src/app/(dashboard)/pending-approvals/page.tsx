"use client";

import { motion } from "framer-motion";
import { PendingApprovalsList } from "@/features/approvals/pending-approvals-list";
import { staggerContainer, staggerItem } from "@/lib/animations";

export default function PendingApprovalsPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-[1200px] mx-auto"
    >
      <motion.div variants={staggerItem} className="relative z-10">
        <PendingApprovalsList />
      </motion.div>
    </motion.div>
  );
}
