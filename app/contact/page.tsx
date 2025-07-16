"use client";

import { Navbar } from "@/components/layout/navbar";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-700 mb-8">
            Have questions, feedback, or need help? Reach out to our team using
            the form below or via email.
          </p>
          <div className="text-left max-w-md mx-auto mb-8">
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
          <div className="text-left max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-primary mb-2">
              Contact Details
            </h2>
            <p className="text-gray-700 mb-2">
              Email:{" "}
              <a
                href="mailto:support@asdplatform.com"
                className="text-primary underline"
              >
                support@asdplatform.com
              </a>
            </p>
            <p className="text-gray-700">
              Address: 123 ASD Support Lane, City, Country
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
