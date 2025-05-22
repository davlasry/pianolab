import { Pieces } from "@/components/Pieces/Pieces.tsx";
import { Recordings } from "@/components/Recordings/Recordings.tsx";

export const Home = () => {
    return (
        <div>
            <div>
                <Pieces />
                <Recordings />
            </div>
        </div>
    );
};
