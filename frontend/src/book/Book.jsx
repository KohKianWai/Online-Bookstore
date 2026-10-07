import GenericForm from "../share/GenericForm";
import { useState, useEffect } from "react";
import FormModal from "../share/FormModal";
import DataTable from "../share/DataTable";
import { getAllBooks, getBookById, updateBook, deleteBook, createBook, uploadBookContent, uploadBookCoverImage, ingestPDF, deleteBookVector, updateBookVector } from "../services/book.service";
import { getAllAuthors } from "../services/author.service";
import { getAllCategories } from "../services/category.service";

export default function Book(){

    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [searchValue, setSearchValue] = useState("");

    const bookFields = [
        {
            name: "name",
            label: "Name",
            type: "text",
            required: true,
            placeholder: "Name"
        },
        {
            name: "subject",
            label: "Subject",
            type: "text",
            required: true,
            placeholder: "Subject"
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Description"
        },
        {
            name: "authorId",
            label: "Author",
            type: "select",
            options: authors.map(author => ({
                        value: author.id,
                        label: author.name
                    })),
            required: true,
            placeholder: "Author"
        },
        {
            name: "categoryId",
            label: "Category",
            type: "select",
            options: categories.map(category => ({
                value: category.id,
                label: category.name
            })),
            required: true,
            placeholder: "Category"
        },
        {
            name: "price",
            label: "Price",
            type: "number",
            required: true,
            placeholder: "Price",
            min: 0,
            step: "0.01"
        },
        {
            name: "content",
            // label: "Book File (PDF/TXT)",
            label: "Book File (PDF)",
            type: "file",
            required: true,
            // accept: ".pdf,.txt",
            accept: ".pdf",
            // disabled: editingId ? true : false
        },
        {
            name: "coverImage",
            label: "Book Cover Image (.PNG)",
            type: "file",
            required: true,
            accept: "image/png",
            disabled: editingId ? true : false
        }
    ]

    const bookColumns = [
        {
            key: "name",
            label: "Name"
        },
        {
            key: "coverImage",
            label: "Book Cover",
            render: (book) => (
                <img
                    src={`http://localhost:8080/api/book/${book.id}/cover-image`}
                    alt={book.name}
                    className="w-30 h-45 object-cover rounded mx-auto"
                />
            )
        },
        {
            key: "authorName",
            label: "Author",
            render: (row) => {
                const author = authors.find(author => author.id === row.authorId)
                return author.name
            }
        },
        {
            key: "categoryName",
            label: "Category",
            render: (row) => {
                const category = categories.find(category => category.id === row.categoryId)
                return category.name
            }
        },
        {
            key: "price",
            label: "Price",
            render: (row) => <span className="font-bold text-green-600">${row.price.toFixed(2)}</span>
        },
        {
            key: "action",
            label: "Action"
        }
    ]

    const bookDto = {
        name: "",
        subject: "",
        description: "",
        contentType: "",
        authorId: "",
        categoryId: "",
        price: "",
        content: null,
        coverImage: null
    }

    const [books, setBooks] = useState([])

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [form, setForm] = useState(bookDto)

    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredBooks = books.filter(book => book.name.toLowerCase().includes(searchValue.toLowerCase()));

    useEffect(() => {
       async function fetchData() {
            try {
                const [allBooks, allAuthors, allCategories] = await Promise.all([
                    getAllBooks(),
                    getAllAuthors(),
                    getAllCategories()
                ]);

                setBooks(allBooks.data);
                setAuthors(allAuthors.data);
                setCategories(allCategories.data);

            } catch (error) {
                console.error("Failed to fetch book data:", error);
            }
        }

        fetchData();
    }, [])
    
    const handleChange = (e) => {
        const { name, value, files, type } = e.target;

        if (type === "file") {
            const file = files[0];

           setForm((prev) => {
                const updated = { ...prev, [name]: file };

                if (name === "content" && file) {
                    updated.contentType = file.type;
                }

                return updated;
            });
            return;
        }

        setForm({
            ...form,
            [name]: value,
        });
    };

    // Test form change
    // useEffect(() => {
    //     console.log("Updated form:", form);
    // }, [form]);

    const clearForm = () => setForm(bookDto)
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);
        const author = authors.find(author => author.id === form.authorId);
        const category = categories.find(category => category.id === form.categoryId);
        if (editingId){
            await updateBook(editingId, {
                name: form.name,
                subject: form.subject,
                description: form.description,
                authorId: form.authorId,
                categoryId: form.categoryId,
                price: form.price,
            })
            const formData = new FormData();
            formData.append("title", form.name);
            formData.append("author", author.name);
            formData.append("category", category.name);
            formData.append("file", form.content);
            await uploadBookContent(editingId, form.content);
            await updateBookVector(editingId, formData);
            console.log("Updated!")

        } else {
            const response = await createBook({
                name: form.name,
                subject: form.subject,
                description: form.description,
                contentType: form.contentType,
                authorId: form.authorId,
                categoryId: form.categoryId,
                price: form.price,
            });
            const createdBook = response.data
            await uploadBookContent(createdBook.id, form.content)
            await uploadBookCoverImage(createdBook.id, form.coverImage)

            const formData = new FormData();
            formData.append("bookId", createdBook.id)
            formData.append("title", form.name);
            formData.append("author", author.name);
            formData.append("category", category.name);
            formData.append("file", form.content);
            await ingestPDF(formData);
            console.log("Created!")
        }
        const allBooks = await getAllBooks()
        setBooks(allBooks.data)
        clearForm()
        setEditingId(null)
        setIsModalOpen(false);
        setIsSubmitting(false)
    }

    const handleUpdate = async (book) => {
            const originalBook = await getBookById(book.id);
            setForm({
                ...originalBook.data,
                content: null,
                coverImage: null,
            });
            setEditingId(book.id)
            setIsModalOpen(true);
    }
    
    const handleDelete = async (book) => {
        const ok = confirm("Are you sure you want to delete this book?")
        if (!ok) {
            return
        }
        await deleteBook(book.id);
        const allBooks = await getAllBooks();
        setBooks(allBooks.data);
        await deleteBookVector(book.id);
    }

    return (
        <div className="p-6">
            <DataTable
                columns={bookColumns}
                data={filteredBooks}
                onAdd={() => {
                    clearForm()
                    setEditingId(null)
                    setIsModalOpen(true)
                }}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                entity="Books"
                searchValue={searchValue}
                onSearch={setSearchValue}
                searchPlaceholder="Search book name..."
            />
            <FormModal 
                    isOpen={isModalOpen} 
                    onClose={() => {
                        setIsModalOpen(false)
                        clearForm()
                    }} 
                    title={editingId ? "Update Book" : "Create Book"}
                >
                    <GenericForm
                        fields={bookFields}
                        values={form}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        disabled={isSubmitting}
                    ></GenericForm>
            </FormModal>
        </div>
    )
}