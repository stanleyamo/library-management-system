import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookService } from '../services/bookService';
import { validateISBN } from '../utils/validation';
import LoadingSpinner from '../components/LoadingSpinner';
import ProtectedRoute from '../components/ProtectedRoute';

const AddBook = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        genre: '',
        publishedYear: new Date().getFullYear(),
        publisher: '',
        totalCopies: 1,
        description: '',
        callNumber: '',
        coverImage: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const genres = ['Computer Science', 'Programming', 'Design', 'Networking', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Literature'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'publishedYear' || name === 'totalCopies' ? parseInt(value) || 0 : value
        });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.author.trim()) {
            newErrors.author = 'Author is required';
        }

        if (!formData.isbn.trim()) {
            newErrors.isbn = 'ISBN is required';
        } else if (!validateISBN(formData.isbn)) {
            newErrors.isbn = 'Invalid ISBN format';
        }

        if (!formData.genre) {
            newErrors.genre = 'Genre is required';
        }

        if (formData.publishedYear < 1000 || formData.publishedYear > new Date().getFullYear() + 1) {
            newErrors.publishedYear = 'Invalid year';
        }

        if (formData.totalCopies < 1) {
            newErrors.totalCopies = 'Must have at least 1 copy';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setLoading(true);
        try {
            const result = await bookService.addBook(formData);
            if (result.success) {
                alert('Book added successfully!');
                navigate('/books');
            } else {
                setErrors({ submit: result.error || 'Failed to add book' });
            }
        } catch (error) {
            setErrors({ submit: 'An error occurred. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute requireLibrarian={true}>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Book</h1>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <form onSubmit={handleSubmit}>
                            {errors.submit && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                                    {errors.submit}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="input-field"
                                        required
                                    />
                                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Book Cover Image (URL)
                                    </label>
                                    <input
                                        type="url"
                                        name="coverImage"
                                        value={formData.coverImage}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="https://example.com/book-cover.jpg"
                                    />
                                </div>

                                {formData.coverImage && (
                                    <div className="md:col-span-2 mt-2">
                                        <img
                                            src={formData.coverImage}
                                            alt="Book cover preview"
                                            className="h-40 object-contain border rounded"
                                            onError={(e) => (e.target.style.display = 'none')}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Author *
                                    </label>
                                    <input
                                        type="text"
                                        name="author"
                                        value={formData.author}
                                        onChange={handleChange}
                                        className="input-field"
                                        required
                                    />
                                    {errors.author && <p className="mt-1 text-sm text-red-600">{errors.author}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ISBN *
                                    </label>
                                    <input
                                        type="text"
                                        name="isbn"
                                        value={formData.isbn}
                                        onChange={handleChange}
                                        className="input-field"
                                        required
                                    />
                                    {errors.isbn && <p className="mt-1 text-sm text-red-600">{errors.isbn}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Genre *
                                    </label>
                                    <select
                                        name="genre"
                                        value={formData.genre}
                                        onChange={handleChange}
                                        className="input-field"
                                        required
                                    >
                                        <option value="">Select Genre</option>
                                        {genres.map(genre => (
                                            <option key={genre} value={genre}>{genre}</option>
                                        ))}
                                    </select>
                                    {errors.genre && <p className="mt-1 text-sm text-red-600">{errors.genre}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Published Year *
                                    </label>
                                    <input
                                        type="number"
                                        name="publishedYear"
                                        value={formData.publishedYear}
                                        onChange={handleChange}
                                        className="input-field"
                                        min="1000"
                                        max={new Date().getFullYear() + 1}
                                        required
                                    />
                                    {errors.publishedYear && <p className="mt-1 text-sm text-red-600">{errors.publishedYear}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Publisher
                                    </label>
                                    <input
                                        type="text"
                                        name="publisher"
                                        value={formData.publisher}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Total Copies *
                                    </label>
                                    <input
                                        type="number"
                                        name="totalCopies"
                                        value={formData.totalCopies}
                                        onChange={handleChange}
                                        className="input-field"
                                        min="1"
                                        required
                                    />
                                    {errors.totalCopies && <p className="mt-1 text-sm text-red-600">{errors.totalCopies}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Call Number
                                    </label>
                                    <input
                                        type="text"
                                        name="callNumber"
                                        value={formData.callNumber}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="e.g., QA76.9.A43 C66 2022"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="4"
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary disabled:opacity-50"
                                >
                                    {loading ? <LoadingSpinner size="sm" /> : 'Add Book'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/books')}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default AddBook;
