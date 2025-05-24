import { Link } from "react-router-dom";

export const Home = () => {
    return (
        <div className="container mx-auto py-8 text-center">
            <h1 className="text-4xl font-bold mb-8">Welcome to PianoLab</h1>
            <div className="space-x-4">
                <Link to="/pieces" className="text-blue-500 hover:underline">
                    View Pieces
                </Link>
                <Link to="/sessions" className="text-blue-500 hover:underline">
                    View Sessions
                </Link>
            </div>
        </div>
    );
};
