"use client";

import { Navbar } from "@/components/layout/navbar";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Support & FAQs
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Need help? Find answers to common questions or contact our support
            team below.
          </p>
          <div className="mb-8 text-left">
            <h2 className="text-2xl font-semibold text-primary mb-2">
              Frequently Asked Questions
            </h2>
            <ul className="space-y-4">
              <li>
                <strong>How do I register as a patient or doctor?</strong>
                <br />
                Use the Register page and select your role. Fill in the required
                details and follow the instructions.
              </li>
              <li>
                <strong>How do I book an appointment?</strong>
                <br />
                After logging in as a patient, browse available doctors and
                click "Book Appointment".
              </li>
              <li>
                <strong>How do I reset my password?</strong>
                <br />
                Use the "Forgot password?" link on the login page and follow the
                instructions.
              </li>
              <li>
                <strong>Who can I contact for technical support?</strong>
                <br />
                Please use the contact form below or email us at{" "}
                <a
                  href="mailto:support@asdplatform.com"
                  className="text-primary underline"
                >
                  support@asdplatform.com
                </a>
                .
              </li>
            </ul>
          </div>
          <div className="text-left max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-primary mb-2">
              Contact Support
            </h2>
            <form className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-gray-700 font-medium mb-1"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-gray-700 font-medium mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-gray-700 font-medium mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  className="w-full border rounded px-3 py-2"
                  rows={4}
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded font-semibold hover:bg-primary/90 transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
