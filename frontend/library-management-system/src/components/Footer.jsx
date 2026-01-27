const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white mt-auto border-t border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Library Management System</h3>
                        <p className="text-gray-400 text-sm">
                            Efficiently manage your library resources, books, and members with our comprehensive system.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="/books" className="hover:text-white transition-colors">Browse Books</a></li>
                            <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
                            <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>Email: library@university.edu</li>
                            <li>Phone: (555) 123-4567</li>
                            <li>Hours: Mon-Fri 9AM-5PM</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Library Management System. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
