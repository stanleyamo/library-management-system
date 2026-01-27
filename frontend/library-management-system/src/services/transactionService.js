// Mock transaction service
// Replace with actual API calls when backend is ready

const mockTransactions = [
    {
        id: 1,
        bookId: 1,
        bookTitle: 'Introduction to Algorithms',
        userId: 1,
        userName: 'John Doe',
        type: 'borrow',
        borrowDate: '2024-01-15',
        dueDate: '2024-02-15',
        returnDate: null,
        status: 'active',
        fine: 0
    },
    {
        id: 2,
        bookId: 2,
        bookTitle: 'Clean Code',
        userId: 1,
        userName: 'John Doe',
        type: 'borrow',
        borrowDate: '2024-01-10',
        dueDate: '2024-02-10',
        returnDate: '2024-02-08',
        status: 'returned',
        fine: 0
    },
    {
        id: 3,
        bookId: 3,
        bookTitle: 'The Design of Everyday Things',
        userId: 1,
        userName: 'John Doe',
        type: 'borrow',
        borrowDate: '2023-12-01',
        dueDate: '2024-01-01',
        returnDate: '2024-01-05',
        status: 'returned',
        fine: 2.00
    }
];

export const transactionService = {
    getMyTransactions: async (userId) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const transactions = mockTransactions.filter(t => t.userId === userId);
        return { success: true, transactions };
    },

    getAllTransactions: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { success: true, transactions: mockTransactions };
    },

    borrowBook: async (bookId, userId, borrowDate = null, dueDate = null, extendedFee = 0) => {
        await new Promise(resolve => setTimeout(resolve, 400));
        
        const today = new Date();
        const borrow = borrowDate ? new Date(borrowDate) : today;
        let due = dueDate ? new Date(dueDate) : new Date();
        
        // If no dates provided, default to 2 weeks
        if (!dueDate) {
            due.setDate(today.getDate() + 14);
        }

        const newTransaction = {
            id: mockTransactions.length + 1,
            bookId,
            userId,
            type: 'borrow',
            borrowDate: borrow.toISOString().split('T')[0],
            dueDate: due.toISOString().split('T')[0],
            returnDate: null,
            status: 'active',
            fine: 0,
            extendedFee: extendedFee || 0
        };
        mockTransactions.push(newTransaction);
        return { success: true, transaction: newTransaction };
    },

    returnBook: async (transactionId) => {
        await new Promise(resolve => setTimeout(resolve, 400));
        const transaction = mockTransactions.find(t => t.id === transactionId);
        if (transaction) {
            transaction.returnDate = new Date().toISOString().split('T')[0];
            transaction.status = 'returned';
            // Calculate fine if overdue ($1 per day)
            const due = new Date(transaction.dueDate);
            const returned = new Date(transaction.returnDate);
            if (returned > due) {
                const daysOverdue = Math.ceil((returned - due) / (1000 * 60 * 60 * 24));
                transaction.fine = (daysOverdue * 1.00).toFixed(2);
            }
            return { success: true, transaction };
        }
        return { success: false, error: 'Transaction not found' };
    }
};
