import React, { useState } from 'react';
import { User } from '../types';
import { XCircleIcon } from './icons/XCircleIcon';

interface AdminAddCreditsModalProps {
    onClose: () => void;
    users: Omit<User, 'role'>[];
    onAddCredits: (username: string, amount: number) => boolean;
}

const AdminAddCreditsModal: React.FC<AdminAddCreditsModalProps> = ({ onClose, users, onAddCredits }) => {
    const [selectedUser, setSelectedUser] = useState<string>(users[0]?.username || '');
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (!selectedUser) {
            setError("Please select a user.");
            return;
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) {
            setError("Please enter a valid amount.");
            return;
        }

        setIsLoading(true);

        try {
            const success = onAddCredits(selectedUser, numericAmount);
            if (success) {
                alert(`Successfully updated balance for ${selectedUser}.`);
                onClose(); // This will trigger a refresh in the dashboard
            } else {
                setError(`Failed to update balance for ${selectedUser}.`);
            }
        } catch (e) {
            console.error("Error adding credits:", e);
            setError("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 w-full max-w-md relative animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close modal"
                >
                    <XCircleIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">Admin: Add Credits</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="user-select" className="block text-sm font-medium text-gray-300 mb-2">Select User</label>
                        <select
                            id="user-select"
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                            disabled={isLoading}
                        >
                            <option value="" disabled>-- Select a user --</option>
                            {users.map(user => (
                                <option key={user.username} value={user.username}>{user.username} ({user.balance.toFixed(2)} credits)</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">Amount to Add/Remove</label>
                        <input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="e.g., 50 or -10"
                            required
                            step="any"
                            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                            disabled={isLoading}
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
                    
                    <button
                        type="submit"
                        disabled={isLoading || !selectedUser}
                        className="w-full mt-4 py-3 px-4 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-600 transition-all"
                    >
                        {isLoading ? "Updating..." : "Update User Balance"}
                    </button>
                </form>
                 <style>{`
                    @keyframes fade-in {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .animate-fade-in {
                        animation: fade-in 0.2s ease-out forwards;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default AdminAddCreditsModal;