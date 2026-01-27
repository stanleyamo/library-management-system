import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionService } from '../services/transactionService';
import { formatDate } from '../utils/formatDate';
import { getDaysUntilDue, calculateFine } from '../utils/calculateFine';
import LoadingSpinner from '../components/LoadingSpinner';
import ProtectedRoute from '../components/ProtectedRoute';

const MyBooks = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [returning, setReturning] = useState(null);

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        setLoading(true);
        try {
            const result = await transactionService.getMyTransactions(user.id);
            if (result.success) {
                setTransactions(result.transactions);
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async (transactionId) => {
        if (!confirm('Are you sure you want to return this book?')) {
            return;
        }

        setReturning(transactionId);
        try {
            const result = await transactionService.returnBook(transactionId);
            if (result.success) {
                await loadTransactions();
                alert('Book returned successfully!');
            } else {
                alert(result.error || 'Failed to return book');
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        } finally {
            setReturning(null);
        }
    };

    const activeBooks = transactions.filter(t => t.status === 'active');
    const returnedBooks = transactions.filter(t => t.status === 'returned');

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">My Books</h1>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : (
                        <>
                            {/* Active Borrowings */}
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Currently Borrowed ({activeBooks.length})
                                </h2>
                                {activeBooks.length > 0 ? (
                                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Book
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Borrowed Date
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Due Date
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Fine
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {activeBooks.map(transaction => {
                                                    const daysUntilDue = getDaysUntilDue(transaction.dueDate);
                                                    const isOverdue = daysUntilDue < 0;
                                                    const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;
                                                    // Automatically calculate fine for overdue books
                                                    const currentFine = isOverdue ? parseFloat(calculateFine(transaction.dueDate)) : 0;

                                                    return (
                                                        <tr key={transaction.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {transaction.bookTitle}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {formatDate(transaction.borrowDate)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {formatDate(transaction.dueDate)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {isOverdue ? (
                                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                                        Overdue ({Math.abs(daysUntilDue)} days)
                                                                    </span>
                                                                ) : isDueSoon ? (
                                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                                        Due Soon ({daysUntilDue} days)
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                                        Active ({daysUntilDue} days left)
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                {isOverdue ? (
                                                                    <span className="font-semibold text-red-600">
                                                                        ${currentFine.toFixed(2)}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-400">$0.00</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                <button
                                                                    onClick={() => handleReturn(transaction.id)}
                                                                    disabled={returning === transaction.id}
                                                                    className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                                                >
                                                                    {returning === transaction.id ? 'Returning...' : 'Return'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                                        <p className="text-gray-500">You don't have any active borrowings.</p>
                                    </div>
                                )}
                            </div>

                            {/* Returned Books */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Returned Books ({returnedBooks.length})
                                </h2>
                                {returnedBooks.length > 0 ? (
                                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Book
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Borrowed Date
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Returned Date
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Fine
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {returnedBooks.map(transaction => (
                                                    <tr key={transaction.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {transaction.bookTitle}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDate(transaction.borrowDate)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDate(transaction.returnDate)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            ${transaction.fine || '0.00'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                                        <p className="text-gray-500">No returned books yet.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default MyBooks;
