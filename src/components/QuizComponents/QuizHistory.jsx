/** /src/components/QuizHistory.jsx **/
import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { ref, get } from "firebase/database";
import { database } from "../../firebase/firebase";
import { useUser } from "../../context/UserContext";

// QuizHistory component to display the user's quiz history
const QuizHistory = ({ onQuizSelect }) => {
    // Get the current user from the UserContext
    const { user } = useUser();
    // State to store the user's quiz history
    const [quizHistory, setQuizHistory] = useState([]);
    // State to store the loading status
    const [loading, setLoading] = useState(true);
    // State to store any errors that occur during fetching the quiz history
    const [error, setError] = useState(null);
    // State to store the quiz ID that was copied
    const [copiedQuizId, setCopiedQuizId] = useState(null);
    // Fetch the user's quiz history when the component mounts
    useEffect(() => {
        if (!user?.uid) return;

        const fetchQuizHistory = async () => {
            try {
                setLoading(true);
                const userQuizRef = ref(database, `users/${user.uid}/quizHistory`);
                const snapshot = await get(userQuizRef);

                if (snapshot.exists()) {
                    const quizzes = snapshot.val();
                    const formattedQuizzes = Object.entries(quizzes)
                        .map(([quizId, data]) => ({
                            quizId,
                            ...data,
                        }))
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setQuizHistory(formattedQuizzes);
                } else {
                    setQuizHistory([]);
                }
            } catch (err) {
                console.error("Error fetching quiz history:", err);
                setError("Failed to fetch quiz history. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchQuizHistory();
    }, [user?.uid]);
    // Function to copy the quiz link to the clipboard
    const handleCopyLink = (quizId) => {
        const url = `${window.location.origin}/quiz/${quizId}`;
        navigator.clipboard.writeText(url)
            .then(() => {
                setCopiedQuizId(quizId);
                setTimeout(() => setCopiedQuizId(null), 2000);
            })
            .catch((err) => {
                console.error("Failed to copy link:", err);
            });
    };
    // If the user is not logged in, show a message to log in
    if (!user) return <p className="text-center">Please log in to view your quiz history.</p>;
    // If the quiz history is loading, show a loading message
    if (loading) return <p className="text-gray-600 dark:text-gray-300 text-center">Loading quiz history...</p>;
    // If there is an error fetching the quiz history, show an error message
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white text-center">
                Quiz History
            </h2>
            {quizHistory.length === 0 ? (
                <p className="text-gray-700 dark:text-gray-300 text-center">
                    No quizzes found. Create your first quiz to see it here!
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quizHistory.map((quiz) => (
                        <div
                            key={quiz.quizId}
                            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700"
                        >
                            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                {quiz.title || "Untitled Quiz"}
                            </h3>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Created: {new Date(quiz.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Questions: {quiz.questions?.length || 0}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Responses: {quiz.responses || 0}
                                </p>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                <button
                                    onClick={() => onQuizSelect(quiz)}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-all duration-200"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleCopyLink(quiz.quizId)}
                                    className={`px-4 py-2 rounded text-white font-semibold transition-all duration-200 ${
                                        copiedQuizId === quiz.quizId
                                            ? "bg-green-500 hover:bg-green-600"
                                            : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                                    }`}
                                >
                                    {copiedQuizId === quiz.quizId ? "Copied!" : "Copy Link"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuizHistory;
