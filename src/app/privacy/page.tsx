export const metadata = {
  title: 'Privacy Policy — Momentum',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-sm text-white/60 mb-8">Last updated: April 17, 2026</p>

      <div className="space-y-6 text-white/80 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mb-2">Overview</h2>
          <p>
            Momentum is a personal productivity web application. This Privacy Policy
            describes how Momentum (&quot;we&quot;, &quot;our&quot;, &quot;the app&quot;)
            handles information when you use the app at{' '}
            <a className="text-accent underline" href="https://use-momentum-one.vercel.app">
              use-momentum-one.vercel.app
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">Data We Store</h2>
          <p>
            Momentum is a local-first application. All of your data — including tasks,
            habits, journal entries, calendar events, goals, mood, screen time, and
            preferences — is stored exclusively in your browser&apos;s <strong>localStorage</strong>{' '}
            on your own device. We do not operate a user database and do not receive or
            retain copies of this data on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">Google Account Data</h2>
          <p>
            If you connect your Google Calendar, Momentum requests the following OAuth scopes:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><code>calendar.readonly</code> — to read events from your primary calendar</li>
            <li><code>calendar.events</code> — to create events you explicitly push from Momentum</li>
          </ul>
          <p className="mt-3">
            Google events you import are stored in your browser&apos;s localStorage alongside your
            other Momentum data. The OAuth access token is stored in localStorage and expires
            automatically. We do not transmit your Google Calendar data to any Momentum server
            and we do not share it with any third party. Disconnecting Google from the Calendar
            page revokes the token from local storage.
          </p>
          <p className="mt-3">
            Momentum&apos;s use of information received from Google APIs adheres to the{' '}
            <a
              className="text-accent underline"
              href="https://developers.google.com/terms/api-services-user-data-policy"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">AI Features</h2>
          <p>
            Features such as the AI Coach, AI Daily Brief, Natural Language Task Entry, and
            AI Goal Breakdown send contextual prompts to the Google Gemini API. Prompts may
            include a summary of your tasks, habits, and schedule to generate a useful
            response. No personally identifying information is added beyond what you type.
            These prompts are processed according to Google&apos;s AI terms and are not used
            by Momentum for any other purpose.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">Analytics &amp; Tracking</h2>
          <p>
            Momentum does not use analytics tools, trackers, advertising cookies, or
            fingerprinting. Hosting is provided by Vercel, which may collect standard server
            request logs (IP address, user agent, timestamp) for operational purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">Data Deletion</h2>
          <p>
            Because all data is stored locally, you can delete it at any time by clearing
            your browser&apos;s site data for <code>use-momentum-one.vercel.app</code>, or by
            using the reset options within the app. To revoke Momentum&apos;s access to your
            Google account, visit{' '}
            <a
              className="text-accent underline"
              href="https://myaccount.google.com/permissions"
            >
              your Google Account permissions
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">Children</h2>
          <p>
            Momentum is not directed at children under 13 and we do not knowingly collect
            data from children.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">Changes</h2>
          <p>
            We may update this policy as the app evolves. Significant changes will be
            reflected by updating the &quot;Last updated&quot; date above.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">Contact</h2>
          <p>
            Questions about this policy can be sent to{' '}
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
