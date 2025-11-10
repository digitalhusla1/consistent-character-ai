import { useState, useEffect, useCallback } from 'react';
import { User, DepositRequest, Transaction } from '../types';

const USERS_STORAGE_KEY = 'app-users';
const CURRENT_USER_STORAGE_KEY = 'app-current-user';
const DEPOSIT_REQUESTS_STORAGE_KEY = 'app-deposit-requests';
const TRANSACTIONS_STORAGE_KEY = 'app-transactions';

const initializeUsers = (): Record<string, any> => {
    try {
        const usersStr = localStorage.getItem(USERS_STORAGE_KEY);
        const users = usersStr ? JSON.parse(usersStr) : {};
        if (!users.admin) {
            users.admin = {
                password: 'admin',
                balance: 9999,
                role: 'admin',
                status: 'approved',
            };
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        }
        return users;
    } catch (e) {
        console.error("Failed to initialize users from localStorage", e);
        const users = {
            admin: {
                password: 'admin',
                balance: 9999,
                role: 'admin',
                status: 'approved',
            }
        };
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        return users;
    }
};

// Helper functions to get/set data from localStorage
const getStoredData = <T>(key: string, defaultValue: T): T => {
    try {
        const dataStr = localStorage.getItem(key);
        return dataStr ? JSON.parse(dataStr) : defaultValue;
    } catch (e) {
        console.error(`Failed to read ${key} from localStorage`, e);
        return defaultValue;
    }
};

const setStoredData = <T>(key: string, data: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Failed to write ${key} to localStorage`, e);
    }
};


export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredData(CURRENT_USER_STORAGE_KEY, null));

    useEffect(() => {
        if (currentUser) {
            setStoredData(CURRENT_USER_STORAGE_KEY, currentUser);
        } else {
            localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        }
    }, [currentUser]);

    const logTransaction = useCallback((username: string, type: 'credit' | 'debit', amount: number, description: string) => {
        const transactions = getStoredData<Transaction[]>(TRANSACTIONS_STORAGE_KEY, []);
        const newTransaction: Transaction = {
            id: `${Date.now()}-${username}-${Math.random()}`,
            username,
            type,
            amount,
            description,
            timestamp: Date.now(),
        };
        setStoredData(TRANSACTIONS_STORAGE_KEY, [newTransaction, ...transactions]);
    }, []);

    const login = useCallback(async (username, password): Promise<{ success: boolean, message: string }> => {
        const users = initializeUsers();
        const userData = users[username];

        if (!userData || userData.password !== password) {
            return { success: false, message: 'Invalid username or password.' };
        }
        if (userData.status === 'pending') {
            return { success: false, message: 'Your account is pending approval by an administrator.' };
        }
        if (userData.status === 'blocked') {
            return { success: false, message: 'Your account has been blocked. Please contact support.' };
        }
        
        const user: User = { username, balance: userData.balance, role: userData.role, status: userData.status };
        setCurrentUser(user);
        return { success: true, message: 'Login successful!' };
    }, []);

    const register = useCallback(async (username, password): Promise<{ success: boolean, message: string }> => {
        const users = initializeUsers();
        if (username === 'admin' || !username) {
             return { success: false, message: 'This username is reserved or invalid.' };
        }
        if (users[username]) {
            return { success: false, message: 'Username already exists.' };
        }
        if (password.length < 4) {
            return { success: false, message: 'Password must be at least 4 characters long.' };
        }
        const newUser = { password, balance: 0, role: 'user', status: 'pending' };
        users[username] = newUser;
        setStoredData(USERS_STORAGE_KEY, users);
        return { success: true, message: 'Registration successful! Your account is now pending approval.' };
    }, []);

    const logout = useCallback(() => {
        setCurrentUser(null);
    }, []);
    
    const updateUserBalance = useCallback((username: string, newBalance: number, description?: string, amountChanged?: number) => {
        const users = initializeUsers();
        if (users[username]) {
            const oldBalance = users[username].balance;
            const finalAmountChanged = amountChanged ?? newBalance - oldBalance;
            
            users[username].balance = newBalance;
            setStoredData(USERS_STORAGE_KEY, users);

            if (finalAmountChanged !== 0 && description) {
                logTransaction(username, finalAmountChanged > 0 ? 'credit' : 'debit', Math.abs(finalAmountChanged), description);
            }

            if (currentUser && currentUser.username === username) {
                setCurrentUser(prev => prev ? { ...prev, balance: newBalance } : null);
            }
        }
    }, [currentUser, logTransaction]);
    
    const chargeForGeneration = useCallback(async (cost: number): Promise<{success: boolean, message: string}> => {
        if (!currentUser) return {success: false, message: "Not logged in."};
        if (currentUser.balance < cost) {
            return {success: false, message: `Insufficient balance. You need ${cost} credit(s). Your balance is ${currentUser.balance.toFixed(2)}.`};
        }
        const newBalance = currentUser.balance - cost;
        updateUserBalance(currentUser.username, newBalance, 'Image Generation', -cost);
        return {success: true, message: "Charge successful"};

    }, [currentUser, updateUserBalance]);

    // --- Admin Functions ---

    const getAllUsers = useCallback((): Omit<User, 'role'>[] => {
        if (currentUser?.role !== 'admin') return [];
        const users = initializeUsers();
        return Object.entries(users)
            .filter(([username]) => username !== 'admin')
            .map(([username, data]) => ({
                username,
                balance: data.balance,
                status: data.status,
            }));
    }, [currentUser]);

    const approveUser = useCallback((username: string): boolean => {
        if (currentUser?.role !== 'admin') return false;
        const users = initializeUsers();
        if (users[username] && users[username].status === 'pending') {
            users[username].status = 'approved';
            const startingCredits = 10;
            users[username].balance = startingCredits;
            setStoredData(USERS_STORAGE_KEY, users);
            logTransaction(username, 'credit', startingCredits, 'Account approved - Welcome bonus');
            return true;
        }
        return false;
    }, [currentUser, logTransaction]);
    
    const updateUserStatus = useCallback((username: string, status: 'approved' | 'blocked'): boolean => {
        if (currentUser?.role !== 'admin') return false;
        const users = initializeUsers();
        if (users[username]) {
            users[username].status = status;
            setStoredData(USERS_STORAGE_KEY, users);
            return true;
        }
        return false;
    }, [currentUser]);

    const updateUserBalanceByAdmin = useCallback((username: string, amountToAdd: number): boolean => {
        if (currentUser?.role !== 'admin' || isNaN(amountToAdd)) return false;
        const users = initializeUsers();
        if (users[username]) {
            const newBalance = (users[username].balance || 0) + amountToAdd;
            updateUserBalance(username, newBalance, 'Manual credit by admin', amountToAdd);
            return true;
        }
        return false;
    }, [currentUser, updateUserBalance]);

    const getAllDepositRequests = useCallback((): DepositRequest[] => {
         if (currentUser?.role !== 'admin') return [];
         return getStoredData(DEPOSIT_REQUESTS_STORAGE_KEY, []);
    }, [currentUser]);

    const requestDeposit = useCallback((username: string, amount: number): {success: boolean, message: string} => {
        if (amount <= 0) return {success: false, message: 'Amount must be positive.'};
        const requests = getStoredData<DepositRequest[]>(DEPOSIT_REQUESTS_STORAGE_KEY, []);
        const newRequest: DepositRequest = {
            id: `${Date.now()}-${username}`,
            username,
            amount,
            timestamp: Date.now(),
            status: 'pending'
        };
        setStoredData(DEPOSIT_REQUESTS_STORAGE_KEY, [newRequest, ...requests]);
        return {success: true, message: 'Your deposit request has been submitted and is pending admin approval.'};
    }, []);

    const approveDepositRequest = useCallback((requestId: string): boolean => {
        if (currentUser?.role !== 'admin') return false;
        let requests = getStoredData<DepositRequest[]>(DEPOSIT_REQUESTS_STORAGE_KEY, []);
        const request = requests.find(r => r.id === requestId);
        if (request && request.status === 'pending') {
            updateUserBalanceByAdmin(request.username, request.amount);
            request.status = 'approved';
            setStoredData(DEPOSIT_REQUESTS_STORAGE_KEY, requests);
            return true;
        }
        return false;
    }, [currentUser, updateUserBalanceByAdmin]);

     const rejectDepositRequest = useCallback((requestId: string): boolean => {
        if (currentUser?.role !== 'admin') return false;
        let requests = getStoredData<DepositRequest[]>(DEPOSIT_REQUESTS_STORAGE_KEY, []);
        const request = requests.find(r => r.id === requestId);
        if (request && request.status === 'pending') {
            request.status = 'rejected';
            setStoredData(DEPOSIT_REQUESTS_STORAGE_KEY, requests);
            return true;
        }
        return false;
    }, [currentUser]);
    
    const getUserTransactions = useCallback((username: string): Transaction[] => {
        if (currentUser?.role !== 'admin') return [];
        const allTransactions = getStoredData<Transaction[]>(TRANSACTIONS_STORAGE_KEY, []);
        return allTransactions.filter(tx => tx.username === username);
    }, [currentUser]);
    
    return { 
        currentUser, login, register, logout, chargeForGeneration, requestDeposit,
        // Admin functions
        adminFunctions: {
            getAllUsers, 
            approveUser, 
            updateUserStatus,
            updateUserBalanceByAdmin, 
            getAllDepositRequests, 
            approveDepositRequest, 
            rejectDepositRequest,
            getUserTransactions,
        }
    };
};