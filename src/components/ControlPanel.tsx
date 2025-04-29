import React, { useState } from "react";
import { Color, RawFrame } from "../pages/AnimationCreator";
import DeleteFrame from "./DeleteFrame";
import ResetFrame from "./ResetFrame";
import ImportButton from "./ImportButton";

interface ControlPanelProps {
  selectedColor: Color;
  handleColorPickerChange: (color: Color) => void;
  resetMatrix: () => void;
  newFrame: () => void;
  deleteFrame: () => void;
  fillMatrix: () => void;
  copyFrame: () => void;
  pasteFrame: () => void;
  exportJson: () => void;
  importJson: (title: string, data: RawFrame[]) => void;
  connectEsp: () => void;
  numFrames: number;
}

function ControlPanel(props: ControlPanelProps) {
  const [rValue, setRvalue] = useState(props.selectedColor.r);
  const [gValue, setGvalue] = useState(props.selectedColor.g);
  const [bValue, setBvalue] = useState(props.selectedColor.b);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hexColor = e.target.value;
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    setRvalue(r);
    setGvalue(g);
    setBvalue(b);

    props.handleColorPickerChange({ r, g, b });
  };

  const handleTextInputsChange = (r: number, g: number, b: number) => {
    console.log(r);
    console.log(g);

    console.log(b);

    props.handleColorPickerChange({ r, g, b });
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col py-1.5 bg-slate-700 px-4 mb-2 rounded-md mx-2">
      <div className="flex flex-col">
        <h3 className="text-slate-200 text-lg text-center">Color</h3>
        <div className="flex justify-center">
          <input
            className="w-24"
            type="color"
            onChange={handleColorChange}
            value={rgbToHex(rValue, gValue, bValue)}
          />
        </div>

        <div className="flex flex-row justify-center my-1">
          <p className="text-slate-200 text-md">R: </p>
          <input
            className="mx-2 text-slate-200 bg-slate-600 px-1.5 rounded-md w-12"
            type="text"
            value={rValue}
            onChange={(e) => {
              setRvalue(parseInt(e.target.value));
              handleTextInputsChange(parseInt(e.target.value), gValue, bValue);
            }}
          />
        </div>

        <div className="flex flex-row justify-center my-1">
          <p className="text-slate-200 text-md align-middle">G:</p>
          <input
            className="mx-2 text-slate-200 bg-slate-600 px-1.5 rounded-md w-12"
            type="text"
            value={gValue}
            onChange={(e) => {
              setGvalue(parseInt(e.target.value));
              handleTextInputsChange(rValue, parseInt(e.target.value), bValue);
            }}
          />
        </div>
        <div className="flex flex-row justify-center my-1">
          <p className="text-slate-200 text-md align-middle">B: </p>
          <input
            className="mx-2 text-slate-200 bg-slate-600 px-1.5 rounded-md w-12"
            type="text"
            value={bValue}
            onChange={(e) => {
              setBvalue(parseInt(e.target.value));
              handleTextInputsChange(rValue, gValue, parseInt(e.target.value));
            }}
          />
        </div>
      </div>

      <hr className="h-px border-slate-500 my-1" />

      <button
        className="bg-lime-700 py-2 w-32 rounded-md my-2 hover:bg-lime-400"
        onClick={props.newFrame}
      >
        New frame
      </button>

      <button
        className="bg-slate-400 py-2 w-32 rounded-md my-2"
        onClick={props.fillMatrix}
      >
        Fill frame
      </button>

      <button
        className="bg-slate-400 py-2 w-32 rounded-md my-2"
        onClick={props.copyFrame}
      >
        Copy frame
      </button>

      <button
        className="bg-slate-400 py-2 w-32 rounded-md my-2"
        onClick={props.pasteFrame}
      >
        Paste frame
      </button>

      <ResetFrame resetFrame={props.resetMatrix} />

      <DeleteFrame deleteFrame={props.deleteFrame} activated={props.numFrames > 1} />

      <hr className="h-px border-slate-500 my-1" />

      <ImportButton importJson={props.importJson} />

      <button
        className="bg-slate-400 py-2 w-32 rounded-md my-2"
        onClick={props.exportJson}
      >
        Export JSON
      </button>

      <button
        className="bg-slate-400 py-2 w-32 rounded-md my-2"
        onClick={props.connectEsp}
      >
        Connect ESP
      </button>
    </div>

  );
}

export default ControlPanel;
