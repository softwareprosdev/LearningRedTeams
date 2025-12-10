'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black cyber-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Master Cybersecurity with{' '}
                  <span className="text-gradient-red glow-red">ZeroDay Institute</span>
                </h1>
                <p className="text-xl text-neutral-300 leading-relaxed">
                  Learn from industry experts and become a cybersecurity professional through our comprehensive training programs covering red team, blue team, and purple team techniques.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center px-8 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-200 border-glow-red border-glow-red-hover"
                    >
                      Go to Dashboard
                    </Link>
                    <Link
                      href="/courses"
                      className="inline-flex items-center justify-center px-8 py-4 border-2 border-zinc-700 text-neutral-300 rounded-lg font-semibold hover:border-red-600 hover:text-red-500 transition-all duration-200"
                    >
                      Browse Courses
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signup"
                      className="inline-flex items-center justify-center px-8 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-200 border-glow-red border-glow-red-hover"
                    >
                      Get Started Free
                    </Link>
                    <Link
                      href="/courses"
                      className="inline-flex items-center justify-center px-8 py-4 border-2 border-zinc-700 text-neutral-300 rounded-lg font-semibold hover:border-red-600 hover:text-red-500 transition-all duration-200"
                    >
                      Browse Courses
                    </Link>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-6 pt-4">
                <div className="text-sm text-neutral-400">
                  <span className="font-semibold text-red-500 glow-red">10,000+</span> Students Trained
                </div>
                <div className="text-sm text-neutral-400">
                  <span className="font-semibold text-red-500 glow-red">500+</span> Courses Available
                </div>
                <div className="text-sm text-neutral-400">
                  <span className="font-semibold text-red-500 glow-red">98%</span> Success Rate
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-zinc-900 to-black border border-red-600/30 rounded-3xl flex items-center justify-center border-glow-red">
                <div className="text-center space-y-4">
                  <div className="text-8xl text-red-500 glow-red">&#128274;</div>
                  <div className="text-sm font-mono text-neutral-500 tracking-wider">SECURE.ACCESS.GRANTED</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-16 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-4">
              Certified & Compliant
            </h3>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Our training programs meet the highest industry standards and compliance requirements
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {[
              { name: 'SOC 2', org: 'AICPA' },
              { name: 'ISO 27001', org: 'Certified' },
              { name: 'CREST', org: 'Approved' },
              { name: 'NIST CSF 2.0', org: 'Compliant' },
              { name: 'FISMA', org: 'Certified' },
              { name: 'NIST 800-53', org: 'Compliant' },
              { name: 'GDPR', org: 'Compliant' },
              { name: 'DORA', org: 'Compliant' }
            ].map((cert, index) => (
              <div key={index} className="flex flex-col items-center group">
                <div className="bg-black border border-zinc-800 group-hover:border-red-600 rounded-xl px-4 py-3 transition-all duration-200 w-full text-center border-glow-red-hover">
                  <div className="font-semibold text-white text-sm">{cert.name}</div>
                </div>
                <span className="text-xs text-neutral-500 mt-2">{cert.org}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose ZeroDay Institute?
            </h2>
            <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
              We provide comprehensive cybersecurity education with hands-on experience and industry-recognized certifications
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-black border border-zinc-800 hover:border-red-600 p-8 rounded-2xl transition-all duration-200 border-glow-red-hover">
              <div className="w-12 h-12 bg-red-950/50 border border-red-900 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl text-red-500">&#127891;</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Expert-Led Training
              </h3>
              <p className="text-neutral-400 leading-relaxed">
                Learn from experienced security professionals with real-world experience and proven track records in the industry.
              </p>
            </div>

            <div className="bg-black border border-zinc-800 hover:border-red-600 p-8 rounded-2xl transition-all duration-200 border-glow-red-hover">
              <div className="w-12 h-12 bg-red-950/50 border border-red-900 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl text-red-500">&#128274;</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                MITRE ATT&CK Aligned
              </h3>
              <p className="text-neutral-400 leading-relaxed">
                All courses align with the industry-standard MITRE ATT&CK framework, ensuring you learn the most current techniques.
              </p>
            </div>

            <div className="bg-black border border-zinc-800 hover:border-red-600 p-8 rounded-2xl transition-all duration-200 border-glow-red-hover">
              <div className="w-12 h-12 bg-red-950/50 border border-red-900 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl text-red-500">&#127942;</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Hands-On Labs
              </h3>
              <p className="text-neutral-400 leading-relaxed">
                Practice real-world scenarios in secure, isolated lab environments designed to simulate actual security challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-red-950 via-black to-black border-t border-red-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Start Your Cybersecurity Journey?
          </h2>
          <p className="text-xl text-neutral-300 mb-8">
            Join thousands of professionals who have advanced their careers with ZeroDay Institute
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated && (
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-black rounded-lg font-semibold hover:bg-neutral-200 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Start Learning Today
              </Link>
            )}
            <Link
              href="/courses"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-black transition-all duration-200"
            >
              Explore All Courses
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
