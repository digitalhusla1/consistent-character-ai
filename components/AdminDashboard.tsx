import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, DepositRequest, Transaction } from '../types';
import Header from './Header';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { UserIcon } from './icons/UserIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { BanIcon } from './icons/BanIcon';
import { UnlockIcon } from './icons/UnlockIcon';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import UserDetailsModal from './UserDetailsModal';
import AdminAddCreditsModal from './AdminAddCreditsModal';

type UserFilter = 'all' | 'pending' | 'approved' | 'blocked';
type DepositFilter = 'all' | 'pending' | 'approved' | 'rejected';
type SortDirection = 'asc' | 'desc';
type UserSortKey = 'username' | 'status' | 'balance';
type DepositSortKey = 'username' | 'amount' | 'timestamp';

interface AdminFunctions {
    getAllUsers: () => Omit<User, 'role'>[];
    getAllDepositRequests: () => DepositRequest[];
    approveUser: (username: string) => boolean;
    approveDepositRequest: (requestId: string) => boolean;
    rejectDepositRequest: (requestId: string) => boolean;
    updateUserBalanceByAdmin: (username: string, amount: number) => boolean;
    updateUserStatus: (username: string, status: 'approved' | 'blocked') => boolean;
    getUserTransactions: (username: string) => Transaction[];
}

interface AdminDashboardProps {
    user: User;
    onLogout: () => void;
    adminFunctions: AdminFunctions;
}

const SortableHeader: React.FC<{
    title: string;
    sortKey: UserSortKey | DepositSortKey;
    currentSortKey: UserSortKey | DepositSortKey;
    direction: SortDirection;
    onClick: (key: any) => void;
}> = ({ title, sortKey, currentSortKey, direction, onClick }) => (
    <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => onClick(sortKey)}>
        <div className="flex items-center gap-1">
            {title}
            {currentSortKey === sortKey && (direction === 'asc' ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />)}
        </div>
    </th>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout, adminFunctions }) => {
    const [allUsers, setAllUsers] = useState<Omit<User, 'role'>[]>([]);
    const [allRequests, setAllRequests] = useState<DepositRequest[]>([]);
    const [userFilter, setUserFilter] = useState<UserFilter>('all');
    const [depositFilter, setDepositFilter] = useState<DepositFilter>('pending');
    
    const [userSortConfig, setUserSortConfig] = useState<{ key: UserSortKey, direction: SortDirection }>({ key: 'username', direction: 'asc' });
    const [depositSortConfig, setDepositSortConfig] = useState<{ key: DepositSortKey, direction: SortDirection }>({ key: 'timestamp', direction: 'desc' });

    const [selectedUser, setSelectedUser] = useState<Omit<User, 'role'> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAdminAddCreditsModalOpen, setIsAdminAddCreditsModalOpen] = useState(false);

    const fetchData = useCallback(() => {
        try {
            setAllUsers(adminFunctions.getAllUsers());
            setAllRequests(adminFunctions.getAllDepositRequests());
        } catch (e) {
            console.error("Failed to fetch admin data:", e);
            alert("Error: Could not fetch dashboard data. Your session data might be corrupted.");
        }
    }, [adminFunctions]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAction = (action: (param: any) => boolean, param: any, successMessage?: string) => {
        try {
            if (action(param)) {
                if (successMessage) alert(successMessage);
                fetchData();
            } else {
                alert('Operation failed. The user or request may no longer exist or the state is invalid.');
            }
        } catch (e) {
            console.error("Admin action failed:", e);
            alert("An unexpected error occurred while performing the action.");
        }
    };
    
    const openUserDetails = (user: Omit<User, 'role'>) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const closeUserDetails = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
        fetchData(); // Refresh data when closing modal
    };
    
    const closeAdminAddCreditsModal = () => {
        setIsAdminAddCreditsModalOpen(false);
        fetchData();
    };

    const sortedAndFilteredUsers = useMemo(() => {
        let filtered = allUsers.filter(u => userFilter === 'all' || u.status === userFilter);
        return [...filtered].sort((a, b) => {
            const key = userSortConfig.key;
            if (a[key] < b[key]) return userSortConfig.direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return userSortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [allUsers, userFilter, userSortConfig]);

    const sortedAndFilteredRequests = useMemo(() => {
        let filtered = allRequests.filter(r => depositFilter === 'all' || r.status === depositFilter);
        return [...filtered].sort((a, b) => {
            const key = depositSortConfig.key;
            if (a[key] < b[key]) return depositSortConfig.direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return depositSortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [allRequests, depositFilter, depositSortConfig]);
    
    const requestSort = (key: UserSortKey | DepositSortKey, type: 'user' | 'deposit') => {
        const config = type === 'user' ? userSortConfig : depositSortConfig;
        const setConfig = type === 'user' ? setUserSortConfig : setDepositSortConfig;
        
        let direction: SortDirection = 'asc';
        if (config.key === key && config.direction === 'asc') {
            direction = 'desc';
        }
        setConfig({ key: key as any, direction });
    };

    const statusBadge = (status: string) => {
        const styles = {
            approved: 'bg-green-900 text-green-300',
            pending: 'bg-yellow-900 text-yellow-300',
            blocked: 'bg-red-900 text-red-300',
            rejected: 'bg-gray-700 text-gray-300',
        };
        return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || ''}`}>{status}</span>;
    };
    
    const FilterButtons: React.FC<{ options: any[], active: string, setActive: (val: any) => void }> = ({options, active, setActive}) => (
        <div className="flex items-center gap-2 mb-4">
            {options.map(opt => (
                <button 
                    key={opt} 
                    onClick={() => setActive(opt)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${active === opt ? 'bg-purple-600 text-white font-semibold' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                >{opt.charAt(0).toUpperCase() + opt.slice(1)}</button>
            ))}
        </div>
    );

    return (
        <>
            <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
                <Header user={user} onLogout={onLogout} onAddBalance={() => setIsAdminAddCreditsModalOpen(true)} />
                <main className="w-full max-w-7xl mt-4">
                    <h2 className="text-2xl font-bold mb-6 text-purple-400">Admin Dashboard</h2>
                    
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* User Management */}
                        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><UserIcon className="w-6 h-6 text-gray-400" /> User Management</h3>
                            <FilterButtons options={['all', 'pending', 'approved', 'blocked']} active={userFilter} setActive={setUserFilter} />
                            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-400 uppercase bg-gray-900/50 sticky top-0">
                                        <tr>
                                            <SortableHeader title="Username" sortKey="username" currentSortKey={userSortConfig.key} direction={userSortConfig.direction} onClick={(k) => requestSort(k, 'user')} />
                                            <SortableHeader title="Status" sortKey="status" currentSortKey={userSortConfig.key} direction={userSortConfig.direction} onClick={(k) => requestSort(k, 'user')} />
                                            <SortableHeader title="Balance" sortKey="balance" currentSortKey={userSortConfig.key} direction={userSortConfig.direction} onClick={(k) => requestSort(k, 'user')} />
                                            <th scope="col" className="px-4 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedAndFilteredUsers.map(u => (
                                            <tr key={u.username} className="border-b border-gray-700 hover:bg-gray-800 cursor-pointer" onClick={() => openUserDetails(u)}>
                                                <td className="px-4 py-3 font-medium whitespace-nowrap">{u.username}</td>
                                                <td className="px-4 py-3">{statusBadge(u.status)}</td>
                                                <td className="px-4 py-3">{u.balance.toFixed(2)}</td>
                                                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                    {u.status === 'pending' ? (
                                                        <button onClick={() => handleAction(adminFunctions.approveUser, u.username)} className="flex items-center gap-1 text-green-400 hover:text-green-300 font-semibold text-xs">
                                                            <CheckCircleIcon className="w-4 h-4"/> Approve
                                                        </button>
                                                    ) : u.status === 'blocked' ? (
                                                        <button onClick={() => handleAction(adminFunctions.updateUserStatus, { username: u.username, status: 'approved' })} className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 font-semibold text-xs">
                                                          <UnlockIcon className="w-4 h-4"/> Unblock
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleAction(adminFunctions.updateUserStatus, { username: u.username, status: 'blocked' })} className="flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold text-xs">
                                                          <BanIcon className="w-4 h-4"/> Block
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {sortedAndFilteredUsers.length === 0 && <p className="text-center py-4 text-gray-500">No users match filters.</p>}
                            </div>
                        </div>
                        
                        {/* Deposit Requests */}
                        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><CreditCardIcon className="w-6 h-6 text-gray-400" /> Deposit History</h3>
                            <FilterButtons options={['pending', 'approved', 'rejected', 'all']} active={depositFilter} setActive={setDepositFilter} />
                            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-400 uppercase bg-gray-900/50 sticky top-0">
                                        <tr>
                                            <SortableHeader title="Username" sortKey="username" currentSortKey={depositSortConfig.key} direction={depositSortConfig.direction} onClick={(k) => requestSort(k, 'deposit')} />
                                            <SortableHeader title="Amount" sortKey="amount" currentSortKey={depositSortConfig.key} direction={depositSortConfig.direction} onClick={(k) => requestSort(k, 'deposit')} />
                                            <SortableHeader title="Date" sortKey="timestamp" currentSortKey={depositSortConfig.key} direction={depositSortConfig.direction} onClick={(k) => requestSort(k, 'deposit')} />
                                            <th scope="col" className="px-4 py-3">Status/Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedAndFilteredRequests.map(req => (
                                            <tr key={req.id} className="border-b border-gray-700 hover:bg-gray-800">
                                                <td className="px-4 py-3 font-medium whitespace-nowrap">{req.username}</td>
                                                <td className="px-4 py-3">{req.amount.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-gray-400">{new Date(req.timestamp).toLocaleString()}</td>
                                                <td className="px-4 py-3">
                                                    {req.status === 'pending' ? (
                                                        <div className="flex items-center gap-2">
                                                          <button onClick={() => handleAction(adminFunctions.approveDepositRequest, req.id)} className="p-1.5 text-green-400 hover:text-green-300" title="Approve"><CheckCircleIcon className="w-5 h-5"/></button>
                                                          <button onClick={() => window.confirm("Are you sure you want to reject this request?") && handleAction(adminFunctions.rejectDepositRequest, req.id)} className="p-1.5 text-red-400 hover:text-red-300" title="Reject"><XCircleIcon className="w-5 h-5"/></button>
                                                        </div>
                                                    ) : statusBadge(req.status)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {sortedAndFilteredRequests.length === 0 && <p className="text-center py-4 text-gray-500">No deposit requests match filters.</p>}
                            </div>
                        </div>
                    </div>
                </main>
                <style>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #4a5568; border-radius: 3px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #718096; }
                `}</style>
            </div>
            {isModalOpen && selectedUser && (
                <UserDetailsModal 
                    user={selectedUser} 
                    onClose={closeUserDetails} 
                    adminFunctions={adminFunctions}
                />
            )}
            {isAdminAddCreditsModalOpen && (
                <AdminAddCreditsModal
                    onClose={closeAdminAddCreditsModal}
                    users={allUsers}
                    onAddCredits={adminFunctions.updateUserBalanceByAdmin}
                />
            )}
        </>
    );
}

export default AdminDashboard;