import { useState, useEffect } from 'react';
import { bookService } from '../services/bookService';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [genreFilter, setGenreFilter] = useState('');
    const [availableOnly, setAvailableOnly] = useState(false);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');

    const genres = ['Computer Science', 'Programming', 'Design', 'Networking'];

    useEffect(() => {
        loadBooks();
    }, [genreFilter, availableOnly]);

    const loadBooks = async () => {
        setLoading(true);
        try {
            const filters = {};
            if (searchTerm) filters.search = searchTerm;
            if (genreFilter) filters.genre = genreFilter;
            if (availableOnly) filters.availableOnly = true;

            const result = await bookService.getAllBooks(filters);
            if (result.success) {
                setBooks(result.books);
            }
        } catch (error) {
            console.error('Error loading books:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        loadBooks();
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Book Catalog</h1>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                                placeholder="Search by title, author, or ISBN..."
                            />
                        </div>
                        <div>
                            <select
                                value={genreFilter}
                                onChange={(e) => setGenreFilter(e.target.value)}
                                className="input-field"
                            >
                                <option value="">All Genres</option>
                                {genres.map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={availableOnly}
                                    onChange={(e) => setAvailableOnly(e.target.checked)}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700">Available only</span>
                            </label>
                            <button
                                onClick={handleSearch}
                                className="btn-primary"
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-600">
                        Found <span className="font-semibold">{books.length}</span> books
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Books Grid/List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : books.length > 0 ? (
                    <div className={viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                        : 'space-y-4'
                    }>
                        {books.map(book => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <p className="text-gray-500 text-lg">No books found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookList;
