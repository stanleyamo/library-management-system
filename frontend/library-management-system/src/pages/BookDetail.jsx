import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookService } from '../services/bookService';
import { transactionService } from '../services/transactionService';
import LoadingSpinner from '../components/LoadingSpinner';
import BorrowConfirmationModal from '../components/BorrowConfirmationModal';

const BookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, isLibrarian } = useAuth();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [borrowing, setBorrowing] = useState(false);
    const [error, setError] = useState('');
    const [showBorrowModal, setShowBorrowModal] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        loadBook();
    }, [id]);

    const loadBook = async () => {
        setLoading(true);
        try {
            const result = await bookService.getBookById(id);
            if (result.success) {
                setBook(result.book);
            } else {
                setError('Book not found');
            }
        } catch (err) {
            setError('Error loading book');
        } finally {
            setLoading(false);
        }
    };

    const handleBorrowClick = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setShowBorrowModal(true);
    };

    const handleConfirmBorrow = async (borrowDetails) => {
        setBorrowing(true);
        setError('');

        try {
            const result = await transactionService.borrowBook(
                book.id,
                user.id,
                borrowDetails.borrowDate,
                borrowDetails.dueDate,
                borrowDetails.extendedFee
            );
            if (result.success) {
                setBook({
                    ...book,
                    availableCopies: book.availableCopies - 1
                });
                setShowBorrowModal(false);
                alert('Book borrowed successfully!');
                navigate('/my-books');
            } else {
                setError(result.error || 'Failed to borrow book');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setBorrowing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-50 to-blue-50">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error && !book) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center animate-fadeIn">
                    <div className="mb-4 text-red-500">
                        <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-red-600 mb-6 text-lg font-medium">{error}</p>
                    <button
                        onClick={() => navigate('/books')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                    >
                        Back to Books
                    </button>
                </div>
            </div>
        );
    }

    const availabilityPercentage = (book.availableCopies / book.totalCopies) * 100;
    const isAvailable = book.availableCopies > 0;
    const isLowStock = availabilityPercentage <= 30 && availabilityPercentage > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                .animate-slideInLeft {
                    animation: slideInLeft 0.6s ease-out;
                }
                .animate-slideInRight {
                    animation: slideInRight 0.6s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.4s ease-out;
                }
                .detail-card {
                    transition: all 0.2s ease;
                }
                .detail-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }
                .book-cover-shadow {
                    box-shadow: 0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
                }
            `}</style>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate('/books')}
                    className="group mb-6 flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-all duration-200 animate-fadeIn"
                >
                    <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium">Back to Books</span>
                </button>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-scaleIn">
                    <div className="md:flex">
                        <div className="md:w-1/3 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-12 relative overflow-hidden animate-slideInLeft">
                            <div className="absolute inset-0 opacity-5">
                                <div className="absolute inset-0" style={{
                                    backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)',
                                    backgroundSize: '32px 32px'
                                }}></div>
                            </div>

                            {book.coverImage ? (
                                <div className="relative z-10">
                                    <img
                                        src={book.coverImage}
                                        alt={book.title}
                                        className={`max-w-full h-auto rounded-lg book-cover-shadow transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                        onLoad={() => setImageLoaded(true)}
                                    />
                                    {!imageLoaded && (
                                        <div className="absolute inset-0 bg-slate-200 animate-pulse rounded-lg"></div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center text-slate-400 relative z-10">
                                    <div className="w-48 h-64 bg-white rounded-lg shadow-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                                        <div>
                                            <svg className="w-20 h-20 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                            </svg>
                                            <p className="text-sm font-medium">No Cover Available</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Book Details Section */}
                        <div className="md:w-2/3 p-8 md:p-10 animate-slideInRight">
                            <div className="mb-6">
                                <h1 className="text-4xl font-bold text-slate-900 mb-3 leading-tight">{book.title}</h1>
                                <p className="text-xl text-slate-600 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium">{book.author}</span>
                                </p>
                            </div>

                            {/* Availability Badge */}
                            <div className="mb-6">
                                {isAvailable ? (
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${
                                        isLowStock
                                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    }`}>
                                        <div className={`w-2 h-2 rounded-full ${isLowStock ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></div>
                                        {isLowStock ? 'Low Stock' : 'Available'}
                                        <span className="ml-1 font-bold">{book.availableCopies}/{book.totalCopies}</span>
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium bg-red-100 text-red-800 border border-red-200">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        Out of Stock
                                    </div>
                                )}
                            </div>

                            {/* Book Information Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="detail-card bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <span className="text-xs uppercase tracking-wide text-slate-500 font-semibold flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                        </svg>
                                        ISBN
                                    </span>
                                    <p className="font-semibold text-slate-900 mt-1.5">{book.isbn}</p>
                                </div>
                                <div className="detail-card bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <span className="text-xs uppercase tracking-wide text-slate-500 font-semibold flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        Genre
                                    </span>
                                    <p className="font-semibold text-slate-900 mt-1.5">
                                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                                            {book.genre}
                                        </span>
                                    </p>
                                </div>
                                <div className="detail-card bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <span className="text-xs uppercase tracking-wide text-slate-500 font-semibold flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Published
                                    </span>
                                    <p className="font-semibold text-slate-900 mt-1.5">{book.publishedYear}</p>
                                </div>
                                <div className="detail-card bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <span className="text-xs uppercase tracking-wide text-slate-500 font-semibold flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        Publisher
                                    </span>
                                    <p className="font-semibold text-slate-900 mt-1.5">{book.publisher}</p>
                                </div>
                                <div className="detail-card bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <span className="text-xs uppercase tracking-wide text-slate-500 font-semibold flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                        Call Number
                                    </span>
                                    <p className="font-semibold text-slate-900 mt-1.5 font-mono text-sm">{book.callNumber}</p>
                                </div>
                            </div>

                            {/* Description */}
                            {book.description && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                        </svg>
                                        Description
                                    </h3>
                                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-5 border border-slate-200">
                                        <p className="text-slate-700 leading-relaxed">{book.description}</p>
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3 animate-fadeIn">
                                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-red-700 font-medium">{error}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-4 items-center">
                                {isLibrarian ? (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-sm text-blue-800 font-medium">
                                            Librarians cannot borrow books. Use the dashboard to manage book inventory.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {isAvailable ? (
                                            <button
                                                onClick={handleBorrowClick}
                                                disabled={borrowing || !isAuthenticated}
                                                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
                                            >
                                                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                                Borrow Book
                                            </button>
                                        ) : (
                                            <button
                                                disabled
                                                className="px-8 py-4 bg-slate-200 text-slate-500 rounded-xl font-semibold cursor-not-allowed flex items-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                </svg>
                                                Not Available
                                            </button>
                                        )}
                                        {!isAuthenticated && (
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                </svg>
                                                <p className="text-sm text-amber-800 font-medium">
                                                    Please
                                                    <button
                                                        onClick={() => navigate('/login')}
                                                        className="text-blue-600 hover:text-blue-800 font-semibold underline mx-1"
                                                    >
                                                        login
                                                    </button>
                                                    to borrow books
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <BorrowConfirmationModal
                isOpen={showBorrowModal}
                onClose={() => setShowBorrowModal(false)}
                book={book}
                onConfirm={handleConfirmBorrow}
                borrowing={borrowing}
            />
        </div>
    );
};

export default BookDetail;