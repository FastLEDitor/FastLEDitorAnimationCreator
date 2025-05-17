import PixelButtonPreview from "./PixelButtonPreview";
import "../App.css"
import { Frame } from "../pages/AnimationCreator";

interface FramePreviewProps {
  frames: Frame[];
  currentSelectedIndex: number;
  changeCurrentFrameIndex: (index: number) => void;
}

function FramePreview(props: FramePreviewProps) {
  return (
    <div className="bg-slate-700 mx-2 p-2 rounded-md">
      <div className="max-h-[700px] overflow-y-auto custom-scrollbar">
        {props.frames.map((frame, index) => {
          return (
            <div
              className={`border-4 my-2 mx-2 p-1 rounded-md ${
                (props.currentSelectedIndex == index && "border-green-600") ||
                "border-slate-400"
              } `}
              onClick={() => props.changeCurrentFrameIndex(index)}
            >
              <p className="text-slate-200 text-lg text-center">
                Frame {index + 1}
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(16, 16px)`,
                  gap: 0,
                }}
              >
                {frame.pixels.map((row, x) =>
                  row.map((pixel, y) => (
                    <PixelButtonPreview key={`${x}-${y}`} color={pixel.color} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FramePreview;
