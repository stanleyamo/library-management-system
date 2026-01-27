import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookService } from '../services/bookService';
import { transactionService } from '../services/transactionService';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [showCTA, setShowCTA] = useState(false);

    useEffect(() => {
        // Redirect authenticated users to their dashboards
        if (isAuthenticated) {
            if (user?.role === 'librarian') {
                navigate('/dashboard', { replace: true });
                return;
            } else if (user?.role === 'student') {
                navigate('/student-dashboard', { replace: true });
                return;
            }
        }

        loadBooks();
        if (isAuthenticated && user?.role === 'student') {
            loadStats();
        }
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        // Show CTA after 3 seconds for non-authenticated users
        if (!isAuthenticated) {
            const timer = setTimeout(() => {
                setShowCTA(true);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isAuthenticated]);

    const loadBooks = async () => {
        setLoading(true);
        try {
            const result = await bookService.getAllBooks({ availableOnly: true });
            if (result.success) {
                setBooks(result.books.slice(0, 6)); // Show only 6 on home
            }
        } catch (error) {
            console.error('Error loading books:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const result = await transactionService.getMyTransactions(user.id);
            if (result.success) {
                const active = result.transactions.filter(t => t.status === 'active');
                setStats({
                    borrowed: active.length,
                    total: result.transactions.length
                });
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const result = await bookService.getAllBooks({ search: searchTerm });
            if (result.success) {
                setBooks(result.books);
            }
        } catch (error) {
            console.error('Error searching books:', error);
        } finally {
            setLoading(false);
        }
    };

    // If authenticated, show dashboard content (though they should be redirected)
    if (isAuthenticated && user) {
        return (
            <div className="min-h-screen">
                {/* Hero Section for Authenticated Users */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <h1 className="text-4xl font-bold mb-2">
                            Welcome, {user.name} 👋
                        </h1>
                        <h2 className="text-2xl font-semibold mb-4">
                            Library Management System Dashboard
                        </h2>
                        <p className="text-xl mb-8 text-blue-100">
                            Manage your books and transactions with ease
                        </p>
                    </div>
                </div>

                {/* Stats Section (for authenticated students) */}
                {user.role === 'student' && stats && (
                    <div className="bg-white border-b border-gray-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="text-sm text-gray-600">Books Borrowed</div>
                                    <div className="text-2xl font-bold text-blue-600">{stats.borrowed}</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="text-sm text-gray-600">Total Transactions</div>
                                    <div className="text-2xl font-bold text-green-600">{stats.total}</div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <Link to="/books" className="block">
                                        <div className="text-sm text-gray-600">Browse All Books</div>
                                        <div className="text-lg font-semibold text-purple-600">View Catalog →</div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Featured Books */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Featured Books</h2>
                        <Link to="/books" className="text-blue-600 hover:text-blue-800 font-medium">
                            View All →
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : books.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                            {books.map(book => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No books found. Try a different search.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Landing page for non-authenticated users
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h1 className="text-4xl font-bold mb-4">A Smart Library Management System</h1>
                    <p className="text-xl mb-8 text-blue-100">
                        Discover, borrow, and manage books with ease
                    </p>
                    <div className="max-w-2xl">
                        <div className="flex gap-2">
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                                placeholder="Search for books, authors, or ISBN..."
                            />
                            <button
                                onClick={handleSearch}
                                className="px-6 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-blue-50"
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call to Action - Shows on scroll */}
            {showCTA && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
                    <div className="bg-white rounded-lg shadow-xl p-6 border-2 border-blue-500 max-w-md relative">
                        <button
                            onClick={() => setShowCTA(false)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 pr-6">Get Started Today!</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Create an account or login to start borrowing books and managing your library.
                        </p>
                        <div className="flex gap-3">
                            <Link
                                to="/register"
                                className="flex-1 btn-primary text-center"
                            >
                                Create Account
                            </Link>
                            <Link
                                to="/login"
                                className="flex-1 btn-secondary text-center"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Featured Books */}
            <div className="bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Featured Books
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Explore some highlights from our collection
                            </p>
                        </div>

                        <Link
                            to="/books"
                            className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            View all →
                        </Link>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : books.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {books.slice(0, 8).map(book => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-gray-500 text-sm">
                                No books available at the moment.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
