import FormInput from "./FormInput";

export default function GenericForm({
	fields,
	values,
	onChange,
	onSubmit,
	disabled = false,
	gridCols = "grid-cols-1 md:grid-cols-2"
}) {
	return (
		<form onSubmit={onSubmit}>
			<div className={`grid ${gridCols} gap-4`}>
				{fields.map((field) => (
					<FormInput
						key={field.name}
						{...field}
						value={values[field.name] || ""}
						onChange={onChange}
					/>
				))}
			</div>

			<div className="flex justify-end mt-6">
				<button
					type="submit"
					className="btn btn-success text-black"
					disabled={disabled}
				>
					{disabled ? (
						<>
							<span className="spinner" />
							Submitting...
						</>
					) : (
						"Submit"
					)}
				</button>
			</div>
		</form>
	);
}
