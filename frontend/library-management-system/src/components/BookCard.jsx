import { Link } from "react-router-dom";

const BookCard = ({ book }) => {
    const isAvailable = book.availableCopies > 0;

    return (
        <div className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">


            <div className="relative h-48 bg-gray-100 overflow-hidden">
                {book.coverImage ? (
                    <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <svg className="w-12 h-12 mb-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                        </svg>
                        <span className="text-xs">No Cover</span>
                    </div>
                )}


                <span
                    className={`absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] font-semibold text-white shadow ${isAvailable ? "bg-green-500" : "bg-red-500"
                        }`}
                >
                    {isAvailable ? "Available" : "Unavailable"}
                </span>
            </div>


            <div className="p-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                    {book.title}
                </h3>

                <p className="text-xs text-gray-600 font-medium line-clamp-1">
                    {book.author}
                </p>

                <div className="flex items-center justify-between text-xs pt-1">
                    <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-medium truncate">
                        {book.genre}
                    </span>
                    <span className="text-gray-500 font-semibold">
                        {book.publishedYear}
                    </span>
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100">
                    <Link
                        to={`/books/${book.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        View details
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BookCard;
