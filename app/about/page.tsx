"use client";

import { Navbar } from "@/components/layout/navbar";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About ASD Support Platform
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Our mission is to connect patients, families, and healthcare
            professionals for better autism spectrum disorder (ASD) support. We
            believe in accessible, compassionate, and expert care for everyone.
          </p>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-2">
              Our Values
            </h2>
            <ul className="text-left text-gray-700 list-disc list-inside mx-auto max-w-md">
              <li>Empathy and understanding for every individual</li>
              <li>
                Collaboration between patients, families, and professionals
              </li>
              <li>Accessible, secure, and user-friendly technology</li>
              <li>Continuous improvement and innovation</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-primary mb-2">
              Our Team
            </h2>
            <p className="text-gray-700">
              We are a passionate group of developers, clinicians, and advocates
              dedicated to making ASD support more effective and inclusive. If
              you want to join us or learn more, please reach out via our
              contact page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
