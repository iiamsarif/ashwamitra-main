import React, { useState } from "react";
import { UserRole } from "@/context/AuthContext";
import AuthForm from "@/components/auth/AuthForm";
import Hero from "./landingPage/Hero";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import Navbar from "./landingPage/Navbar";
import HowItWorks from "./landingPage/HowItWorks";
import FarmerSection from "./landingPage/FarmerSection";
import Footer from "./landingPage/Footer";
import AboutUs from "./landingPage/AboutUs";
import WhyChooseUs from "./landingPage/WhyChooseUs";

const LandingPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  if (selectedRole) {
    return (
      <AuthForm
        role={selectedRole}
        onBack={() => setSelectedRole(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar/>
      <Hero/>
      <HowItWorks/>
      <FarmerSection onSelectRole={setSelectedRole}/>
      <AboutUs/>
      <WhyChooseUs/>
      <Footer onSelectRole={setSelectedRole}/>
      
      {/* WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
};

export default LandingPage;
