import React from "react";
import { Color } from "../pages/AnimationCreator";

interface PixelButtonPreviewProps {
    color: Color;
}

function PixelButtonPreview(props: PixelButtonPreviewProps) {
    return (
        <button title={`R: ${props.color.r} G: ${props.color.g} B: ${props.color.b}`}
            className="w-4 h-4 border border-slate-600"
            style={{ backgroundColor: `rgb(${props.color.r}, ${props.color.g}, ${props.color.b})` }} />
    )
}

export default PixelButtonPreview;