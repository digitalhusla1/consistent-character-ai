import React from 'react';
import { User } from '../types';
import { UserIcon } from './icons/UserIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { LogoutIcon } from './icons/LogoutIcon';


interface HeaderProps {
    user?: User | null;
    onLogout?: () => void;
    onAddBalance?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onAddBalance }) => {
  return (
    <header className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center py-6 md:py-8 gap-4">
      <div className="text-center sm:text-left">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Consistent Character AI
          </h1>
          { !user && (
            <p className="text-gray-400 mt-3 max-w-2xl mx-auto text-sm sm:text-base">
                Upload an image, describe your desired changes, and watch the AI bring your vision to life. Perfect for creating consistent characters in different settings.
            </p>
          )}
      </div>
      {user && (
         <div className="flex items-center gap-2 sm:gap-4">
             <div className="hidden sm:flex items-center gap-4 text-sm">
                 <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                    <UserIcon className="w-5 h-5 text-gray-400"/>
                    <span className="font-medium">{user.username}</span>
                 </div>
                 <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                    <CreditCardIcon className="w-5 h-5 text-gray-400"/>
                    <span className="font-medium">{user.balance.toFixed(2)} Credits</span>
                 </div>
             </div>
             <button
                 onClick={onAddBalance}
                 className="flex items-center gap-2 px-3 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-200 text-sm"
                 title="Add 10 credits"
             >
                 <PlusCircleIcon className="w-5 h-5" />
                 <span className="hidden sm:inline">Add Credits</span>
             </button>
             <button
                 onClick={onLogout}
                 className="flex items-center gap-2 px-3 py-2 font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-200 text-sm"
                 aria-label="Logout"
                 title="Logout"
             >
                 <LogoutIcon className="w-5 h-5" />
             </button>
         </div>
      )}
    </header>
  );
};

export default Header;
