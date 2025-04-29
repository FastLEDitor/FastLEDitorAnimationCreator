import React from "react";
import { Color } from "../pages/AnimationCreator";

interface PixelButtonProps {
    color: Color;
    selectedColor: Color;
    x: number;
    y: number;
    handleColorChange: (x: number, y: number, color: Color) => void;
}

export function PixelButton(props: PixelButtonProps) {
    const { color, selectedColor, x, y, handleColorChange} = props;

    const handleClick = () => {
        handleColorChange(x, y,selectedColor);
    }

    function handleRickClick (e: React.MouseEvent) {
        e.preventDefault();
        props.handleColorChange(x, y, { r: 0, g: 0, b: 0 });
    }

    return (
        <button title={`R: ${color.r} G: ${color.g} B: ${color.b}`}
            onClick={handleClick}
            onContextMenu={handleRickClick}
            className="w-8 h-8 border border-slate-600"
            style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }} />
    )
}

export default PixelButton;