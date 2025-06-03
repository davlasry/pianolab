import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music, Bug } from "lucide-react";

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

                <div className="mt-8 rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold">New Feature</h2>
                    <p className="mb-4 text-muted-foreground">
                        Try our new custom player with synchronized
                        variable-speed playback!
                    </p>
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <Button asChild>
                            <Link to="/custom-player/1">
                                <Music className="mr-2 h-4 w-4" />
                                Try Custom Player
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link to="/test/1">
                                <Bug className="mr-2 h-4 w-4" />
                                Test Route
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
