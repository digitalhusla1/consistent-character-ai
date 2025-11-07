import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full text-center py-6 md:py-8">
      <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
        Consistent Character AI
      </h1>
      <p className="text-gray-400 mt-3 max-w-2xl mx-auto text-sm sm:text-base">
        Upload an image, describe your desired changes, and watch the AI bring your vision to life. Perfect for creating consistent characters in different settings.
      </p>
    </header>
  );
};

export default Header;