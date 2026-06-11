"use client";

import { motion } from "framer-motion";
import { EmployeeManagement } from "@/features/employees/employee-management";
import { pageTransition, staggerContainer, staggerItem } from "@/lib/animations";
import { Users } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

export default function EmployeesPage() {
  const { user } = useAuthStore();

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6 lg:space-y-8"
    >
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            Employee Directory
          </h1>
          <p className="text-white/40 text-sm mt-1.5 ml-14">
            Manage your team, assign roles, and review access levels
          </p>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="relative z-10">
        <EmployeeManagement />
      </motion.div>
    </motion.div>
  );
}
