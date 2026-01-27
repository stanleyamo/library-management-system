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
            <div className="min-h-screen flex justify-center items-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error && !book) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button onClick={() => navigate('/books')} className="btn-primary">
                        Back to Books
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate('/books')}
                    className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
                >
                    ← Back to Books
                </button>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="md:flex">
                        <div className="md:w-1/3 bg-gray-100 flex items-center justify-center p-8">
                            {book.coverImage ? (
                                <img src={book.coverImage} alt={book.title} className="max-w-full h-auto" />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <svg className="w-32 h-32 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                    </svg>
                                    <p>No Cover Available</p>
                                </div>
                            )}
                        </div>
                        <div className="md:w-2/3 p-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                            <p className="text-xl text-gray-600 mb-4">by {book.author}</p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <span className="text-sm text-gray-500">ISBN</span>
                                    <p className="font-medium">{book.isbn}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Genre</span>
                                    <p className="font-medium">{book.genre}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Published Year</span>
                                    <p className="font-medium">{book.publishedYear}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Publisher</span>
                                    <p className="font-medium">{book.publisher}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Call Number</span>
                                    <p className="font-medium">{book.callNumber}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Availability</span>
                                    <p className="font-medium">
                                        {book.availableCopies} of {book.totalCopies} available
                                    </p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">Description</h3>
                                <p className="text-gray-700">{book.description || 'No description available.'}</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-4">
                                {isLibrarian ? (
                                    <p className="text-sm text-gray-600">
                                        Librarians cannot borrow books. Use the dashboard to manage book inventory.
                                    </p>
                                ) : (
                                    <>
                                        {book.availableCopies > 0 ? (
                                            <button
                                                onClick={handleBorrowClick}
                                                disabled={borrowing || !isAuthenticated}
                                                className="btn-primary disabled:opacity-50"
                                            >
                                                Borrow Book
                                            </button>
                                        ) : (
                                            <button disabled className="btn-secondary opacity-50 cursor-not-allowed">
                                                Not Available
                                            </button>
                                        )}
                                        {!isAuthenticated && (
                                            <p className="text-sm text-gray-600 flex items-center">
                                                Please <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline ml-1">login</button> to borrow books
                                            </p>
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
