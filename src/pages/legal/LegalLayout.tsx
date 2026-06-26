import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import Logo from "@/atoms/Logo";
import { Button } from "@/atoms/ui/button";

interface LegalLayoutProps {
  title: string;
  updated: string;
  children: ReactNode;
}

export default function LegalLayout({ title, updated, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
          <Link to="/login">
            <ArrowLeft className="size-4" />
            Back to login
          </Link>
        </Button>

        <header className="mb-8 border-b border-slate-200 pb-6">
          <Logo className="mb-3" imageClassName="size-11" nameClassName="text-base text-indigo-700" />
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
        </header>

        <article className="space-y-6 text-sm leading-relaxed text-slate-700 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900 [&_a]:font-medium [&_a]:text-indigo-600 [&_a]:hover:underline [&_li]:mt-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
          {children}
        </article>

        <footer className="mt-12 flex gap-4 border-t border-slate-200 pt-6 text-sm text-muted-foreground">
          <Link to="/privacy" className="hover:text-indigo-600">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-indigo-600">
            Terms of Service
          </Link>
        </footer>
      </div>
    </div>
  );
}
