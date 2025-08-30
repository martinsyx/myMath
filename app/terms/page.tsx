"use client"

import React from "react";
import { Metadata } from "@/components/Metadata";

const pageMetadata = {
  title: "Terms of Service - Kids Math Game",
  description: "Read the terms and conditions that govern your use of Kids Math Game. By accessing our website, you agree to these terms.",
  path: "/terms",
  schemaData: {
    "@type": "WebPage",
    "name": "Terms of Service - Kids Math Game",
    "description": "Terms of service for Kids Math Game website and services."
  }
};

export default function TermsPage() {
  return (
    <>
      <Metadata
        title={pageMetadata.title}
        description={pageMetadata.description}
        path={pageMetadata.path}
        schemaData={pageMetadata.schemaData}
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-600">
            Please read these terms carefully before using our services
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-6">
              <strong>Last Updated:</strong> August 30, 2025
            </p>
            
            <p className="text-gray-700 mb-6">
              These Terms of Service (&#34;Terms&#34;) govern your access to and use of the Kids Math Game 
              website and services. By accessing or using our services, you agree to be bound by 
              these Terms and our Privacy Policy.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-6">
              By accessing or using our services, you confirm that you are at least 18 years old 
              or that you are a parent or legal guardian agreeing to these Terms on behalf of a 
              child. If you do not agree to these Terms, you must not access or use our services.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-6">
              Kids Math Game provides educational math games and activities designed for children. 
              Our services are provided for educational and entertainment purposes only. We reserve 
              the right to modify or discontinue, temporarily or permanently, any part of our 
              services with or without notice.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">3. User Accounts</h2>
            <p className="text-gray-700 mb-4">
              When you create an account on our platform, you are responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>Ensuring that all information you provide is accurate and current</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">4. User Responsibilities</h2>
            <p className="text-gray-700 mb-4">
              As a user of our services, you agree not to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
              <li>Use our services for any illegal or unauthorized purpose</li>
              <li>Interfere with or disrupt the integrity or performance of our services</li>
              <li>Attempt to gain unauthorized access to our systems or networks</li>
              <li>Use our services in any way that could damage, disable, or impair our website</li>
              <li>Engage in any activity that violates the rights of others</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">5. Intellectual Property</h2>
            <p className="text-gray-700 mb-6">
              All content, features, and functionality on our website, including but not limited 
              to text, graphics, logos, icons, images, audio clips, digital downloads, data 
              compilations, and software, are the exclusive property of Kids Math Game or its 
              licensors and are protected by international copyright, trademark, patent, trade 
              secret, and other intellectual property or proprietary rights laws.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">6. User Content</h2>
            <p className="text-gray-700 mb-6">
              You retain all rights to any content you submit, post, or display on or through our 
              services. By submitting, posting, or displaying content on or through our services, 
              you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, 
              process, adapt, modify, publish, transmit, display, and distribute such content in 
              any and all media or distribution methods.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-gray-700 mb-6">
              Our services are provided &#34;as is&#34; and &#34;as available&#34; without warranties of any kind, 
              either express or implied. We do not warrant that our services will be uninterrupted 
              or error-free, that defects will be corrected, or that our services or the servers 
              that make them available are free of viruses or other harmful components.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 mb-6">
              In no event shall Kids Math Game, its directors, employees, partners, agents, 
              suppliers, or affiliates be liable for any indirect, incidental, special, 
              consequential, or punitive damages, including without limitation, loss of profits, 
              data, use, goodwill, or other intangible losses, resulting from your access to or 
              use of or inability to access or use the services.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">9. Modifications to Terms</h2>
            <p className="text-gray-700 mb-6">
              We reserve the right, at our sole discretion, to modify or replace these Terms at 
              any time. If a revision is material, we will provide at least 30 days&#39; notice prior 
              to any new terms taking effect. What constitutes a material change will be determined 
              at our sole discretion.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">10. Governing Law</h2>
            <p className="text-gray-700 mb-6">
              These Terms shall be governed and construed in accordance with the laws of [Your 
              Jurisdiction], without regard to its conflict of law provisions. Our failure to 
              enforce any right or provision of these Terms will not be considered a waiver of 
              those rights.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">11. Contact Information</h2>
            <p className="text-gray-700 mb-6">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700">
                <strong>Email:</strong> martinsyx@sina.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
