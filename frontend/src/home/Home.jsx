import { useState, useEffect } from "react";
import { getAllBooks } from "../services/book.service";
import { useNavigate } from "react-router-dom";
import Chatbot from "../book/Chatbot";

export default function Home() {
	const [books, setBooks] = useState([]);
	const [searchValue, setSearchValue] = useState("");

	const navigate = useNavigate();

	const filteredBooks = books.filter((book) =>
		book.name.toLowerCase().includes(searchValue.toLowerCase())
	);

	useEffect(() => {
		async function fetchData() {
			const response = await getAllBooks();
			setBooks(response.data);
		}
		fetchData();
	}, []);

	return (
		<div className="container mx-auto px-20 py-8">
			<h1 className="text-3xl font-bold mb-4 text-center">Featured Books</h1>
			<div className="flex justify-end mb-10">
				<label className="input">
					<svg
						className="h-[1em] opacity-50"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
					>
						<g
							strokeLinejoin="round"
							strokeLinecap="round"
							strokeWidth="2.5"
							fill="none"
							stroke="currentColor"
						>
							<circle cx="11" cy="11" r="8"></circle>
							<path d="m21 21-4.3-4.3"></path>
						</g>
					</svg>
					<input
						type="text"
						className="grow"
						placeholder="Search by book name..."
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
					/>
				</label>
			</div>

			{filteredBooks.length === 0 ? (
				<div className="text-center py-20 text-base-content/60">
					No books found.
				</div>
			) : (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-20">
					{filteredBooks.map((book) => (
						<div
							key={book.id}
							className="card bg-base-100 shadow-md border border-base-200 overflow-hidden cursor-pointer 
                            transition-transform duration-300 ease-out hover:-translate-y-2 hover:shadow-xl"
							onClick={() => navigate(`/books/${book.id}`)}
						>
							{/* Book Cover Image */}
							<figure className="h-70 bg-base-200 overflow-hidden">
								{book.coverImage ? (
									<img
										src={`http://localhost:8080/api/book/${book.id}/cover-image`}
										alt={book.name}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="flex items-center justify-center w-full h-full text-base-content/40 font-semibold text-sm">
										No Cover
									</div>
								)}
							</figure>

							{/* Book Details */}
							<div className="card-body p-4 gap-1 text-center">
								<h2 className="card-title text-base line-clamp-1">
									{book.name}
								</h2>
								{book.price !== undefined && (
									<p className="text-green-600 font-bold text-sm">
										${Number(book.price).toFixed(2)}
									</p>
								)}
							</div>
						</div>
					))}
				</div>
			)}
			<Chatbot />
		</div>
	);
}
