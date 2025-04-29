import React, { useState } from 'react';

interface ResetFrameProps {
    resetFrame: () => void;
}

const ResetFrame = (props: ResetFrameProps) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = () => {
    props.resetFrame();
    setShowConfirm(false);  // Close the confirmation modal after deletion
  };

  const handleClick = () => {
    setShowConfirm(true);
  }

  return (
    <div>
      <button
        className="bg-yellow-600 py-2 w-32 rounded-md my-2 hover:bg-yellow-300"
        onClick={handleClick}
      >
        Reset frame
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md w-1/3 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Are you sure you want to reset this frame?</h3>
            <div className="flex justify-between">
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded-md"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white py-2 px-4 rounded-md"
                onClick={handleReset} 
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetFrame;