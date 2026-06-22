import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function LoginPage() {
  const { session, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (session) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) setError(error);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas-paper px-md">
      <div className="w-full max-w-sm rounded-marketing border border-hairline bg-canvas-light p-xl">
        <p className="font-mono text-mono-caps uppercase tracking-wide text-mute">
          Chhattisgarh Forest Department
        </p>
        <h1 className="mt-xxs text-heading-md text-ink">FPITMS</h1>
        <p className="mt-xs text-body-sm text-mute">
          Forest Produce Inventory &amp; Transit Management System
        </p>

        <form onSubmit={handleSubmit} className="mt-lg flex flex-col gap-md">
          <Input
            label="Email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Alert tone="error">{error}</Alert>}
          <Button type="submit" disabled={submitting} className="mt-xs">
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-lg text-meta text-mute">
          Accounts are provisioned by your administrator. Contact your division office if you don't
          have credentials.
        </p>
      </div>
    </div>
  );
}
