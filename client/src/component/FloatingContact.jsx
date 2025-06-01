import React, { useState } from 'react';
import { FaWhatsapp, FaLinkedin, FaPhone, FaCommentDots } from 'react-icons/fa';
const FloatingContact = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-2 flex flex-col items-end space-y-2">
          <a
            href="https://wa.me/9873208210"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg"
          >
            <FaWhatsapp />
          </a>
          <a
            href="https://www.linkedin.com/company/target-trek/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
          >
            <FaLinkedin />
          </a>
          <a
            href="tel:+9873208210"
            className="bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-full shadow-lg"
          >
            <FaPhone />
          </a>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg"
      >
        <FaCommentDots />
      </button>
    </div>
  );
};
export default FloatingContact;
