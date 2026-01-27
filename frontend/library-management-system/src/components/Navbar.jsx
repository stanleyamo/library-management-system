import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex items-center">
                            <span className="text-xl font-bold text-blue-600">LibraryMS</span>
                        </Link>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {isAuthenticated && user.role === 'librarian' ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/books"
                                        className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    >
                                        Books
                                    </Link>
                                    <Link
                                        to="/add-book"
                                        className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    >
                                        Add Book
                                    </Link>
                                    <Link
                                        to="/fines"
                                        className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    >
                                        Fines
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/"
                                        className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    >
                                        Home
                                    </Link>
                                    <Link
                                        to="/books"
                                        className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    >
                                        Books
                                    </Link>
                                    {isAuthenticated && user.role === 'student' && (
                                        <>
                                            <Link
                                                to="/my-books"
                                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                            >
                                                My Books
                                            </Link>
                                            <Link
                                                to="/transactions"
                                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                            >
                                                Transactions
                                            </Link>
                                            <Link
                                                to="/fines"
                                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                            >
                                                Fines
                                            </Link>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/profile"
                                    className="text-sm text-gray-700 hover:text-gray-900"
                                >
                                    {user.name}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm text-gray-700 hover:text-gray-900"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-sm text-gray-700 hover:text-gray-900"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn-primary text-sm"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
