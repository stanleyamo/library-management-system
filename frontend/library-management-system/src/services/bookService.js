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
        coverImage: 'https://images.booksense.com/images/003/893/9781639893003.jpg',
        callNumber: 'QA76.9.A43 C66 2022',
        featured: true,
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
        coverImage: 'https://kodexolabs.com/wp-content/uploads/2024/01/Clean-Code-Principles-BLOG-THUMBNAIL_01.webp',
        callNumber: 'QA76.76.D47 M37 2008',
        featured: true
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
        coverImage: 'https://m.media-amazon.com/images/I/41vSXHep6cL.jpg',
        callNumber: 'TS171.4 .N67 2013',
        featured: true
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
        coverImage: 'https://www.informit.com/ShowCover.aspx?isbn=0131873253',
        callNumber: 'QA76.9.D3 G37 2008',
        featured: true
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
        coverImage: 'https://images-na.ssl-images-amazon.com/images/I/811N4zhBNdL.jpg',
        callNumber: 'QA76.76.O63 S55 2021',
        featured: false
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
        coverImage: 'https://images.ctfassets.net/aq13lwl6616q/7Bat1BAPAcw756SvvThlS6/a190213cfff69ddfd6d084e58d783f6d/introduction_to_computer_networking.png?w=700&h=394&q=50&fm=png&bg=transparent',
        callNumber: 'TK5105.5 .T46 2021',
        featured: false
    },
    {
        id: 7,
        title: 'Artificial Intelligence: A Modern Approach',
        author: 'Stuart Russell & Peter Norvig',
        isbn: '9780136042594',
        genre: 'Computer Science',
        publishedYear: 2020,
        publisher: 'Pearson',
        totalCopies: 5,
        availableCopies: 5,
        description: 'Comprehensive introduction to AI, covering theory and practical applications.',
        coverImage: 'https://i.ebayimg.com/thumbs/images/g/uIwAAeSwCJRos5Sj/s-l960.webp',
        callNumber: 'Q335 R87 2020',
        featured: false
    },
    {
        id: 8,
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt & David Thomas',
        isbn: '9780201616224',
        genre: 'Programming',
        publishedYear: 2019,
        publisher: 'Addison-Wesley',
        totalCopies: 4,
        availableCopies: 3,
        description: 'Classic guide on software craftsmanship and pragmatic programming techniques.',
        coverImage: 'https://images-na.ssl-images-amazon.com/images/I/41uPjEenkFL._SX396_BO1,204,203,200_.jpg',
        callNumber: 'QA76.6 H86 2019',
        featured: false
    },
    {
        id: 9,
        title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
        author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
        isbn: '9780201633610',
        genre: 'Design',
        publishedYear: 1994,
        publisher: 'Addison-Wesley',
        totalCopies: 3,
        availableCopies: 3,
        description: 'The definitive book on software design patterns for object-oriented programming.',
        coverImage: 'https://m.media-amazon.com/images/I/41l2KFHRcFL.jpg',
        callNumber: 'QA76.64 G36 1994',
        featured: false
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
    },

    getFeaturedBooks: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const featured = mockBooks.filter(book => book.featured);
        return { success: true, books: featured };
    }
};
