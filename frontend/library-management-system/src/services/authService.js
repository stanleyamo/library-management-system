// Mock authentication service
// Replace with actual API calls when backend is ready

const mockUsers = [
    {
        id: 1,
        email: 'student@library.com',
        password: 'password123',
        name: 'John Doe',
        role: 'student',
        studentId: 'STU001',
        phone: '555-0101'
    },
    {
        id: 2,
        email: 'librarian@library.com',
        password: 'password123',
        name: 'Jane Smith',
        role: 'librarian',
        employeeId: 'LIB001',
        phone: '555-0102'
    }
];

export const authService = {
    login: async (email, password) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const user = mockUsers.find(u => u.email === email && u.password === password);
        if (user) {
            const { password: _, ...userWithoutPassword } = user;
            return { success: true, user: userWithoutPassword, token: 'mock-jwt-token' };
        }
        return { success: false, error: 'Invalid credentials' };
    },

    register: async (userData) => {
        await new Promise(resolve => setTimeout(resolve, 500));

        const newUser = {
            id: mockUsers.length + 1,
            ...userData,
            role: 'student'
        };
        mockUsers.push(newUser);
        const { password: _, ...userWithoutPassword } = newUser;
        return { success: true, user: userWithoutPassword, token: 'mock-jwt-token' };
    },

    logout: async () => {
        return { success: true };
    }
};
