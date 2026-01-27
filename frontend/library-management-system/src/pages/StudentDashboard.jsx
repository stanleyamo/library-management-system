import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { transactionService } from '../services/transactionService';
import { fineService } from '../services/fineService';
import { formatDate } from '../utils/formatDate';
import { getDaysUntilDue } from '../utils/calculateFine';
import LoadingSpinner from '../components/LoadingSpinner';
import ProtectedRoute from '../components/ProtectedRoute';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        activeBooks: 0,
        overdueBooks: 0,
        totalFines: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [transResult, finesResult] = await Promise.all([
                transactionService.getMyTransactions(user.id),
                fineService.getMyFines(user.id)
            ]);

            if (transResult.success) {
                const active = transResult.transactions.filter(t => t.status === 'active');
                const overdue = active.filter(t => {
                    const days = getDaysUntilDue(t.dueDate);
                    return days < 0;
                });

                setTransactions(active);
                setStats({
                    activeBooks: active.length,
                    overdueBooks: overdue.length,
                    totalFines: 0
                });
            }

            if (finesResult.success) {
                const pendingFines = finesResult.fines.filter(f => f.status === 'pending');
                const totalFines = pendingFines.reduce((sum, fine) => sum + parseFloat(fine.amount), 0);
                setFines(pendingFines);
                setStats(prev => ({ ...prev, totalFines }));
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <h1 className="text-4xl font-bold mb-2">
                            Welcome, {user?.name} 👋
                        </h1>
                        <h2 className="text-2xl font-semibold">
                            Library Management System Dashboard
                        </h2>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white  rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500 ">Active Books</p>
                                    <p className="text-2xl font-semibold text-gray-900 ">{stats.activeBooks}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white  rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-red-100  rounded-md p-3">
                                    <svg className="h-6 w-6 text-red-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500 ">Overdue Books</p>
                                    <p className="text-2xl font-semibold text-gray-900 ">{stats.overdueBooks}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white  rounded-lg shadow-md p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-yellow-100  rounded-md p-3">
                                    <svg className="h-6 w-6 text-yellow-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500 ">Outstanding Fines</p>
                                    <p className="text-2xl font-semibold text-gray-900 ">${stats.totalFines.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="bg-white  rounded-lg shadow-md p-6 mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 ">Currently Borrowed Books</h2>
                            <Link to="/my-books" className="text-blue-600  hover:text-blue-800  text-sm font-medium">
                                View All →
                            </Link>
                        </div>
                        {transactions.length > 0 ? (
                            <div className="space-y-4">
                                {transactions.slice(0, 5).map(transaction => {
                                    const days = getDaysUntilDue(transaction.dueDate);
                                    const isOverdue = days < 0;
                                    const isDueSoon = days <= 3 && days >= 0;

                                    return (
                                        <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50  rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900 ">{transaction.bookTitle}</p>
                                                <p className="text-sm text-gray-500 ">
                                                    Due: {formatDate(transaction.dueDate)}
                                                </p>
                                            </div>
                                            <div>
                                                {isOverdue ? (
                                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                        Overdue ({Math.abs(days)} days)
                                                    </span>
                                                ) : isDueSoon ? (
                                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                        Due Soon ({days} days)
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                        {days} days left
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500  text-center py-4">No active borrowings.</p>
                        )}
                    </div>


                    {fines.length > 0 && (
                        <div className="bg-white  rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 ">Pending Fines</h2>
                                <Link to="/fines" className="text-blue-600  hover:text-blue-800  text-sm font-medium">
                                    View All →
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {fines.map(fine => (
                                    <div key={fine.id} className="flex items-center justify-between p-4 bg-yellow-50  rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900 ">{fine.bookTitle}</p>
                                            <p className="text-sm text-gray-500 ">{fine.reason}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-yellow-800 ">${fine.amount}</p>
                                            <Link to="/fines" className="text-sm text-blue-600  hover:underline">
                                                Pay Now
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default StudentDashboard;
