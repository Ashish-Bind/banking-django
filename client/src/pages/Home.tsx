import { ShieldCheck, Wallet, ArrowRight, Banknote, Zap, Users, TrendingUp, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="bg-white overflow-hidden font-script">
      {/* Hero Section - Full bleed, modern gradient */}
      <section className="relative bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-100 px-6 py-16 lg:py-20">
        <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div className={`space-y-8 opacity-0 translate-y-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : ''}`}>
              <div className="space-y-5">
                <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
                  Banking that{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                    feels like magic
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                  One beautiful dashboard for all your accounts, transactions, loans, and EMIs. 
                  Secure. Fast. Effortless.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-8 py-4 rounded-2xl text-lg font-medium hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Start Free Today
                  <ArrowRight className="group-hover:translate-x-1 transition" size={20} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-lg font-medium border-2 border-gray-300 hover:border-gray-400 transition"
                >
                  Sign In
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      src={`https://randomuser.me/api/portraits/men/${i + 10}.jpg`}
                      alt=""
                      className="w-10 h-10 rounded-full border-2 border-white"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">12,000+</span> people managing money better
                </p>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className={`opacity-0 translate-y-10 transition-all delay-300 duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : ''}`}>
              <img
                src="/hero.svg"
                alt="Finzap Dashboard"
                className="w-full max-w-lg mx-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "99.9%", label: "Uptime" },
              { value: "2M+", label: "Transactions/mo" },
              { value: "AES-256", label: "Encryption" },
              { value: "24/7", label: "Support" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl lg:text-4xl font-bold text-emerald-600">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Card style with subtle hover lift */}
      <section className="py-24 lg:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">Everything in one place</h2>
            <p className="mt-4 text-xl text-gray-600">Powerful features. Beautifully simple.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Wallet,
                title: "Smart Accounts",
                desc: "Multiple savings & current accounts with real-time balance sync.",
              },
              {
                icon: Zap,
                title: "Instant Transfers",
                desc: "Send money in seconds — zero fees for Finzap-to-Finzap transfers.",
              },
              {
                icon: TrendingUp,
                title: "Smart Insights",
                desc: "AI-powered spending analysis and personalized recommendations.",
              },
              {
                icon: ShieldCheck,
                title: "Bank-Grade Security",
                desc: "Biometric login, end-to-end encryption, and fraud monitoring.",
              },
              {
                icon: Banknote,
                title: "Loan Center",
                desc: "Apply, track, and repay loans with auto EMI calculations.",
              },
              {
                icon: Users,
                title: "Family Sharing",
                desc: "Shared wallets and expense splitting for families & teams.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative p-8 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-emerald-50/30 rounded-2xl opacity-0 group-hover:opacity-100 transition"></div>
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white mb-6">
                    <feature.icon size={28} />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-3 text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900">Loved by thousands</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              { text: "Switched from my old bank app. Night and day difference.", name: "Sarah Chen", role: "Freelancer" },
              { text: "Finally an app that doesn’t make finance feel overwhelming.", name: "Michael Park", role: "Small Business Owner" },
              { text: "The loan tracker saved me from missing an EMI. Lifesaver!", name: "Priya Sharma", role: "Teacher" },
            ].map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <CheckCircle2 key={i} size={20} className="text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-lg text-gray-700 italic">"{t.text}"</p>
                <div className="mt-6">
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-600">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Full width with gradient */}
      <section className="relative bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-700 px-6 py-24">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Ready to take control of your money?
          </h2>
          <p className="mt-6 text-xl opacity-90">
            Join 12,000+ happy users. No hidden fees. Cancel anytime.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-3 bg-white text-emerald-600 px-10 py-5 rounded-2xl text-lg font-semibold hover:bg-gray-100 hover:scale-105 transition-all"
            >
              Create Free Account
              <ArrowRight size={22} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-10 py-5 rounded-2xl text-lg font-medium border-2 border-white/30 hover:bg-white/10 transition"
            >
              Already have an account?
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="bg-gray-50 border-t py-12 px-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-600">
          © 2025 Finzap. All rights reserved. Made with ❤️ for better banking.
        </div>
      </footer>
    </div>
  );
}