import { useRef, useState } from "react";
import "../App.css";
import PixelMatrix from "../components/PixelMatrix";
import ControlPanel from "../components/ControlPanel";
import FramePreview from "../components/FramePreview";
import TitleBar from "../components/TitleBar";
import ChooseImportedAnimationModal from "../components/ChooseImportedAnimationModal";

export type Color = {
  r: number;
  g: number;
  b: number;
};

export type Pixel = {
  x: number;
  y: number;
  color: Color;
};

export type Frame = {
  pixels: Pixel[][];
};

export type RawFrame = {
  pixels: Pixel[];
};

function AnimationCreator() {
  const CHUNK_SIZE = 256;
  const portRef = useRef<SerialPort | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter | null>(null);
  const [selectedColor, setSelectedColor] = useState<Color>({
    r: 0,
    g: 0,
    b: 0,
  });
  const [frames, setFrames] = useState<Frame[]>([
    {
      pixels: Array.from({ length: 16 }, (_, row) =>
        Array.from({ length: 16 }, (_, col) => ({
          x: col,
          y: row,
          color: { r: 0, g: 0, b: 0 },
        }))
      ),
    },
  ]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [copiedFrame, setCopiedFrame] = useState<Frame | null>(null);
  const [title, setTitle] = useState("");
  const [hasTitleError, setHasTitleError] = useState(false);
  const [importedAnimationNames, setImportedAnimationsNames] = useState<
    string[]
  >([]);
  const [isAnimationModalOpen, setIsAnimationModalOpen] = useState(false);

  async function exportToEsp() {
    setHasTitleError(title.length === 0);
    if (title.length === 0) return;

    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });

      const writer = port.writable.getWriter();
      portRef.current = port;
      writerRef.current = writer;
      portRef.current = port;
      writerRef.current = writer;

      const commandBytes = new TextEncoder().encode("addAnimation");
      const titleBytes = new TextEncoder().encode(title);
      const animationBytes = serializeToBytes(getFramesDifference(frames));

      if (titleBytes.length > 255) throw new Error("Title too long");

      const animationLength = animationBytes.length;
      if (animationLength > 0xffff) throw new Error("Animation too long");

      const argLength = 1 + titleBytes.length + animationLength;

      const totalLength = 1 + commandBytes.length + argLength;
      const messageWithoutLength = new Uint8Array(totalLength);

      // Write command
      let offset = 0;
      messageWithoutLength[offset++] = commandBytes.length;
      messageWithoutLength.set(commandBytes, offset);
      offset += commandBytes.length;

      // Write title
      messageWithoutLength[offset++] = titleBytes.length;
      messageWithoutLength.set(titleBytes, offset);
      offset += titleBytes.length;

      // Write animation data
      messageWithoutLength.set(animationBytes, offset);

      const totalSize = messageWithoutLength.length;

      const finalMessage = new Uint8Array(totalSize + 2);
      finalMessage[0] = (totalSize >> 8) & 0xff;
      finalMessage[1] = totalSize & 0xff;
      finalMessage.set(messageWithoutLength, 2);


      for (let i = 0; i < finalMessage.length; i += CHUNK_SIZE) {
        const chunk = finalMessage.slice(i, i + CHUNK_SIZE);
        await writer.write(chunk);
        await new Promise((r) => setTimeout(r, 10)); // small delay to prevent overflow
      }

      await writer.close();

      await port.close();
    } catch (err) {
      console.error("Connection error: ", err);
    }
  }

  function serializeToBytes(diffs: { pixels: Pixel[] }[]): Uint8Array {
    const byteArray: number[] = [];

    byteArray.push(diffs.length & 0xff);

    for (const frame of diffs) {
      const pixelCount = frame.pixels.length;

      byteArray.push((pixelCount >> 8) & 0xff, pixelCount & 0xff);

      for (const pixel of frame.pixels) {
        const coords = ((pixel.x & 0x0f) << 4) | (pixel.y & 0x0f);
        byteArray.push(coords);
        byteArray.push(pixel.color.r & 0xff);
        byteArray.push(pixel.color.g & 0xff);
        byteArray.push(pixel.color.b & 0xff);
      }
    }

    return new Uint8Array(byteArray);
  }

  async function getAnimationsNames() {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });

      const writer = port.writable.getWriter();
      portRef.current = port;
      writerRef.current = writer;
      portRef.current = port;
      writerRef.current = writer;

      const commandBytes = new TextEncoder().encode("getAnimationsNames");

      const totalLength = 1 + commandBytes.length;
      const messageWithoutLength = new Uint8Array(totalLength);

      // Write command
      let offset = 0;
      messageWithoutLength[offset++] = commandBytes.length;
      messageWithoutLength.set(commandBytes, offset);
      offset += commandBytes.length;

      const totalSize = messageWithoutLength.length;

      const finalMessage = new Uint8Array(totalSize + 2);
      finalMessage[0] = (totalSize >> 8) & 0xff;
      finalMessage[1] = totalSize & 0xff;
      finalMessage.set(messageWithoutLength, 2);

      for (let i = 0; i < finalMessage.length; i += CHUNK_SIZE) {
        const chunk = finalMessage.slice(i, i + CHUNK_SIZE);

        await writer.write(chunk);
        await new Promise((r) => setTimeout(r, 10)); // small delay to prevent overflow
      }

      const reader = port.readable.getReader();
      let buffer: number[] = [];
      let started = false;
      let messageComplete = false;
      let payload: Uint8Array | null = null;

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (!value) continue;

          for (let byte of value) {
            if (!started) {
              if (byte === 0x7E) {
                started = true;
                buffer = [];
              }
              continue;
            }

            if (byte === 0x7F) {
              const data = new Uint8Array(buffer);

              if (data.length < 2) {
                console.error("Data too short for length");
                started = false;
                continue;
              }

              const declaredLength = ((data[0] << 8) | data[1]) - 2;
              payload = data.slice(2, declaredLength + 2);

              if (payload.length !== declaredLength) {
                console.error(`Length mismatch: expected ${declaredLength}, got ${payload.length}`);
                started = false;
                continue;
              }
              messageComplete = true;
              break;
            }

            buffer.push(byte);
          }

          if (messageComplete) {
            await reader.cancel();
            break;
          }
        }
      } finally {
        await reader.releaseLock();
        await writer.close();
        await port.close();
      }

      const decoder = new TextDecoder();
      if (payload === null) {
        console.error("Failed to get payload from ESP32");
        return;
      }
      const titles: string[] = [];
      for (let i = 0; i < payload.length;) {
        let length = payload[i];
        i += 1;
        const toDecode = payload.slice(i, i + length);
        for (let j = 0; j < length; j++) {
          toDecode[j] = payload[i + j];
        }
        titles.push(decoder.decode(toDecode));
        i += length;
      }

      setImportedAnimationsNames(titles);

    } catch (err) {
      console.error("Connection error: ", err);
    }
  }

  async function handleChangeIsModalOpen(isOpen: boolean) {
    if (isOpen) {
      await getAnimationsNames();
    }
    setIsAnimationModalOpen(isOpen);
  }

  function handleNewFrame() {
    setFrames((prevFrames) => {
      const newFrame = {
        pixels: Array.from({ length: 16 }, (_, row) =>
          Array.from({ length: 16 }, (_, col) => ({
            x: col,
            y: row,
            color: { r: 0, g: 0, b: 0 },
          }))
        ),
      };

      const updatedFrames = [
        ...prevFrames.slice(0, currentFrameIndex + 1),
        newFrame,
        ...prevFrames.slice(currentFrameIndex + 1),
      ];

      setCurrentFrameIndex(currentFrameIndex + 1);
      return updatedFrames;
    });
  }

  function handleDeleteFrame() {
    setFrames((prevFrames) => {
      if (prevFrames.length <= 1) return prevFrames;

      const newFrames = prevFrames.filter(
        (_, index) => index !== currentFrameIndex
      );

      setCurrentFrameIndex((prevIndex) => {
        if (prevIndex === newFrames.length) {
          return prevIndex - 1;
        }
        return prevIndex;
      });

      return newFrames;
    });
  }

  function serializeAnimation() {
    return JSON.stringify({
      name: title,
      frames: getFramesDifference(frames),
    });
  }

  function handleCopy() {
    setCopiedFrame(frames[currentFrameIndex]);
  }

  function handlePaste() {
    if (copiedFrame) {
      setFrames((prevFrames) => {
        const newFrames = [...prevFrames];
        newFrames[currentFrameIndex] = copiedFrame;
        return newFrames;
      });
    }
  }

  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
  }

  function handleColorChange(x: number, y: number, color: Color) {
    setFrames((prevFrames) => {
      return prevFrames.map((frame, index) => {
        if (index === currentFrameIndex) {
          const newPixels = frame.pixels.map((row, rowIndex) => {
            if (rowIndex !== x) return row;
            return row.map((pixel, colIndex) => {
              if (colIndex !== y) return pixel;
              return { ...pixel, color };
            });
          });

          return { ...frame, pixels: newPixels };
        }

        return frame;
      });
    });
  }

  function importJson(title: string, data: RawFrame[]) {
    setTitle(title);
    const fullFrames: Frame[] = [];

    data.forEach((rawFrame, index) => {
      const pixels: Pixel[][] = Array.from({ length: 16 }, (_, y) =>
        Array.from({ length: 16 }, (_, x) => ({
          x,
          y,
          color: { r: 0, g: 0, b: 0 },
        }))
      );

      if (index > 0) {
        fullFrames[index - 1].pixels.forEach((row, y) => {
          row.forEach((prevPixel, x) => {
            pixels[y][x] = prevPixel;
          });
        });
      }
      rawFrame.pixels.forEach((pixel) => {
        pixels[pixel.y][pixel.x] = pixel;
      });

      fullFrames.push({ pixels });
    });

    setFrames(fullFrames);
  }

  function handleSetCurrentIndex(index: number) {
    setCurrentFrameIndex(index);
    console.log(currentFrameIndex);
  }

  function getFramesDifference(frames: Frame[]) {
    if (frames.length === 0) return [];

    const filteredBasePixels: Pixel[] = frames[0].pixels
      .flat()
      .filter(
        (pixel) =>
          !(pixel.color.r === 0 && pixel.color.g === 0 && pixel.color.b === 0)
      );

    const baseFrame = { ...frames[0], pixels: filteredBasePixels };

    const diffs: any[] = [baseFrame];

    for (let i = 1; i < frames.length; i++) {
      const diffPixels: Pixel[] = [];

      for (let y = 0; y < frames[i].pixels.length; y++) {
        for (let x = 0; x < frames[i - 1].pixels[y].length; x++) {
          const basePixel = frames[i - 1].pixels[y][x];
          const currPixel = frames[i].pixels[y][x];

          if (
            basePixel.color.r !== currPixel.color.r ||
            basePixel.color.g !== currPixel.color.g ||
            basePixel.color.b !== currPixel.color.b
          ) {
            diffPixels.push(currPixel);
          }
        }
      }

      diffs.push({ pixels: diffPixels });
    }

    return diffs;
  }

  function exportJson() {
    setHasTitleError(title.length === 0);
    if (hasTitleError) return;

    const json = serializeAnimation();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "export"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // cleanup
    console.log(json);
  }

  async function importJsonAnimationFromEsp(name: string) {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });

      const textEncoder = new TextEncoderStream();
      const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
      const writer = textEncoder.writable.getWriter();
      portRef.current = port;
      writerRef.current = writer;

      const data = {
        command: "getAnimation",
        arguments: [name],
      };

      const json = JSON.stringify(data);

      await writerRef.current.write(json + "\n");

      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();

      let receivedData = "";
      let isCapturing = false;
      let finalData = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          reader.releaseLock();
          break;
        }

        receivedData += value;

        // Check for START
        if (receivedData.includes("<<START>>")) {
          isCapturing = true;
          receivedData = receivedData.substring(
            receivedData.indexOf("<<START>>") + 9
          ); // skip the marker
        }

        // Capture data
        if (isCapturing) {
          // If END is reached, stop capturing
          if (receivedData.includes("<<END>>")) {
            finalData = receivedData.substring(
              0,
              receivedData.indexOf("<<END>>")
            );
            reader.cancel();
            break;
          }
        }
      }

      const animationObj = JSON.parse(finalData);
      importJson(animationObj.name, animationObj.frames);

      await writer.close();
      await writableStreamClosed.catch(() => { });

      await reader.releaseLock();
      await readableStreamClosed.catch(() => { }); // wait for pipeTo to close

      await port.close();
    } catch (err) {
      console.error("Connection error: ", err);
    }
  }

  function resetMatrix() {
    setFrames((prevFrames) => {
      return prevFrames.map((frame, index) => {
        if (index === currentFrameIndex) {
          const newPixels = frame.pixels.map((row) =>
            row.map((pixel) => ({
              ...pixel,
              color: { r: 0, g: 0, b: 0 },
            }))
          );

          return { ...frame, pixels: newPixels };
        }

        return frame;
      });
    });
  }

  function fillMatrix() {
    setFrames((prevFrames) => {
      return prevFrames.map((frame, index) => {
        if (index === currentFrameIndex) {
          const newPixels = frame.pixels.map((row) =>
            row.map((pixel) => ({
              ...pixel,
              color: selectedColor,
            }))
          );

          return { ...frame, pixels: newPixels };
        }

        return frame;
      });
    });
  }
  function handleColorPickerChange(color: Color) {
    setSelectedColor(color);
  }
  return (
    <div className="flex justify-center flex-row mt-2">
      <div className="flex flex-row">
        <div>
          <ControlPanel
            handleColorPickerChange={handleColorPickerChange}
            selectedColor={selectedColor}
            fillMatrix={fillMatrix}
            resetMatrix={resetMatrix}
            newFrame={handleNewFrame}
            deleteFrame={handleDeleteFrame}
            copyFrame={handleCopy}
            pasteFrame={handlePaste}
            numFrames={frames.length}
            exportJson={exportJson}
            importJson={importJson}
            exportToEsp={exportToEsp}
            setIsModalOpen={() => handleChangeIsModalOpen(true)}
          />
        </div>
        {isAnimationModalOpen && (
          <ChooseImportedAnimationModal
            options={importedAnimationNames}
            onSelect={importJsonAnimationFromEsp}
            onClose={() => setIsAnimationModalOpen(false)}
          />
        )}
        <div>
          <TitleBar
            title={title}
            setTitle={handleTitleChange}
            hasError={hasTitleError}
          />
          {frames.length > 0 && (
            <PixelMatrix
              pixels={frames[currentFrameIndex].pixels}
              selectedColor={selectedColor}
              handleColorChange={handleColorChange}
            />
          )}
        </div>
      </div>
      <div className="overflow-y-auto">
        {frames.length > 0 && (
          <FramePreview
            frames={frames}
            currentSelectedIndex={currentFrameIndex}
            changeCurrentFrameIndex={handleSetCurrentIndex}
          />
        )}
      </div>
    </div>
  );
}

export default AnimationCreator;
