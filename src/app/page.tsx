'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPin, Package, Users, Star, ArrowRight, Zap, Shield, Clock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzMuMzE0IDAgNiAyLjY4NiA2IDZzLTIuNjg2IDYtNiA2LTYtMi42ODYtNi02IDIuNjg2LTYgNi02eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center space-y-8 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 text-sm font-medium border border-white/20">
              <Zap className="w-4 h-4" />
              Built for college students
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
              Going out?
              <br />
              <span className="text-white/80">Help your hostel.</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Post where you&apos;re heading, pick up quick requests from your community, earn rewards.
              MikroMile turns every errand into a shared win.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-white/90 shadow-xl shadow-black/20 text-lg px-8 h-14 rounded-2xl font-semibold gap-2">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 h-14 px-8 rounded-2xl text-lg font-semibold bg-transparent">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-16 sm:h-24">
            <path fill="var(--background)" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
          </svg>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Three simple steps to turn every errand into community help.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: MapPin,
                step: '01',
                title: 'Post Your Trip',
                description: 'Going to a shop or market? Post where you\'re headed and when you\'ll return.',
                color: 'from-emerald-500 to-teal-500',
              },
              {
                icon: Package,
                step: '02',
                title: 'Accept Requests',
                description: 'Community members request small items. Accept what you can carry — reject what you can\'t.',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Star,
                step: '03',
                title: 'Deliver & Earn',
                description: 'Meet at a shared point, hand off items, earn reward points and ratings.',
                color: 'from-violet-500 to-purple-500',
              },
            ].map((item) => (
              <div key={item.step} className="group relative">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }} />
                <div className="relative bg-card rounded-2xl p-8 border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 h-full">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-6xl font-black text-muted/30 absolute top-6 right-8">
                    {item.step}
                  </span>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why MikroMile?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, title: 'Community First', desc: 'Private groups for your hostel or department.' },
              { icon: Shield, title: 'Trust Built In', desc: 'Ratings, reviews, and verified students only.' },
              { icon: Clock, title: 'Real-Time Updates', desc: 'Live notifications so you never miss a trip.' },
              { icon: Star, title: 'Earn Rewards', desc: 'Reward points & leaderboards for top helpers.' },
            ].map((f) => (
              <div key={f.title} className="bg-card rounded-2xl p-6 border border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <f.icon className="w-8 h-8 text-primary mb-4" />
                <h4 className="font-semibold mb-2">{f.title}</h4>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="gradient-primary rounded-3xl p-12 sm:p-16 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzMuMzE0IDAgNiAyLjY4NiA2IDZzLTIuNjg2IDYtNiA2LTYtMi42ODYtNi02IDIuNjg2LTYgNi02eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to help your community?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
                Join your hostel community and start sharing errands today.
              </p>
              <Link href="/login">
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-white/90 shadow-xl text-lg px-10 h-14 rounded-2xl font-semibold">
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">MikroMile</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MikroMile. Micro-errands, macro-impact.
          </p>
        </div>
      </footer>
    </div>
  );
}
