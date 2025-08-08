"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User, Mail, Lock, Users, Code, Lightbulb, Rocket } from "lucide-react";

export default function SignupForm() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Signup failed");
    } else {
      router.push("/auth/login");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex">
      {/* Left Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Image src="/404.png" alt="404Forum Logo" width={50} height={50} />
              <h1 className="text-3xl font-bold text-gray-900">404Forum</h1>
            </div>
            <p className="text-gray-600">Join the Developer Community</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Join 404Forum</h2>
              <p className="text-gray-600">Create your account and start your journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      required
                      placeholder="First name"
                      value={form.firstName}
                      onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      required
                      placeholder="Last name"
                      value={form.lastName}
                      onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    required
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    required
                    type="password"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* Benefits Preview */}
          <div className="mt-8 text-center lg:hidden">
            <p className="text-gray-600 mb-4">What you will get:</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Code className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-gray-600">Code Help</span>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-gray-600">Community</span>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-gray-600">Knowledge</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Promotional Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <Image src="/404.png" alt="404Forum Logo" width={60} height={60} className="drop-shadow-lg" />
            <h1 className="text-4xl font-bold">404Forum</h1>
          </div>
          
          <h2 className="text-3xl font-bold mb-6 leading-tight">
            Where Developers Come Together
          </h2>
          
          <p className="text-xl mb-8 text-indigo-100 leading-relaxed">
            Whether you are debugging code, exploring new technologies, or sharing your latest project - our community is here to support your journey.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Code className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Technical Support</h3>
                <p className="text-indigo-100">Get help with coding challenges from experienced developers</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Share Knowledge</h3>
                <p className="text-indigo-100">Contribute tutorials, tips, and insights to help others grow</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Rocket className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Showcase Projects</h3>
                <p className="text-indigo-100">Present your work and get valuable feedback from peers</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-white/10 rounded-2xl border border-white/20">
            <p className="text-lg font-medium mb-2">💡 Pro Tip</p>
            <p className="text-indigo-100">The best way to learn is by helping others. Join our community and grow together!</p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-white/10 rounded-full"></div>
        <div className="absolute top-1/3 right-8 w-16 h-16 bg-white/10 rounded-full"></div>
      </div>
    </div>
  );
}