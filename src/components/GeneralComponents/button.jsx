// Desc: Button component that can be used to create buttons with different colors and styles
const Button = ({ text, onClick, color, className = "" }) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200
                text-gray-700 hover:bg-${color}-200
                dark:text-gray-300 dark:hover:bg-${color}-700
                ${className}`}
        >
            {text}
        </button>
    );
};

export default Button;