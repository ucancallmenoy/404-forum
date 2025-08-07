"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-sm p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-2">Sign Up</h2>
        <input
          required
          placeholder="First Name"
          value={form.firstName}
          onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
          className="border p-2 rounded"
        />
        <input
          required
          placeholder="Last Name"
          value={form.lastName}
          onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
          className="border p-2 rounded"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className="border p-2 rounded"
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-black text-white rounded p-2 mt-2" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        {error && <div className="text-red-500">{error}</div>}
        <div className="text-sm mt-2">
          Already have an account? <a href="/auth/login" className="underline">Login</a>
        </div>
      </form>
    </div>
  );
}