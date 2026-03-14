import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X } from 'lucide-react';

type WhatsAppButtonProps = {
  phoneNumber?: string;
  message?: string;
};

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = '+919876543210',
  message = 'Hello! I would like to know more about your fresh produce delivery service.'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(true);
  const whatsappRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hide on scroll down, show on scroll up
    let lastScrollY = window.scrollY;
    let isScrollingDown = false;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine scroll direction
      if (currentScrollY > lastScrollY) {
        isScrollingDown = true;
      } else {
        isScrollingDown = false;
      }
      
      // Hide when scrolling down, show when scrolling up or near top
      if (isScrollingDown && currentScrollY > 150) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (whatsappRef.current && !whatsappRef.current.contains(event.target as Node)) {
        setIsMinimized(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^\d]/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const toggleChat = () => {
    setIsMinimized(!isMinimized);
  };

  const closeChat = () => {
    setIsMinimized(true);
  };

  if (!isVisible) return null;

  return (
    <div ref={whatsappRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Minimized State */}
      {isMinimized ? (
        <button
          onClick={toggleChat}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 group"
          aria-label="Open WhatsApp chat"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-8 -right-2 bg-yellow-400 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Chat with us!
          </span>
        </button>
      ) : (
        /* Expanded State */
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-green-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">WhatsApp Support</span>
            </div>
            <button
              onClick={closeChat}
              className="text-white hover:bg-green-600 rounded-lg p-1 transition-colors duration-200"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <div className="text-sm text-gray-600">
              <p className="mb-2">🌱 Need help with your fresh produce order?</p>
              <p className="mb-2">🚚 Have questions about delivery?</p>
              <p>💬 Chat with our support team instantly!</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleWhatsAppClick}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Start WhatsApp Chat
              </button>

              <div className="text-xs text-gray-500 text-center">
                <p>Available: 8 AM - 8 PM</p>
                <p>Typically replies within 5 minutes</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppButton;
