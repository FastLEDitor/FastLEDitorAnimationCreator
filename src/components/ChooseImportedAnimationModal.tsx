interface ModalProps {
  options: string[];
  onSelect: (selected: string) => void;
  onClose: () => void;
}

function ChooseImportedAnimationModal (props: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Choose an animation</h2>
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {props.options.map((option, index) => (
            <li key={index}>
              <button
                onClick={() => {
                    props.onSelect(option)
                    props.onClose();
                }}
                className="w-full text-left px-4 py-2 rounded hover:bg-slate-200 transition"
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={props.onClose}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ChooseImportedAnimationModal;
