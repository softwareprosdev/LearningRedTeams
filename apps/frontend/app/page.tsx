'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900">
              Master Cybersecurity
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700">
              Learn from industry experts and become a cybersecurity professional
            </p>
          </div>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            ZeroDay Institute offers comprehensive cybersecurity training covering red team, blue team,
            and purple team techniques aligned with the MITRE ATT&CK framework.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/courses"
                  className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Browse Courses
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/courses"
                  className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Browse Courses
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Certifications & Compliance */}
        <div className="mt-16 bg-white rounded-lg shadow-md p-8">
          <h3 className="text-center text-sm font-semibold text-gray-600 uppercase tracking-wide mb-6">
            Certified & Compliant
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 rounded-lg px-4 py-2 font-semibold text-blue-900">SOC 2</div>
              <span className="text-xs text-gray-500 mt-1">AICPA</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 rounded-lg px-4 py-2 font-semibold text-blue-900">ISO 27001</div>
              <span className="text-xs text-gray-500 mt-1">Certified</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 rounded-lg px-4 py-2 font-semibold text-blue-900">CREST</div>
              <span className="text-xs text-gray-500 mt-1">Approved</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 rounded-lg px-4 py-2 font-semibold text-blue-900">NIST CSF 2.0</div>
              <span className="text-xs text-gray-500 mt-1">Compliant</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 rounded-lg px-4 py-2 font-semibold text-blue-900">FISMA</div>
              <span className="text-xs text-gray-500 mt-1">Certified</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 rounded-lg px-4 py-2 font-semibold text-blue-900">NIST 800-53</div>
              <span className="text-xs text-gray-500 mt-1">Compliant</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 rounded-lg px-4 py-2 font-semibold text-blue-900">GDPR</div>
              <span className="text-xs text-gray-500 mt-1">Compliant</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 rounded-lg px-4 py-2 font-semibold text-blue-900">DORA</div>
              <span className="text-xs text-gray-500 mt-1">Compliant</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Expert-Led Training
            </h3>
            <p className="text-gray-600">
              Learn from experienced security professionals with real-world experience
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              MITRE ATT&CK Aligned
            </h3>
            <p className="text-gray-600">
              All courses align with the industry-standard MITRE ATT&CK framework
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Hands-On Labs
            </h3>
            <p className="text-gray-600">
              Practice real-world scenarios in secure, isolated lab environments
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
