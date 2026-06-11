"use client";

import { motion } from "framer-motion";
import { pageTransition, staggerContainer, staggerItem } from "@/lib/animations";
import { 
  HelpCircle, 
  Book, 
  MessageCircle, 
  FileQuestion, 
  Mail,
  ChevronRight,
  ExternalLink
} from "lucide-react";

export default function HelpPage() {
  const faqs = [
    {
      q: "How is my leave balance calculated?",
      a: "Leave balances are automatically calculated based on your join date, department policies, and any carried over leaves from the previous year. You earn a pro-rated amount each month."
    },
    {
      q: "How long does it take for a request to be approved?",
      a: "Most requests are reviewed by managers within 24-48 hours. If your request is urgent, we recommend messaging your manager directly after submitting it through the platform."
    },
    {
      q: "Can I cancel an approved leave?",
      a: "Yes, you can cancel an approved leave from the Leave History page as long as the start date hasn't passed. Your balance will be automatically refunded."
    },
    {
      q: "What happens to my balance at the end of the year?",
      a: "Depending on your company's policy, a certain number of unused leave days may carry over to the next year, while the rest expire. Check with HR for specifics."
    }
  ];

  const resources = [
    {
      title: "Employee Handbook",
      desc: "Full company policies and guidelines.",
      icon: Book,
      color: "blue"
    },
    {
      title: "Leave Policy Overview",
      desc: "Detailed breakdown of leave types.",
      icon: FileQuestion,
      color: "emerald"
    },
    {
      title: "Contact HR",
      desc: "Direct support for complex issues.",
      icon: MessageCircle,
      color: "purple"
    }
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6 lg:space-y-8 max-w-5xl"
    >
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-rose-400" />
            </div>
            Help & Resources
          </h1>
          <p className="text-white/40 text-sm mt-1.5 ml-14">
            Find answers to common questions and access support
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Main FAQ Section */}
        <motion.div variants={staggerItem} className="lg:col-span-2 space-y-6">
          <div className="glass-card-static border border-white/[0.04] overflow-hidden">
            <div className="p-6 border-b border-white/[0.04]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Frequently Asked Questions
              </h2>
            </div>
            
            <div className="p-2">
              {faqs.map((faq, i) => (
                <div key={i} className="p-4 hover:bg-white/[0.02] transition-colors rounded-xl group cursor-default">
                  <h3 className="text-sm font-bold text-white flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-white/5 text-white/40 flex items-center justify-center text-xs shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {faq.q}
                  </h3>
                  <p className="text-[13px] text-white/50 leading-relaxed mt-2 ml-9">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Sidebar Resources */}
        <motion.div variants={staggerItem} className="space-y-6">
          <div className="glass-card-static border border-white/[0.04] overflow-hidden">
            <div className="p-6 border-b border-white/[0.04]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Quick Links
              </h2>
            </div>
            
            <div className="p-4 flex flex-col gap-2">
              {resources.map((res, i) => (
                <button key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/[0.06] transition-all group text-left">
                  <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <res.icon className={`w-5 h-5 text-white/60 group-hover:text-white`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{res.title}</p>
                    <p className="text-[11px] text-white/40 mt-0.5">{res.desc}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/20 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Mail className="w-24 h-24 text-indigo-300 transform rotate-12" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 relative z-10">Still need help?</h3>
            <p className="text-sm text-indigo-200/60 leading-relaxed mb-6 relative z-10">
              Our support team is available Monday through Friday to assist you with any questions.
            </p>
            <button className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25 text-sm w-full relative z-10">
              Contact Support
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
