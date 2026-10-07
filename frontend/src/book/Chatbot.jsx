import { useState } from "react";
import { environment } from "../environment";
import axios from "axios";

export default function Chatbot() {
	const initialMessage = [
		{
			role: "assistant",
			content: "Hi! 👋 I'm your book assistant.\nWhat would you like to know?"
		}
	];

	const [isOpen, setIsOpen] = useState(false);
	const [message, setMessage] = useState("");
	const [messageArray, setMessageArray] = useState(() => initialMessage);
	const [isLoading, setIsLoading] = useState(false);

	const handleSend = async () => {
		if (!message.trim()) return;

		setIsLoading(true);
		const userMessage = {
			role: "user",
			content: message.trim()
		};

		const updatedMessages = [...messageArray, userMessage];

		setMessageArray(updatedMessages);
		setMessage("");

		try {
			const response = await axios.post(`${environment.fastApiUrl}/chat`, {
				"messages": updatedMessages
			});

			const data = response.data;

			setMessageArray((prev) => [
				...prev,
				{
					role: "assistant",
					content: data.answer
				}
			]);
		} catch (error) {
			console.error("Chat error:", error);
			setMessageArray((prev) => [
				...prev,
				{
					role: "assistant",
					content: "Connection Error."
				}
			]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="fixed bottom-6 right-6 z-50">
			{!isOpen && (
				<button
					onClick={() => setIsOpen(true)}
					className="
                        flex h-14 w-14 items-center justify-center
                        rounded-full bg-blue-400 text-white
                        shadow-lg transition
                        hover:bg-blue-700
                    "
				>
					🤖
				</button>
			)}

			{isOpen && (
				<div
					className="
                        flex h-[600px] w-[380px]
                        flex-col overflow-hidden
                        rounded-2xl bg-white
                        shadow-2xl
                        border border-gray-200
                    "
				>
					{/* Header */}
					<div
						className="
                            flex items-center justify-between
                            bg-blue-500 px-5 py-4
                            text-white
                        "
					>
						<div>
							<h2 className="font-semibold">Book Assistant</h2>

							<p className="text-xs text-blue-100">Ask me about books</p>
						</div>

						<button
							onClick={() => {
								setIsOpen(false);
							}}
							className="text-xl hover:text-blue-200"
						>
							x
						</button>
					</div>

					{/* Messages */}
					<div className="flex-1 overflow-y-auto p-4">
						{messageArray.map((msg, index) => (
							<div
								key={index}
								className={`mb-3 flex ${
									msg.role === "user" ? "justify-end" : "justify-start"
								}`}
							>
								<div
									className={`max-w-[80%] rounded-xl px-4 py-3 text-sm whitespace-pre-line ${
										msg.role === "user"
											? "bg-blue-600 text-white"
											: "bg-gray-100 text-gray-800"
									}`}
								>
									{msg.content}
								</div>
							</div>
						))}

						{isLoading && (
							<div className="mb-3 flex justify-start">
								<div className="rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-600">
									<div className="flex items-center gap-1">
										<span>Thinking</span>
										<span className="animate-bounce">.</span>
										<span className="animate-bounce [animation-delay:150ms]">
											.
										</span>
										<span className="animate-bounce [animation-delay:300ms]">
											.
										</span>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Input */}
					<div className="border-t p-3">
						<div className="flex items-center gap-2">
							<input
								type="text"
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleSend();
									}
								}}
								placeholder="Ask about books..."
								className="
                                    flex-1 rounded-xl
                                    border border-gray-300
                                    px-4 py-2 text-sm
                                    outline-none
                                    focus:border-blue-500
                                "
							/>

							<button
								onClick={handleSend}
								disabled={isLoading || !message.trim()}
								className="
                                    rounded-xl bg-blue-600
                                    px-4 py-2 text-white
                                    hover:bg-blue-500
                                "
							>
								➤
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
