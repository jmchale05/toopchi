import { Layout, SecondaryButton } from "../components/Layout";

export function PremiumPage() {
  return (
    <Layout showBack backTo="/">
      <div className="space-y-6 md:space-y-8">
        <div>
          <h1 className="text-3xl font-black uppercase md:text-5xl">Premium</h1>
          <p className="mt-2 text-white/60 md:text-lg">
            Purchases aren&apos;t live yet — check back soon.
          </p>
        </div>

        <SecondaryButton to="/">Back to home</SecondaryButton>
      </div>
    </Layout>
  );
}
