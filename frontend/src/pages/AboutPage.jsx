import React from 'react'
import { Code2, ShieldCheck, Zap, Palette, Users, Brain, Cpu, Database } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#080b10] text-gray-300">
      <div className="max-w-4xl mx-auto px-8 py-16 w-full relative">
        
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 p-64 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-64 left-0 p-64 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-16">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-6 mt-8">
            <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
              <Brain size={48} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-100 to-purple-300 tracking-tight leading-tight">
                CODESAGE
              </h1>
              <p className="text-sm font-semibold tracking-[0.2em] text-blue-400 mt-2 uppercase">
                AI Code Review Agent
              </p>
            </div>
            <p className="text-xl text-gray-400 max-w-2xl font-medium leading-relaxed">
              &quot;Instant, intelligent code reviews &mdash; catch bugs before they ship.&quot;
            </p>
          </div>

          {/* Divider */}
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto" />

          {/* What It Does & Problem it Solves */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#0c0f16] rounded-2xl p-8 border border-white/5 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Cpu size={20} className="text-purple-400" />
                What It Does
              </h2>
              <p className="text-gray-400 leading-relaxed text-[15px]">
                An AI-powered tool that automatically reviews code for bugs, security vulnerabilities, performance issues, and style violations &mdash; providing actionable fix suggestions in seconds.
              </p>
            </div>

            <div className="bg-[#0c0f16] rounded-2xl p-8 border border-white/5 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck size={20} className="text-red-400" />
                The Problem It Solves
              </h2>
              <p className="text-gray-400 leading-relaxed text-[15px]">
                Freshers often introduce anti-patterns and vulnerabilities. Senior developers become review bottlenecks. This agent automates the first pass &mdash; ensuring faster feedback and much less friction in the pipeline.
              </p>
            </div>
          </div>

          {/* Key Features */}
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-center text-white">Key Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FeatureCard 
                icon={<Code2 className="text-blue-400" />} 
                text="Multi-language support (Python, JavaScript, and more)" 
              />
              <FeatureCard 
                icon={<ShieldCheck className="text-amber-400" />} 
                text="Multi-category analysis: Bugs, Security, Performance, Style" 
              />
              <FeatureCard 
                icon={<Zap className="text-red-400" />} 
                text="Severity ratings: Critical / Warning / Info" 
              />
              <FeatureCard 
                icon={<Palette className="text-emerald-400" />} 
                text="AI-generated fix suggestions with before/after diffs" 
              />
            </div>
          </div>

          {/* Tech Stack */}
          <div className="flex flex-col items-center text-center gap-6 mt-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Database size={24} className="text-emerald-400" />
              Tech Stack
            </h2>
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
              {['React 18', 'Vite', 'TailwindCSS', 'highlight.js', 'FastAPI', 'MySQL 8', 'OpenAI / Groq API'].map(tech => (
                <span key={tech} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-gray-300 shadow-sm">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto" />

          {/* Team */}
          <div className="flex flex-col items-center gap-6 mb-16">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users size={24} className="text-blue-400" />
              Team Members
            </h2>
            <div className="flex flex-wrap justify-center gap-4 max-w-3xl">
              {['Aamil Khan', 'Harsh Tripathi', 'Kumudini Gholap', 'Sanket Kingaonkar', 'Aadil Siddiqui'].map(member => (
                <div key={member} className="px-6 py-3 rounded-full bg-gradient-to-r from-white/5 to-transparent border border-white/10 text-sm font-semibold text-gray-200">
                  {member}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, text }) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-colors duration-200">
      <div className="flex-shrink-0 p-2.5 rounded-lg bg-white/5 border border-white/10 shadow-inner">
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-300 leading-snug">
        {text}
      </span>
    </div>
  )
}
