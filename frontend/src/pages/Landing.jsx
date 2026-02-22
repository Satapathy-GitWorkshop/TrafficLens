import { Link } from 'react-router-dom'
import { Eye, BarChart3, Activity, Globe, Zap, Shield, ArrowRight, CheckCircle } from 'lucide-react'

const features = [
  { icon: Activity, title: 'Real-time Tracking', desc: 'Watch visitors as they browse your site, updated every 5 seconds.' },
  { icon: BarChart3, title: 'Deep Analytics', desc: 'Page views, sessions, bounce rate, top pages, referrers, and more.' },
  { icon: Globe, title: 'Universal Snippet', desc: 'One JS snippet works on any website — React, WordPress, PHP, plain HTML.' },
  { icon: Zap, title: 'Fast & Lightweight', desc: 'Under 5KB tracker. No impact on your website performance.' },
  { icon: Shield, title: 'Privacy First', desc: 'GDPR compliant. IP anonymization. No cookies required.' },
  { icon: Eye, title: 'Compare Periods', desc: 'Compare this week vs last week, this month vs last year.' },
]

const stats = [
  { value: '< 5KB', label: 'Tracker Size' },
  { value: '5s', label: 'Realtime Update' },
  { value: '100%', label: 'Open Source' },
  { value: '∞', label: 'Sites Supported' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-950 text-slate-100">
      {/* Navbar */}
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">TrafficLens</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 py-24 text-center relative">
          <div className="badge badge-blue mb-6 text-sm px-3 py-1">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 live-dot inline-block"></span>
            Open Source Analytics Platform
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Analytics that give you
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-400 block">
              the full picture
            </span>
          </h1>

          <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            TrafficLens is a powerful, privacy-first Google Analytics alternative.
            Add one snippet, understand everything about your traffic.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-base px-8 py-3 flex items-center justify-center gap-2">
              Start for Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="border-y border-slate-800 bg-dark-900/50">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-display text-3xl font-bold text-primary-400 mb-1">{value}</div>
              <div className="text-slate-500 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-white mb-4">Everything you need</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            All the analytics features you expect, without the bloat.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card hover:border-slate-700 transition-all group">
              <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-600/30 transition-colors">
                <Icon className="w-5 h-5 text-primary-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Snippet preview */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="card border-slate-700">
          <h3 className="font-display text-2xl font-bold text-white mb-2">Add tracking in 30 seconds</h3>
          <p className="text-slate-400 mb-6">Paste this snippet before &lt;/head&gt; on any website.</p>
          <div className="bg-dark-950 rounded-lg p-4 font-mono text-sm overflow-x-auto border border-slate-800">
            <div className="text-slate-500">{'<!-- TrafficLens -->'}</div>
            <div className="text-emerald-400">{'<script>'}</div>
            <div className="text-slate-300 pl-4">
              {'window.TrafficLens={siteKey:"YOUR_SITE_KEY",apiUrl:"https://api.yourdomain.com"};'}
            </div>
            <div className="text-slate-300 pl-4">
              {'var s=document.createElement("script");'}
            </div>
            <div className="text-slate-300 pl-4">
              {'s.src="/tracker.js";s.async=true;document.head.appendChild(s);'}
            </div>
            <div className="text-emerald-400">{'</script>'}</div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {['React', 'Vue', 'Angular', 'WordPress', 'Shopify', 'Plain HTML', 'PHP', 'Next.js'].map(fw => (
              <span key={fw} className="badge badge-blue">{fw}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-800 bg-dark-900/30">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Ready to understand your traffic?
          </h2>
          <p className="text-slate-400 mb-8">Free to use. No credit card required.</p>
          <Link to="/register" className="btn-primary text-base px-10 py-3 inline-flex items-center gap-2">
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center">
              <Eye className="w-3 h-3 text-white" />
            </div>
            <span className="font-display font-bold text-white">TrafficLens</span>
          </div>
          <p className="text-slate-500 text-sm">© 2024 TrafficLens. Open source analytics platform.</p>
        </div>
      </footer>
    </div>
  )
}
