import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './landingPage/Navbar';
import Footer from './landingPage/Footer';
import WhatsAppButton from '@/components/common/WhatsAppButton';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 pb-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
            
            <div className="space-y-8 text-gray-700">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
                <p className="leading-relaxed mb-4">
                  We collect information to provide better services to all our users. The types of information we collect include:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Personal Information:</strong> Name, email address, phone number, and address</li>
                  <li><strong>Account Information:</strong> Username, password, and profile details</li>
                  <li><strong>Business Information:</strong> Farm details, business registration, and banking information</li>
                  <li><strong>Transaction Data:</strong> Order history, payment information, and shipping details</li>
                  <li><strong>Device Information:</strong> IP address, browser type, and device identifiers</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
                <p className="leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices and support messages</li>
                  <li>Communicate with you about products, services, and promotional offers</li>
                  <li>Monitor and analyze trends and usage</li>
                  <li>Detect, prevent, and address technical issues</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
                <p className="leading-relaxed mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
                  except in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Business Transfers:</strong> If we are acquired by or merged with another company</li>
                  <li><strong>Service Providers:</strong> Trusted third parties who assist in operating our platform</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Partners:</strong> With your consent for specific services</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
                <p className="leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal information 
                  against unauthorized access, alteration, disclosure, or destruction. These include:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li>SSL encryption for data transmission</li>
                  <li>Secure servers for data storage</li>
                  <li>Regular security audits and updates</li>
                  <li>Restricted access to personal data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookies and Tracking</h2>
                <p className="leading-relaxed mb-4">
                  We use cookies and similar tracking technologies to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze website traffic and user behavior</li>
                  <li>Personalize your experience</li>
                  <li>Provide relevant advertisements and content</li>
                </ul>
                <p className="leading-relaxed mt-4">
                  You can control cookies through your browser settings, but disabling cookies may affect your experience on our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. User Rights</h2>
                <p className="leading-relaxed">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li>Access and update your personal information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Request a copy of your personal data</li>
                  <li>Object to processing of your personal information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
                <p className="leading-relaxed">
                  We retain your personal information for as long as necessary to provide our services, 
                  comply with legal obligations, resolve disputes, and enforce our agreements. 
                  Account deletion requests are processed within 30 days.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
                <p className="leading-relaxed">
                  Our services are not intended for children under 18 years of age. 
                  We do not knowingly collect personal information from children under 18. 
                  If you believe we have collected such information, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
                <p className="leading-relaxed">
                  Your personal information may be transferred to and processed in countries other than your own. 
                  We ensure appropriate safeguards are in place to protect your data in accordance with applicable data protection laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
                <p className="leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes 
                  by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
                <p className="leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">Email: privacy@aswamithra.com</p>
                  <p className="font-medium">Phone: +91 800-123-4567</p>
                  <p className="font-medium">Address: 123 Agricultural Park, Hyderabad, Telangana 500001</p>
                </div>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer onSelectRole={() => {}} />
      <WhatsAppButton />
    </div>
  );
};

export default PrivacyPolicy;
