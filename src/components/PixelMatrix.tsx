import PixelButton from "./PixelButton";
import { Color, Pixel } from "../pages/AnimationCreator";

interface PixelMatrixProps {
    pixels: Pixel[][];
    selectedColor: Color;
    handleColorChange: (x: number, y: number, color: Color) => void;
}

export function PixelMatrix(props: PixelMatrixProps) {
    const {pixels, selectedColor, handleColorChange} = props;
    return (
        <div>
        <div className="bg-slate-700 p-2 rounded-md flex justify-center">
            <div

                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(16, 32px)`,
                    gap: 0
                }}>
                {pixels.map((row, x) =>
                    row.map((pixel, y) => (
                        <PixelButton
                            key={`${x}-${y}`}
                            x={x}
                            y={y}
                            color={pixel.color}
                            selectedColor={selectedColor}
                            handleColorChange={handleColorChange}
                        />
                    ))
                )}
            </div>
        </div>

        </div>

    )
}

export default PixelMatrix;