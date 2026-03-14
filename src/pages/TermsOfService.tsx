import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './landingPage/Navbar';
import Footer from './landingPage/Footer';
import WhatsAppButton from '@/components/common/WhatsAppButton';

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 pb-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            
            <div className="space-y-8 text-gray-700">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="leading-relaxed">
                  By accessing and using ASWAMITHRA, you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
                <p className="leading-relaxed">
                  ASWAMITHRA is a B2B agricultural marketplace that connects farmers directly with businesses and customers. 
                  Our platform facilitates the buying and selling of agricultural products through transparent and fair trading practices.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate and complete information during registration</li>
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Not engage in fraudulent or deceptive practices</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Not post harmful, offensive, or inappropriate content</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Product Listings</h2>
                <p className="leading-relaxed mb-4">
                  Farmers and sellers are responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Accurate product descriptions and pricing</li>
                  <li>Quality assurance of listed products</li>
                  <li>Timely fulfillment of orders</li>
                  <li>Compliance with food safety regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Payment Terms</h2>
                <p className="leading-relaxed">
                  All transactions are processed through our secure payment gateway. 
                  Payments are released to sellers upon successful delivery and confirmation by the buyer. 
                  Platform fees are charged as per the agreed commission structure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Dispute Resolution</h2>
                <p className="leading-relaxed">
                  In case of disputes, ASWAMITHRA will act as a mediator to resolve conflicts between buyers and sellers. 
                  Final decisions will be made based on evidence provided by both parties and platform policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
                <p className="leading-relaxed">
                  ASWAMITHRA shall not be liable for any indirect, incidental, special, or consequential damages 
                  resulting from the use or inability to use our service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
                <p className="leading-relaxed">
                  We reserve the right to terminate or suspend access to our service immediately, 
                  without prior notice or liability, for any reason whatsoever, including without limitation 
                  if you breach the Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
                <p className="leading-relaxed">
                  We reserve the right to modify or replace these Terms at any time. 
                  If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
                <p className="leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">Email: support@aswamithra.com</p>
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

export default TermsOfService;
