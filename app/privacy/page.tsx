"use client"
import React from "react";
import { Metadata } from "@/components/Metadata";

const pageMetadata = {
  title: "Privacy Policy - Kids Math Game",
  description: "Learn how Kids Math Game collects, uses, and protects your personal information. We are committed to safeguarding your privacy.",
  path: "/privacy",
  schemaData: {
    "@type": "WebPage",
    "name": "Privacy Policy - Kids Math Game",
    "description": "Privacy policy for Kids Math Game website and services."
  }
};

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600">
            Your privacy is important to us
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-6">
              <strong>Last Updated:</strong> August 30, 2025
            </p>
            
            <p className="text-gray-700 mb-6">
              This Privacy Policy describes how Kids Math Game {`("we", "our", or "us")`} 
              collects, uses, and shares your personal information when you visit our 
              website or use our services.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Information You Provide</h3>
            <p className="text-gray-700 mb-4">
              We may collect information you provide directly to us, such as when you:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
              <li>Contact us through our contact form or email</li>
              <li>Participate in our surveys or feedback programs</li>
              <li>Subscribe to our newsletter or marketing communications</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Information Automatically Collected</h3>
            <p className="text-gray-700 mb-4">
              When you access our website, we may automatically collect certain information, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Referring URLs</li>
              <li>Pages viewed and time spent on our site</li>
              <li>Device information</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Cookies and Tracking Technologies</h3>
            <p className="text-gray-700 mb-4">
              We use cookies and similar tracking technologies to track activity on our website 
              and store certain information. You can instruct your browser to refuse all cookies 
              or to indicate when a cookie is being sent.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Respond to your comments and questions</li>
              <li>Send you technical notices and support messages</li>
              <li>Monitor and analyze usage and trends</li>
              <li>Personalize your experience on our website</li>
              <li>Protect the security and integrity of our services</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Information Sharing</h2>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third 
              parties without your consent, except as described below:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
              <li><strong>Service Providers:</strong> We may share information with vendors, 
              consultants, and other service providers who need access to such information to 
              carry out work on our behalf.</li>
              <li><strong>Legal Compliance:</strong> We may disclose your information if 
              required to do so by law or in response to valid requests by public authorities.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, 
              or sale of all or a portion of our assets, your information may be transferred 
              as part of that transaction.</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Data Security</h2>
            <p className="text-gray-700 mb-6">
              We implement appropriate technical and organizational measures to protect the 
              security of your personal information. However, no method of transmission over 
              the Internet or method of electronic storage is 100% secure.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">{`Children's Privacy`}</h2>
            <p className="text-gray-700 mb-6">
              Our services are not intended for children under the age of 13, and we do not 
              knowingly collect personal information from children under 13. If we become aware 
              that we have collected personal information from a child under 13, we will take 
              steps to delete such information.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Your Rights</h2>
            <p className="text-gray-700 mb-4">
              Depending on your location, you may have certain rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
              <li>The right to access, update, or delete your personal information</li>
              <li>The right to object to processing of your personal information</li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Changes to This Privacy Policy</h2>
            <p className="text-gray-700 mb-6">
             {` We may update our Privacy Policy from time to time. We will notify you of any 
              changes by posting the new Privacy Policy on this page and updating the 
              "Last Updated" date.`}
            </p>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-6">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700">
                <strong>Email:</strong> privacy@kidsmathgame.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
