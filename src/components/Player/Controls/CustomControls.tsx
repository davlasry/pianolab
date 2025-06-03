import CustomDigitalClock from "@/components/Player/Controls/components/CustomDigitalClock";
import { CustomPlaybackRateControl } from "@/components/Player/Controls/components/CustomPlaybackRateControl";

function CustomControls() {
    return (
        <div className="flex flex-1 items-center gap-4 bg-muted">
            <CustomDigitalClock />

            <div className="flex items-center gap-2">
                <CustomPlaybackRateControl />
            </div>
        </div>
    );
}

export default CustomControls;
