import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen } from 'lucide-react';


const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const closeDropdown = () => setOpen(false);
        window.addEventListener('click', closeDropdown);

        return () => window.removeEventListener('click', closeDropdown);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex items-center gap-2 group">
                            <BookOpen className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                            <span className="text-xl font-bold text-blue-600">LibraryMS</span>
                        </Link>

                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {isAuthenticated && user.role === 'librarian' ? (
                                <>
                                    <NavLink to="/dashboard" text="Dashboard" />
                                    <NavLink to="/books" text="Books" />
                                    <NavLink to="/add-book" text="Add Book" />
                                    <NavLink to="/fines" text="Fines" />
                                </>
                            ) : (
                                <>
                                    <NavLink to="/" text="Home" />
                                    <NavLink to="/books" text="Books" />
                                    {isAuthenticated && user.role === 'student' && (
                                        <>
                                            <NavLink to="/my-books" text="My Books" />
                                            <NavLink to="/transactions" text="Transactions" />
                                            <NavLink to="/fines" text="Fines" />
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center relative">
                        {isAuthenticated ? (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpen(prev => !prev);
                                    }}
                                    className="flex items-center gap-2 focus:outline-none"
                                >
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold uppercase">
                                        {user.name?.charAt(0)}
                                    </div>

                                    <span className="hidden sm:block text-sm text-gray-700">
                                        {user.name}
                                    </span>

                                    <svg
                                        className={`w-4 h-4 transition-transform ${
                                            open ? 'rotate-180' : ''
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>

                                {open && (
                                    <div className="absolute right-0 top-12 w-48 bg-white border rounded-lg shadow-lg z-50">
                                        <Link
                                            to="/profile"
                                            onClick={() => setOpen(false)}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Profile
                                        </Link>

                                        <div className="sm:hidden border-t">
                                            {isAuthenticated && user.role === 'librarian' ? (
                                                <>
                                                    <MobileLink to="/dashboard" text="Dashboard" setOpen={setOpen} />
                                                    <MobileLink to="/books" text="Books" setOpen={setOpen} />
                                                    <MobileLink to="/add-book" text="Add Book" setOpen={setOpen} />
                                                    <MobileLink to="/fines" text="Fines" setOpen={setOpen} />
                                                </>
                                            ) : (
                                                <>
                                                    <MobileLink to="/" text="Home" setOpen={setOpen} />
                                                    <MobileLink to="/books" text="Books" setOpen={setOpen} />
                                                    {user.role === 'student' && (
                                                        <>
                                                            <MobileLink to="/my-books" text="My Books" setOpen={setOpen} />
                                                            <MobileLink to="/transactions" text="Transactions" setOpen={setOpen} />
                                                            <MobileLink to="/fines" text="Fines" setOpen={setOpen} />
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 border-t"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-sm text-gray-700 hover:text-gray-900">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary text-sm">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, text }) => (
    <Link
        to={to}
        className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
    >
        {text}
    </Link>
);

const MobileLink = ({ to, text, setOpen }) => (
    <Link
        to={to}
        onClick={() => setOpen(false)}
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    >
        {text}
    </Link>
);

export default Navbar;
