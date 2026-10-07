function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  options = [],
  min,
  step,
  accept,
  disabled = false,
  pattern,
  minLength,
  maxLength,
  error
}) {
  return (
    <fieldset className="fieldset w-full">
      <legend className="fieldset-legend">{label}</legend>

      {type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`textarea ${error ? "input-error" : ""}`}
        />
      ) : type === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`select ${error ? "select-error" : ""}`}
        >
          <option value="" disabled>
              {""}
          </option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "file" ? (
        <input type={type}
          name={name}
          className="file-input"
          onChange={onChange}
          required={required}
          accept={accept}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          step={step}
          pattern={pattern}
          minLength={minLength}
          maxLength={maxLength}
          className={`input ${error ? "input-error" : ""}`}
        />
      )}

      {error && (
        <p className="label text-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export default FormInput;