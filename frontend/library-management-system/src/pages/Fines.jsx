import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fineService } from '../services/fineService';
import { formatDate } from '../utils/formatDate';
import LoadingSpinner from '../components/LoadingSpinner';
import ProtectedRoute from '../components/ProtectedRoute';

const Fines = () => {
    const { user, isLibrarian } = useAuth();
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [paying, setPaying] = useState(null);

    useEffect(() => {
        loadFines();
    }, []);

    const loadFines = async () => {
        setLoading(true);
        try {
            const result = isLibrarian
                ? await fineService.getAllFines()
                : await fineService.getMyFines(user.id);

            if (result.success) {
                setFines(result.fines);
            }
        } catch (error) {
            console.error('Error loading fines:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayFine = async (fineId) => {
        if (!confirm('Are you sure you want to pay this fine?')) {
            return;
        }

        setPaying(fineId);
        try {
            const result = await fineService.payFine(fineId);
            if (result.success) {
                await loadFines();
                alert('Fine paid successfully!');
            } else {
                alert(result.error || 'Failed to pay fine');
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        } finally {
            setPaying(null);
        }
    };

    const filteredFines = filter === 'all'
        ? fines
        : fines.filter(f => f.status === filter);

    const totalPending = fines
        .filter(f => f.status === 'pending')
        .reduce((sum, fine) => sum + parseFloat(fine.amount), 0);

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Fines</h1>
                            {!isLibrarian && (
                                <p className="text-gray-600 mt-2">
                                    Total Outstanding: <span className="font-semibold text-red-600">${totalPending.toFixed(2)}</span>
                                </p>
                            )}
                        </div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="input-field w-auto"
                        >
                            <option value="all">All Fines</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : filteredFines.length > 0 ? (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {isLibrarian && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                        )}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Book
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Reason
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Due Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        {!isLibrarian && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredFines.map(fine => (
                                        <tr key={fine.id}>
                                            {isLibrarian && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {fine.userName}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {fine.bookTitle}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {fine.reason}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                ${fine.amount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(fine.dueDate)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${fine.status === 'paid'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {fine.status}
                                                </span>
                                            </td>
                                            {!isLibrarian && fine.status === 'pending' && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handlePayFine(fine.id)}
                                                        disabled={paying === fine.id}
                                                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                                    >
                                                        {paying === fine.id ? 'Processing...' : 'Pay Now'}
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <p className="text-gray-500">No fines found.</p>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default Fines;
