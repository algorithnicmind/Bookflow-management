"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
  HelpCircle,
  MessageCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Send,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const FAQ_ITEMS = [
  {
    question: "How do I apply for leave?",
    answer: "Navigate to 'Apply Leave' from the sidebar menu. Select the leave type, choose your dates, provide a reason, and submit. Your manager will receive a notification to approve or reject your request.",
  },
  {
    question: "How many leave days do I have remaining?",
    answer: "Your leave balance is displayed on the Dashboard under 'Leave Balance'. It shows the breakdown by leave type (Casual, Sick, Earned, Unpaid) with total, used, and remaining days.",
  },
  {
    question: "Can I cancel a pending leave request?",
    answer: "Yes! Go to 'Leave History', find the pending request, and click the 'Cancel' button. Note: you can only cancel leaves that are still in 'Pending' status.",
  },
  {
    question: "How does the approval process work?",
    answer: "When you submit a leave request, it goes to your direct manager for approval. Managers can approve or reject from the 'Pending Approvals' page. You'll receive a notification once a decision is made.",
  },
  {
    question: "What leave types are available?",
    answer: "LeaveFlow supports four leave types: Casual Leave (for personal time), Sick Leave (for illness), Earned Leave (accrued based on tenure), and Unpaid Leave (when other balances are exhausted).",
  },
  {
    question: "Who can access the Analytics page?",
    answer: "The Analytics page is available to Admins and Super Admins only. It provides organization-wide leave statistics, department breakdowns, and trend analysis.",
  },
  {
    question: "How do I change my password?",
    answer: "Go to Settings > Security tab. Enter your current password, then your new password twice to confirm. Click 'Update Password' to save.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[var(--glass-border)] rounded-xl overflow-hidden transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-medium text-[var(--text-primary)] pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
        ) : (
          <ChevronDown className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-sm text-[var(--text-secondary)] leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Support form will be functional when the backend API supports it.");
    setSupportSubject("");
    setSupportMessage("");
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-4xl"
    >
      <motion.div variants={staggerItem}>
        <h1 className="text-3xl font-bold gradient-text">Help & Support</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Find answers to common questions or get in touch with support.
        </p>
      </motion.div>

      {/* Quick Links */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card cursor-pointer group">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center shrink-0 group-hover:bg-[var(--primary)]/20 transition-colors">
              <BookOpen className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="font-semibold text-sm">User Guide</p>
              <p className="text-xs text-[var(--text-muted)]">Learn the basics</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card cursor-pointer group">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-sm">FAQ</p>
              <p className="text-xs text-[var(--text-muted)]">Common questions</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card cursor-pointer group">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
              <MessageCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-sm">Contact Support</p>
              <p className="text-xs text-[var(--text-muted)]">Get help from our team</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* FAQ Section */}
      <motion.div variants={staggerItem}>
        <Card className="glass-card-flat">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[var(--primary)]" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>Quick answers to the most common questions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {FAQ_ITEMS.map((faq, i) => (
              <FAQItem key={i} question={faq.question} answer={faq.answer} />
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Support */}
      <motion.div variants={staggerItem}>
        <Card className="glass-card-flat">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[var(--primary)]" />
              Contact Support
            </CardTitle>
            <CardDescription>Need more help? Send us a message and we'll get back to you.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSupportSubmit} className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <Label htmlFor="support-subject">Subject</Label>
                <Input
                  id="support-subject"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  className="input-field"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-message">Message</Label>
                <Textarea
                  id="support-message"
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  className="input-field min-h-[120px] resize-y"
                  required
                />
              </div>
              <button type="submit" className="btn-primary">
                <Send className="w-4 h-4" />
                Send Message
              </button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
