import { useParams } from "react-router-dom";

export default function TestPage() {
    const { sessionId } = useParams();

    return (
        <div className="container mx-auto p-8">
            <h1 className="mb-4 text-2xl font-bold">Test Page</h1>
            <p>Session ID: {sessionId}</p>
        </div>
    );
}
