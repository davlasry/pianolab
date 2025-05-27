import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface TempoControlProps {
    tempo: number;
    timeSignature: string;
    onTempoChange: (tempo: number) => void;
    onSignatureChange: (signature: string) => void;
}

const TempoControl: React.FC<TempoControlProps> = ({
    tempo,
    timeSignature,
    onTempoChange,
    onSignatureChange,
}) => {
    const [tempTempo, setTempTempo] = useState(tempo.toString());

    useEffect(() => {
        setTempTempo(tempo.toString());
    }, [tempo]);

    const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTempTempo(value);

        const numericValue = parseInt(value);
        if (!isNaN(numericValue) && numericValue >= 40 && numericValue <= 300) {
            onTempoChange(numericValue);
        }
    };

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
                <Clock size={18} className="text-muted-foreground" />
                <input
                    type="text"
                    value={tempTempo}
                    onChange={handleTempoChange}
                    className="w-16 rounded-md border border-input bg-muted/50 px-2 py-1 text-center text-foreground focus:border-primary focus:outline-none"
                    aria-label="Tempo BPM"
                />
                <span className="text-sm text-muted-foreground">BPM</span>
            </div>

            <select
                value={timeSignature}
                onChange={(e) => onSignatureChange(e.target.value)}
                className="rounded-md border border-input bg-muted/50 px-2 py-1 text-foreground focus:border-primary focus:outline-none"
                aria-label="Time Signature"
            >
                <option value="4/4">4/4</option>
                <option value="3/4">3/4</option>
                <option value="6/8">6/8</option>
                <option value="5/4">5/4</option>
                <option value="7/8">7/8</option>
            </select>
        </div>
    );
};

export default TempoControl;
