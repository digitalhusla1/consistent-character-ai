import React, { useState } from 'react';

interface AuthPageProps {
    onLogin: (username, password) => Promise<{ success: boolean, message: string }>;
    onRegister: (username, password) => Promise<{ success: boolean, message: string }>;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setIsLoading(true);

        const action = isLoginView ? onLogin : onRegister;
        try {
            const result = await action(username, password);
            
            if (!result.success) {
                setError(result.message);
            } else {
                setMessage(result.message);
                // Parent component will handle redirect on successful login/register
            }
        } catch (e) {
            console.error("Authentication error:", e);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Consistent Character AI
                    </h1>
                    <p className="text-gray-400 mt-2">
                        {isLoginView ? 'Welcome back! Please log in.' : 'Create an account to get started.'}
                    </p>
                </div>

                <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400
                                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="password"
                                   className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400
                                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>
                        
                        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                        {message && <p className="text-sm text-green-400 text-center">{message}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
                            >
                                {isLoading ? 'Processing...' : (isLoginView ? 'Log In' : 'Register')}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsLoginView(!isLoginView);
                                setError(null);
                                setMessage(null);
                            }}
                            className="text-sm text-purple-400 hover:text-purple-300 font-medium"
                        >
                            {isLoginView ? "Don't have an account? Register" : 'Already have an account? Log In'}
                        </button>
                    </div>
                </div>
                 <p className="text-center text-xs text-gray-500 mt-6">
                    Note: This is a demo. All user data is simulated in your browser's local storage and is not secure.
                 </p>
            </div>
        </div>
    );
};