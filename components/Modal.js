import React, { useState, useEffect } from 'react';

const defaultFields = {
  firstName: '',
  lastName: '',
  university: '',
  college: '',
  department: '',
  course: '',
  yearOfStudy: '',
  semester: '',
  unit: '',
  role: 'user', // Hidden from user, always 'user' by default
};

/**
 * Modal for collecting/updating user details
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is open
 * @param {function} props.onClose - Function to close the modal
 * @param {function} props.onSubmit - Function to handle form submit
 * @param {Object} [props.initialValues] - Optional initial values to prefill fields
 */
const Modal = ({ open, onClose, onSubmit, initialValues = {} }) => {
  const [fields, setFields] = useState({ ...defaultFields, ...initialValues });

  useEffect(() => {
    setFields({ ...defaultFields, ...initialValues });
  }, [initialValues, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(fields);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-8 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">Update Profile Details</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={fields.firstName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={fields.lastName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">University</label>
            <input
              type="text"
              name="university"
              value={fields.university}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">College</label>
            <input
              type="text"
              name="college"
              value={fields.college}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <input
              type="text"
              name="department"
              value={fields.department}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Course</label>
            <input
              type="text"
              name="course"
              value={fields.course}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Year of Study</label>
              <input
                type="text"
                name="yearOfStudy"
                value={fields.yearOfStudy}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Semester</label>
              <input
                type="text"
                name="semester"
                value={fields.semester}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unit</label>
            <input
              type="text"
              name="unit"
              value={fields.unit}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          {/* Hidden role field */}
          <input type="hidden" name="role" value={fields.role} />
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded font-semibold mt-4 transition"
          >
            Save Details
          </button>
        </form>
      </div>
    </div>
  );
};

export default Modal;