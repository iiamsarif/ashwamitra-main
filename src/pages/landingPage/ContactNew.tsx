import React from 'react';
import ContactUs from '../../pages/ContactUs';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from '@/components/common/WhatsAppButton';
import MenuBar from '@/components/layout/MenuBar';

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <MenuBar />
      <div className="pt-32">
        <ContactUs />
      </div>
      <Footer onSelectRole={() => {}} />
      <WhatsAppButton />
    </div>
  );
};

export default Contact;
