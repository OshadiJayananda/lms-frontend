import React from "react";
import { FaTimes } from "react-icons/fa";

const ConfirmUnavailableModal = ({ bookAvailability, onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Book Currently Unavailable
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-3">
            This book is currently checked out by another patron. We can notify
            you when it becomes available.
          </p>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Your requested date:</span>{" "}
              {new Date(bookAvailability?.requestedDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Notify Me When Available
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmUnavailableModal;
