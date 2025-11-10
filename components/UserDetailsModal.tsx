import React, { useState, useEffect } from 'react';
import { User, Transaction } from '../types';
import { XCircleIcon } from './icons/XCircleIcon';
import { BanIcon } from './icons/BanIcon';
import { UnlockIcon } from './icons/UnlockIcon';

interface AdminFunctions {
    updateUserBalanceByAdmin: (username: string, amount: number) => boolean;
    updateUserStatus: (username: string, status: 'approved' | 'blocked') => boolean;
    getUserTransactions: (username: string) => Transaction[];
}

interface UserDetailsModalProps {
    user: Omit<User, 'role'>;
    onClose: () => void;
    adminFunctions: AdminFunctions;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose, adminFunctions }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [balanceInput, setBalanceInput] = useState('');

    useEffect(() => {
        try {
            setTransactions(adminFunctions.getUserTransactions(user.username));
        } catch(e) {
            console.error("Failed to get user transactions", e);
            alert("Error: Could not load transaction history.");
        }
    }, [user, adminFunctions]);

    const handleAddBalance = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const amount = parseFloat(balanceInput);
            if (isNaN(amount)) {
                alert("Please enter a valid number.");
                return;
            }
            if(adminFunctions.updateUserBalanceByAdmin(user.username, amount)) {
                setBalanceInput('');
                alert(`Successfully added ${amount} credits to ${user.username}.`);
                onClose(); // Close and force dashboard refresh
            } else {
                alert("Failed to update user balance.");
            }
        } catch (err) {
            console.error("Failed to add balance:", err);
            alert("An unexpected error occurred.");
        }
    };
    
    const handleUpdateStatus = (status: 'approved' | 'blocked') => {
        try {
            if(adminFunctions.updateUserStatus(user.username, status)) {
                alert(`User ${user.username} has been ${status}.`);
                onClose(); // Close and force dashboard refresh
            } else {
                alert(`Failed to update user status to ${status}.`);
            }
        } catch(err) {
            console.error("Failed to update status:", err);
            alert("An unexpected error occurred.");
        }
    };

    const statusBadge = (status: string) => {
        const styles = {
            approved: 'bg-green-900 text-green-300',
            pending: 'bg-yellow-900 text-yellow-300',
            blocked: 'bg-red-900 text-red-300',
        };
        return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || ''}`}>{status}</span>;
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 w-full max-w-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors" aria-label="Close modal">
                    <XCircleIcon className="w-6 h-6" />
                </button>
                
                <h2 className="text-xl font-bold mb-4 text-purple-400">User Details: {user.username}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                        <p className="text-sm text-gray-400">Status</p>
                        <p className="text-lg font-semibold">{statusBadge(user.status)}</p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                        <p className="text-sm text-gray-400">Balance</p>
                        <p className="text-lg font-semibold">{user.balance.toFixed(2)} Credits</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <form onSubmit={handleAddBalance} className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="Add/Remove credits"
                            step="any"
                            value={balanceInput}
                            onChange={(e) => setBalanceInput(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                        />
                        <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold">Update</button>
                    </form>
                    <div className="flex items-center gap-2">
                        {user.status === 'blocked' ? (
                            <button onClick={() => handleUpdateStatus('approved')} className="w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-all">
                               <UnlockIcon className="w-5 h-5"/> Unblock User
                            </button>
                        ) : (
                             <button onClick={() => handleUpdateStatus('blocked')} className="w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all">
                               <BanIcon className="w-5 h-5"/> Block User
                            </button>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">Transaction History</h3>
                    <div className="max-h-64 overflow-y-auto bg-gray-900/50 rounded-lg p-2 custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase sticky top-0 bg-gray-900/50">
                                <tr>
                                    <th className="px-4 py-2">Date</th>
                                    <th className="px-4 py-2">Type</th>
                                    <th className="px-4 py-2">Amount</th>
                                    <th className="px-4 py-2">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(tx => (
                                    <tr key={tx.id} className="border-b border-gray-700/50">
                                        <td className="px-4 py-2 text-gray-400 whitespace-nowrap">{new Date(tx.timestamp).toLocaleString()}</td>
                                        <td className={`px-4 py-2 font-semibold ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>{tx.type}</td>
                                        <td className="px-4 py-2">{tx.amount.toFixed(2)}</td>
                                        <td className="px-4 py-2">{tx.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {transactions.length === 0 && <p className="text-center py-4 text-gray-500">No transactions found.</p>}
                    </div>
                </div>
                 <style>{`
                    @keyframes fade-in {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    .animate-fade-in {
                        animation: fade-in 0.2s ease-out forwards;
                    }
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #4a5568; border-radius: 3px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #718096; }
                `}</style>
            </div>
        </div>
    );
};

export default UserDetailsModal;