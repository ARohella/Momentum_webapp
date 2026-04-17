export const metadata = {
  title: 'Terms of Service — Momentum',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Terms of Service</h1>
      <p className="text-sm text-white/60 mb-8">Last updated: April 17, 2026</p>

      <div className="space-y-6 text-white/80 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mb-2">1. Acceptance</h2>
          <p>
            By accessing or using Momentum at{' '}
            <a className="text-accent underline" href="https://use-momentum-one.vercel.app">
              use-momentum-one.vercel.app
            </a>{' '}
            (the &quot;Service&quot;), you agree to these Terms of Service. If you do not agree,
            do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">2. The Service</h2>
          <p>
            Momentum is a personal productivity tool providing task management, habit
            tracking, journaling, calendar, analytics, and AI-assisted features. The Service
            is provided free of charge and is offered as-is for personal, non-commercial use.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">3. Your Data</h2>
          <p>
            Your data is stored in your own browser&apos;s localStorage. You are responsible
            for maintaining your own backups. Clearing browser data, switching devices, or
            switching browsers will result in loss of your Momentum data. See our{' '}
            <a className="text-accent underline" href="/privacy">Privacy Policy</a> for more
            detail.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">4. Google Account Integration</h2>
          <p>
            If you connect a Google account for calendar features, you authorize Momentum to
            read and, when you initiate it, create events in your Google Calendar. You can
            revoke this access at any time from{' '}
            <a
              className="text-accent underline"
              href="https://myaccount.google.com/permissions"
            >
              your Google Account settings
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">5. AI Content</h2>
          <p>
            AI-generated content (coach replies, daily briefs, parsed tasks, goal
            breakdowns) is produced by a third-party model (Google Gemini) and may contain
            inaccuracies. You should not rely on it for medical, legal, financial, or other
            professional advice. You are responsible for reviewing AI output before acting on
            it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">6. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Attempt to reverse-engineer, attack, or disrupt the Service</li>
            <li>Use the Service to generate abusive, illegal, or harmful content</li>
            <li>Abuse the AI features with automated or excessive requests</li>
            <li>Use the Service in violation of any applicable law</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">7. Disclaimer</h2>
          <p>
            THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS
            OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS
            FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. We do not guarantee that the
            Service will be uninterrupted, error-free, or free of data loss.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Momentum and its developers shall not be
            liable for any indirect, incidental, consequential, or special damages arising
            from your use of the Service, including loss of data, loss of productivity, or
            business interruption.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">9. Termination</h2>
          <p>
            You may stop using the Service at any time. We may suspend or terminate access
            to the Service at our discretion, including if you violate these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">10. Changes</h2>
          <p>
            We may update these Terms as the Service evolves. Continued use after changes
            constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">11. Contact</h2>
          <p>
            Questions can be sent to{' '}
            <a className="text-accent underline" href="mailto:akshat.rohella@gmail.com">
              akshat.rohella@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
