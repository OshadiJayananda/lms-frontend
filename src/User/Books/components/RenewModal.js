import React from "react";
import { FaTimes } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const RenewModal = ({
  exactReturnDate,
  renewDate,
  setRenewDate,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Renew Your Book</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Current due date:{" "}
            <span className="font-medium">
              {exactReturnDate?.toLocaleDateString()}
            </span>
          </p>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select new return date:
          </label>
          <DatePicker
            selected={renewDate}
            onChange={(date) => setRenewDate(date)}
            minDate={exactReturnDate}
            maxDate={
              new Date(exactReturnDate.getTime() + 30 * 24 * 60 * 60 * 1000)
            }
            inline
            highlightDates={[exactReturnDate]}
            className="border rounded-lg p-2 w-full"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={!renewDate}
          >
            Submit Renewal
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenewModal;
