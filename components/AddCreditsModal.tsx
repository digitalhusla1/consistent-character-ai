import React, { useState } from 'react';
import { XCircleIcon } from './icons/XCircleIcon';

interface AddCreditsModalProps {
    onClose: () => void;
    onRequestDeposit: (amount: number) => Promise<{success: boolean, message: string}>;
}

const FAKE_USDT_ADDRESS = "0x1234...AbCdEfG...5678"; // Replace with a real address if needed

const AddCreditsModal: React.FC<AddCreditsModalProps> = ({ onClose, onRequestDeposit }) => {
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError("Please enter a valid, positive amount.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const result = await onRequestDeposit(numericAmount);
            if (result.success) {
                setSuccessMessage(result.message);
                setAmount('');
            } else {
                setError(result.message);
            }
        } catch (e) {
            console.error("Error requesting deposit:", e);
            setError("An unexpected error occurred while submitting your request.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const copyAddress = () => {
        try {
            navigator.clipboard.writeText(FAKE_USDT_ADDRESS).then(() => {
                alert("Address copied to clipboard!");
            });
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert("Failed to copy address.");
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 w-full max-w-lg relative animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close modal"
                >
                    <XCircleIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">Add Credits</h2>
                
                {!successMessage ? (
                    <>
                        <p className="text-gray-400 text-center mb-6 text-sm">To add credits, please send USDT or USDC to the address below. After sending, enter the amount and submit your request for approval.</p>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Deposit Address (ERC20)</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="text"
                                    readOnly
                                    value={FAKE_USDT_ADDRESS}
                                    className="w-full p-2 bg-gray-900 border border-gray-600 rounded-lg text-sm truncate"
                                />
                                <button onClick={copyAddress} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold">Copy</button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">Amount Sent (e.g., 50 for 50 credits)</label>
                            <input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="50"
                                required
                                min="1"
                                step="any"
                                className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                                disabled={isLoading}
                            />

                            {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
                            
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-6 py-3 px-4 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-600 transition-all"
                            >
                                {isLoading ? "Submitting..." : "Submit Deposit Request"}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center">
                        <p className="text-green-400 mb-4">{successMessage}</p>
                        <button onClick={onClose} className="w-full mt-6 py-3 px-4 font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700">Close</button>
                    </div>
                )}
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

export default AddCreditsModal;