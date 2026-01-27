// Mock book service with realistic data
// Replace with actual API calls when backend is ready

const mockBooks = [
    {
        id: 1,
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen',
        isbn: '9780262046305',
        genre: 'Computer Science',
        publishedYear: 2022,
        publisher: 'MIT Press',
        totalCopies: 5,
        availableCopies: 3,
        description: 'A comprehensive introduction to the modern study of computer algorithms.',
        coverImage: 'https://via.placeholder.com/200x300?text=Algorithms',
        callNumber: 'QA76.9.A43 C66 2022'
    },
    {
        id: 2,
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '9780132350884',
        genre: 'Programming',
        publishedYear: 2008,
        publisher: 'Prentice Hall',
        totalCopies: 4,
        availableCopies: 2,
        description: 'A Handbook of Agile Software Craftsmanship.',
        coverImage: 'https://via.placeholder.com/200x300?text=Clean+Code',
        callNumber: 'QA76.76.D47 M37 2008'
    },
    {
        id: 3,
        title: 'The Design of Everyday Things',
        author: 'Don Norman',
        isbn: '9780465050659',
        genre: 'Design',
        publishedYear: 2013,
        publisher: 'Basic Books',
        totalCopies: 3,
        availableCopies: 1,
        description: 'Revised and expanded edition of the classic work on design.',
        coverImage: 'https://via.placeholder.com/200x300?text=Design',
        callNumber: 'TS171.4 .N67 2013'
    },
    {
        id: 4,
        title: 'Database Systems: The Complete Book',
        author: 'Hector Garcia-Molina',
        isbn: '9780131873254',
        genre: 'Computer Science',
        publishedYear: 2008,
        publisher: 'Prentice Hall',
        totalCopies: 6,
        availableCopies: 4,
        description: 'Comprehensive coverage of database systems.',
        coverImage: 'https://via.placeholder.com/200x300?text=Database',
        callNumber: 'QA76.9.D3 G37 2008'
    },
    {
        id: 5,
        title: 'Operating System Concepts',
        author: 'Abraham Silberschatz',
        isbn: '9781119800361',
        genre: 'Computer Science',
        publishedYear: 2021,
        publisher: 'Wiley',
        totalCopies: 4,
        availableCopies: 2,
        description: 'The fundamental concepts of operating systems.',
        coverImage: 'https://via.placeholder.com/200x300?text=OS+Concepts',
        callNumber: 'QA76.76.O63 S55 2021'
    },
    {
        id: 6,
        title: 'Computer Networks',
        author: 'Andrew S. Tanenbaum',
        isbn: '9780132126953',
        genre: 'Networking',
        publishedYear: 2021,
        publisher: 'Pearson',
        totalCopies: 5,
        availableCopies: 3,
        description: 'A top-down approach to computer networking.',
        coverImage: 'https://via.placeholder.com/200x300?text=Networks',
        callNumber: 'TK5105.5 .T46 2021'
    }
];

export const bookService = {
    getAllBooks: async (filters = {}) => {
        await new Promise(resolve => setTimeout(resolve, 300));

        let filtered = [...mockBooks];

        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(book =>
                book.title.toLowerCase().includes(search) ||
                book.author.toLowerCase().includes(search) ||
                book.isbn.includes(search)
            );
        }

        if (filters.genre) {
            filtered = filtered.filter(book => book.genre === filters.genre);
        }

        if (filters.availableOnly) {
            filtered = filtered.filter(book => book.availableCopies > 0);
        }

        return { success: true, books: filtered };
    },

    getBookById: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 200));
        const book = mockBooks.find(b => b.id === parseInt(id));
        return book ? { success: true, book } : { success: false, error: 'Book not found' };
    },

    addBook: async (bookData) => {
        await new Promise(resolve => setTimeout(resolve, 400));
        const newBook = {
            id: mockBooks.length + 1,
            ...bookData,
            availableCopies: bookData.totalCopies || 1
        };
        mockBooks.push(newBook);
        return { success: true, book: newBook };
    },

    updateBook: async (id, bookData) => {
        await new Promise(resolve => setTimeout(resolve, 400));
        const index = mockBooks.findIndex(b => b.id === parseInt(id));
        if (index !== -1) {
            mockBooks[index] = { ...mockBooks[index], ...bookData };
            return { success: true, book: mockBooks[index] };
        }
        return { success: false, error: 'Book not found' };
    },

    deleteBook: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const index = mockBooks.findIndex(b => b.id === parseInt(id));
        if (index !== -1) {
            mockBooks.splice(index, 1);
            return { success: true };
        }
        return { success: false, error: 'Book not found' };
    }
};
