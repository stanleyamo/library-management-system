import { useState, useMemo } from 'react';
import { formatDate } from '../utils/formatDate';

const BorrowConfirmationModal = ({ isOpen, onClose, book, onConfirm, borrowing }) => {
    const [borrowPeriod, setBorrowPeriod] = useState('2weeks');
    const [extendedDays, setExtendedDays] = useState(31);

    // Always defined (safe)
    const today = new Date();
    const borrowDate = today;

    const { dueDate, daysToBorrow, calculatedExtendedFee } = useMemo(() => {
        let due = new Date();
        let days = 14;
        let fee = 0;

        if (borrowPeriod === '2weeks') {
            days = 14;
            due.setDate(today.getDate() + 14);
        } else if (borrowPeriod === '1month') {
            days = 30;
            due.setDate(today.getDate() + 30);
        } else if (borrowPeriod === 'extended') {
            days = extendedDays;
            due.setDate(today.getDate() + extendedDays);
            const weeksBeyondMonth = Math.ceil((extendedDays - 30) / 7);
            fee = weeksBeyondMonth * 5;
        }

        return {
            dueDate: due,
            daysToBorrow: days,
            calculatedExtendedFee: fee
        };
    }, [borrowPeriod, extendedDays, today]);

    // ✅ EARLY RETURN AFTER HOOKS
    if (!isOpen || !book) return null;

    const handleConfirm = () => {
        onConfirm({
            borrowDate: borrowDate.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            borrowPeriod: daysToBorrow,
            extendedFee: borrowPeriod === 'extended' ? calculatedExtendedFee : 0
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                ></div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-6 pt-6 pb-4">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">
                                Confirm Borrow Request
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Book Info */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-2">You are borrowing</p>
                            <h4 className="text-lg font-semibold text-gray-900">"{book.title}"</h4>
                            <p className="text-sm text-gray-600 mt-1">by {book.author}</p>
                        </div>

                        {/* Borrow Details */}
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="text-sm font-medium text-gray-600">Borrow date:</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {formatDate(borrowDate.toISOString().split('T')[0])}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="text-sm font-medium text-gray-600">Due date:</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {formatDate(dueDate.toISOString().split('T')[0])}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="text-sm font-medium text-gray-600">Borrowing period:</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {daysToBorrow} days
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="text-sm font-medium text-gray-600">Late fine:</span>
                                <span className="text-sm font-semibold text-red-600">
                                    $1 per day
                                </span>
                            </div>

                            {borrowPeriod === 'extended' && calculatedExtendedFee > 0 && (
                                <div className="flex justify-between items-center py-2 border-b border-yellow-200 bg-yellow-50 rounded px-2">
                                    <span className="text-sm font-medium text-yellow-800">Extended borrowing fee:</span>
                                    <span className="text-sm font-semibold text-yellow-900">
                                        ${calculatedExtendedFee.toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Borrow Period Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Select borrowing period:
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="borrowPeriod"
                                        value="2weeks"
                                        checked={borrowPeriod === '2weeks'}
                                        onChange={(e) => setBorrowPeriod(e.target.value)}
                                        className="mr-3 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-900">2 Weeks (Standard)</span>
                                        <p className="text-xs text-gray-500">Free - 14 days</p>
                                    </div>
                                </label>

                                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="borrowPeriod"
                                        value="1month"
                                        checked={borrowPeriod === '1month'}
                                        onChange={(e) => setBorrowPeriod(e.target.value)}
                                        className="mr-3 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-900">1 Month (Maximum Standard)</span>
                                        <p className="text-xs text-gray-500">Free - 30 days</p>
                                    </div>
                                </label>

                                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="borrowPeriod"
                                        value="extended"
                                        checked={borrowPeriod === 'extended'}
                                        onChange={(e) => setBorrowPeriod(e.target.value)}
                                        className="mr-3 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-900">Extended Period</span>
                                        <p className="text-xs text-gray-500">$5 per week beyond 1 month</p>
                                    </div>
                                </label>
                            </div>

                            {borrowPeriod === 'extended' && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Number of days (minimum 31):
                                    </label>
                                    <input
                                        type="number"
                                        min="31"
                                        max="90"
                                        value={extendedDays}
                                        onChange={(e) => {
                                            const days = parseInt(e.target.value) || 31;
                                            setExtendedDays(Math.max(31, Math.min(90, days)));
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Maximum 90 days. Fee: ${calculatedExtendedFee.toFixed(2)} ({Math.ceil((extendedDays - 30) / 7)} week(s) beyond 1 month)
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Warning */}
                        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-xs text-yellow-800">
                                <strong>Important:</strong> Please return the book on or before the due date.
                                Late returns will incur a fine of $1 per day.
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            disabled={borrowing}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={borrowing}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-2"
                        >
                            {borrowing ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                'Confirm Borrow'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BorrowConfirmationModal;
