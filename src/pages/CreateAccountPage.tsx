import { useState, type FormEvent } from "react";
import { Card, Layout, PrimaryButton, SecondaryButton } from "../components/Layout";

export function CreateAccountPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!displayName.trim() || !email.trim() || !password.trim()) {
      setError("Fill in all fields to create an account.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError(null);
    setSubmitted(true);
  }

  return (
    <Layout showBack backTo="/">
      <div className="space-y-6 md:space-y-8">
        <div>
          <h1 className="text-3xl font-black uppercase md:text-5xl">Create account</h1>
          <p className="mt-2 text-white/60 md:text-lg">
            Save stats, sync premium, and play online when it launches.
          </p>
        </div>

        <Card>
          {submitted ? (
            <p className="text-sm leading-6 text-white/70 md:text-base md:leading-7">
              Accounts aren&apos;t live yet — we&apos;ll let you know when sign-up
              opens.
            </p>
          ) : (
            <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="display-name"
                  className="block font-spartan text-sm leading-snug tracking-normal text-white/70 md:text-base"
                >
                  Display name
                </label>
                <input
                  id="display-name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Your name"
                  className="field-input"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block font-spartan text-sm leading-snug tracking-normal text-white/70 md:text-base"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="field-input"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block font-spartan text-sm leading-snug tracking-normal text-white/70 md:text-base"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  className="field-input"
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <p className="text-sm font-semibold text-red-400 md:text-base">
                  {error}
                </p>
              )}

              <PrimaryButton type="submit">Create account</PrimaryButton>
            </form>
          )}
        </Card>

        <SecondaryButton to="/">Back to home</SecondaryButton>
      </div>
    </Layout>
  );
}
