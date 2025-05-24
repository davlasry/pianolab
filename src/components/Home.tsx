import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Home = () => {
    return (
        <div className="container">
            <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-8 text-center">
                <h1 className="text-4xl font-bold tracking-tight">
                    Welcome to PianoLab
                </h1>
                <div className="flex gap-4">
                    <Button asChild variant="secondary">
                        <Link to="/pieces">View Pieces</Link>
                    </Button>
                    <Button asChild variant="secondary">
                        <Link to="/sessions">View Sessions</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};
