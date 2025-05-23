import { Pieces } from "@/components/Pieces/Pieces.tsx";
import { Recordings } from "@/components/Recordings/Recordings.tsx";
import { useNavigate } from "react-router-dom";

export const Home = () => {
    const navigate = useNavigate();

    const handleRecordingClick = (recordingId: string) => {
        navigate(`/recording/${recordingId}`);
    };

    return (
        <div>
            <div>
                <Pieces />
                <Recordings />
            </div>
        </div>
    );
};
