// components/WhatsAppWidget.js - Fixed Version (No useEffect Issues)
'use client';

import React, { useState } from 'react';

const WhatsAppWidget = ({
  phoneNumber = "1234567890",
  companyName = "Support",
  message = "Hello! 👋🏼 \n\nWhat can we do for you?",
  replyTimeText = "Typically replies within a day",
  sendButtonText = "Send",
  inputPlaceHolder = "Type a message",
  open = false
}) => {
  const [isOpen, setIsOpen] = useState(open);
  const [userMessage, setUserMessage] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  // Simple mobile detection function (called when needed, not in useEffect)
  const isMobileDevice = () => {
    if (typeof window === 'undefined') return false;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /android|blackberry|iemobile|ipad|iphone|ipod|opera mini|webos/i.test(userAgent.toLowerCase());
  };

  // Exact WhatsApp official icon - same as the app
  const OfficialWhatsAppIcon = () => (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="whatsapp-bg" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#5EDC36"/>
          <stop offset="100%" stopColor="#25D366"/>
        </linearGradient>
      </defs>
      {/* Main circle background */}
      <circle cx="30" cy="30" r="30" fill="url(#whatsapp-bg)"/>
      {/* WhatsApp logo */}
      <path d="M30.667 13.333C22.333 13.333 15.667 20 15.667 28.333c0 2.667.667 5.167 1.833 7.334L15.667 46.667l11.167-2.833c2.167.833 4.5 1.333 7 1.333 8.333 0 15-6.667 15-15s-6.667-15-15.167-15zm8.666 21.334c-.333 1.5-1.833 2.667-3.167 3-.667.167-1.5.333-4.167-.833-2.833-1.333-4.833-4-5-4.167-.167-.167-1.167-1.5-1.167-2.833s.667-2 .833-2.333c.167-.333.5-.333.667-.333s.333 0 .5.017c.167 0 .333-.083.5.5.167.583.833 1.833.917 1.967.083.133.083.333-.083.5-.167.167-.167.333-.333.5-.167.167-.333.333-.167.583.167.25.667 1.167 1.5 1.917 1.083.917 2 1.25 2.333 1.417.333.167.5.083.667-.083.167-.167.667-.75.833-1 .167-.25.333-.167.5-.083.167.083 1.667.75 1.917.917.25.167.417.25.5.417.083.167.083.667-.25 1.333z" fill="white"/>
    </svg>
  );

  // Exact same icon for different sizes
  const WhatsAppIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id={`whatsapp-bg-${size}`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#5EDC36"/>
          <stop offset="100%" stopColor="#25D366"/>
        </linearGradient>
      </defs>
      <circle cx="30" cy="30" r="30" fill={`url(#whatsapp-bg-${size})`}/>
      <path d="M30.667 13.333C22.333 13.333 15.667 20 15.667 28.333c0 2.667.667 5.167 1.833 7.334L15.667 46.667l11.167-2.833c2.167.833 4.5 1.333 7 1.333 8.333 0 15-6.667 15-15s-6.667-15-15.167-15zm8.666 21.334c-.333 1.5-1.833 2.667-3.167 3-.667.167-1.5.333-4.167-.833-2.833-1.333-4.833-4-5-4.167-.167-.167-1.167-1.5-1.167-2.833s.667-2 .833-2.333c.167-.333.5-.333.667-.333s.333 0 .5.017c.167 0 .333-.083.5.5.167.583.833 1.833.917 1.967.083.133.083.333-.083.5-.167.167-.167.333-.333.5-.167.167-.333.333-.167.583.167.25.667 1.167 1.5 1.917 1.083.917 2 1.25 2.333 1.417.333.167.5.083.667-.083.167-.167.667-.75.833-1 .167-.25.333-.167.5-.083.167.083 1.667.75 1.917.917.25.167.417.25.5.417.083.167.083.667-.25 1.333z" fill="white"/>
    </svg>
  );

  // Close icon
  const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M12.854 3.146a.5.5 0 0 0-.708 0L8 7.293 3.854 3.146a.5.5 0 1 0-.708.708L7.293 8l-4.147 4.146a.5.5 0 0 0 .708.708L8 8.707l4.146 4.147a.5.5 0 0 0 .708-.708L8.707 8l4.147-4.146a.5.5 0 0 0 0-.708z"/>
    </svg>
  );

  // Send icon
  const SendIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M15.854.146a.5.5 0 0 1 .11.54L13.026 8.47a.5.5 0 0 1-.708.296L8.5 7.5l-.5 2-1.5-1.5L8.5 5.5l3.818-1.236a.5.5 0 0 1 .536.682z"/>
    </svg>
  );

  // Copy icon
  const CopyIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
      <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
    </svg>
  );

  // Phone icon
  const PhoneIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122L9.98 10.63c-.142.062-.3.055-.438-.02L7.05 8.122a.678.678 0 0 1-.02-.438l.2-1.805a.678.678 0 0 0-.122-.58L5.314 3.014a.678.678 0 0 0-.66-.686z"/>
    </svg>
  );

  const formatPhoneNumber = (phone) => {
    if (phone.length >= 10) {
      const country = phone.substring(0, phone.length - 10);
      const area = phone.substring(phone.length - 10, phone.length - 7);
      const first = phone.substring(phone.length - 7, phone.length - 4);
      const last = phone.substring(phone.length - 4);
      return `+${country} ${area} ${first} ${last}`;
    }
    return phone;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Copied to clipboard!');
    }
  };

  const openWhatsApp = () => {
    const fullMessage = message + (userMessage ? `\n\n${userMessage}` : '');
    const encodedMessage = encodeURIComponent(fullMessage);
    const isMobile = isMobileDevice(); // Call function when needed
    
    if (isMobile) {
      // Mobile: Try app first, then web as fallback
      try {
        // Try to open WhatsApp app
        window.location.href = `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`;
        
        // Fallback to web after short delay if app doesn't open
        setTimeout(() => {
          window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
        }, 1500);
      } catch (error) {
        // Direct fallback to web
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
      }
    } else {
      // PC: Show instructions for WhatsApp Web
      setShowInstructions(true);
    }
  };

  const openWhatsAppWeb = () => {
    const fullMessage = message + (userMessage ? `\n\n${userMessage}` : '');
    const encodedMessage = encodeURIComponent(fullMessage);
    const webUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
    window.open(webUrl, '_blank');
    setShowInstructions(false);
    setIsOpen(false);
    setUserMessage('');
  };

  const handleSendMessage = () => {
    openWhatsApp();
    const isMobile = isMobileDevice();
    if (isMobile) {
      setUserMessage('');
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowInstructions(false);
  };

  // Get device type for display purposes
  const isMobile = isMobileDevice();

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* PC Instructions Modal */}
      {showInstructions && (
        <div className="mb-4 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-[#25D366] text-white p-4 flex items-center justify-between">
            <h3 className="font-semibold text-sm">WhatsApp Options for PC</h3>
            <button onClick={() => setShowInstructions(false)} className="text-white/80 hover:text-white">
              <CloseIcon />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Option 1: WhatsApp Web (Recommended)</strong>
              </p>
              <p className="text-xs text-blue-600 mb-3">
                Opens WhatsApp in your browser. You'll need to scan a QR code with your phone.
              </p>
              <button
                onClick={openWhatsAppWeb}
                className="w-full bg-[#25D366] text-white px-4 py-2 rounded-lg hover:bg-[#128C7E] transition-colors flex items-center justify-center space-x-2"
              >
                <WhatsAppIcon size={20} />
                <span>Open WhatsApp Web</span>
              </button>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
              <p className="text-sm text-gray-800 mb-2">
                <strong>Option 2: Copy Details</strong>
              </p>
              
              <button
                onClick={() => copyToClipboard(phoneNumber)}
                className="w-full p-2 bg-white border border-gray-300 rounded flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <PhoneIcon />
                  <span className="text-sm">{formatPhoneNumber(phoneNumber)}</span>
                </div>
                <CopyIcon />
              </button>
              
              <button
                onClick={() => copyToClipboard(message + (userMessage ? `\n\n${userMessage}` : ''))}
                className="w-full p-2 bg-white border border-gray-300 rounded flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Copy Message</span>
                </div>
                <CopyIcon />
              </button>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                💡 <strong>Tip:</strong> For best experience on PC, make sure WhatsApp is installed on your phone and connected to internet.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && !showInstructions && (
        <div className="mb-4 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-[#25D366] text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <WhatsAppIcon size={40} />
              <div>
                <h3 className="font-semibold text-sm">{companyName}</h3>
                <p className="text-xs opacity-90">{replyTimeText}</p>
                {!isMobile && (
                  <p className="text-xs opacity-75">💻 PC detected</p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Message Area */}
          <div className="p-4 bg-gray-50 border-b">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-sm text-gray-700 whitespace-pre-line">{message}</p>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder={inputPlaceHolder}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                className="bg-[#25D366] text-white px-4 py-2 rounded-lg hover:bg-[#128C7E] transition-colors flex items-center justify-center min-w-[44px]"
              >
                <SendIcon />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {isMobile ? 
                "Click send to open WhatsApp app" : 
                "Click send for WhatsApp options"
              }
            </p>
          </div>
        </div>
      )}

      {/* Floating Button - Exact WhatsApp App Icon Size */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center relative group"
      >
        <OfficialWhatsAppIcon />
        
        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></div>
        
        {/* Tooltip */}
        <div className="absolute left-full ml-3 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {isMobile ? "Chat on WhatsApp" : "Contact us"}
        </div>
      </button>
    </div>
  );
};

export default WhatsAppWidget;