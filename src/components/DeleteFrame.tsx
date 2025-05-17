import { useState } from 'react';

interface DeleteFrameProps {
    deleteFrame: () => void;
    activated: boolean;
}

const DeleteFrame = (props: DeleteFrameProps) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    props.deleteFrame();
    setShowConfirm(false);  // Close the confirmation modal after deletion
  };

  const handleClick = () => {
    if (!props.activated)
        return;
    setShowConfirm(true);
  }

  return (
    <div>
      {/* Delete button */}
      <button
        className="bg-red-700 py-2 w-32 rounded-md my-2 font-bold hover:bg-red-300"
        onClick={handleClick}  // Show the confirmation modal on click
      >
        Delete frame
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md w-1/3 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Are you sure you want to delete this frame?</h3>
            <div className="flex justify-between">
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded-md"
                onClick={() => setShowConfirm(false)}  // Close the modal without deleting
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white py-2 px-4 rounded-md"
                onClick={handleDelete}  // Call the delete function
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

export default DeleteFrame;