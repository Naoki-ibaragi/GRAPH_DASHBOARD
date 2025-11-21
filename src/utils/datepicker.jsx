export const OriginalDatepicker = (props) => {
    const { onChange, value, error, errorMessage, ...rest } = props;

    const formatDateTimeLocal = (date) => {
        if (!date) {
            const now = new Date();
            now.setSeconds(0, 0);
            date = now;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const defaultValue = formatDateTimeLocal(value ? new Date(value) : null);

    const handleChange = (e) => {
        if (onChange) {
            onChange(e);
        }
    };

    return (
        <div className="flex flex-col">
            <input
                className={`h-10 w-full px-3 py-2 border ${
                    error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm focus:outline-none focus:ring-2 text-sm`}
                type="datetime-local"
                onChange={handleChange}
                defaultValue={defaultValue}
                {...rest}
            />
            {error && errorMessage && (
                <p className="text-red-600 text-xs mt-1">{errorMessage}</p>
            )}
        </div>
    );
};

