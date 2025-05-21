import { useFetchPieces } from "@/hooks/useFetchPieces.ts";

export const Pieces = () => {
    const { pieces } = useFetchPieces();
    console.log('pieces =====>', pieces);

    return (
        <div>
            <h2>Pieces</h2>
        </div>
    );
};
