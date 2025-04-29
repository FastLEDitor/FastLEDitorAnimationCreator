import { useRef } from "react";
import { RawFrame } from "../pages/AnimationCreator";

function ImportButton(props: { importJson: (title: string, frames: RawFrame[]) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(reader.result as string);
                props.importJson(parsed.name, parsed.frames); // pass parsed JSON to parent
            } catch (err) {
                alert("Invalid JSON file");
                console.error(err);
            }
        };
        reader.readAsText(file);
    };

    return (
        <>
            <button
                className="bg-slate-400 py-2 w-32 rounded-md my-2"
                onClick={() => inputRef.current?.click()}
            >
                Import JSON
            </button>

            <input
                type="file"
                accept="application/json"
                ref={inputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
            />
        </>
    );
}

export default ImportButton;