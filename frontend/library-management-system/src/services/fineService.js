// Mock fine service
// Replace with actual API calls when backend is ready

const mockFines = [
    {
        id: 1,
        transactionId: 3,
        userId: 1,
        userName: 'John Doe',
        bookTitle: 'The Design of Everyday Things',
        amount: 2.00,
        reason: 'Late return',
        status: 'pending',
        dueDate: '2024-01-01',
        returnDate: '2024-01-05',
        createdAt: '2024-01-05'
    }
];

export const fineService = {
    getMyFines: async (userId) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const fines = mockFines.filter(f => f.userId === userId);
        return { success: true, fines };
    },

    getAllFines: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { success: true, fines: mockFines };
    },

    payFine: async (fineId) => {
        await new Promise(resolve => setTimeout(resolve, 400));
        const fine = mockFines.find(f => f.id === fineId);
        if (fine) {
            fine.status = 'paid';
            fine.paidAt = new Date().toISOString();
            return { success: true, fine };
        }
        return { success: false, error: 'Fine not found' };
    }
};
