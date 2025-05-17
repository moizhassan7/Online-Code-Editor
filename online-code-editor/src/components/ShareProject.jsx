// ShareProject.jsx
import { useState } from 'react';
import { FiShare2, FiUserPlus } from 'react-icons/fi';

export default function ShareProject({ projectId }) {
  const [email, setEmail] = useState('');
  const [access, setAccess] = useState('view');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleShare = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ email, access })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      setEmail('');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group">
      <button className="p-2 hover:bg-gray-100 rounded-lg">
        <FiShare2 className="w-5 h-5" />
      </button>
      
      <div className="hidden group-hover:block absolute right-0 top-8 bg-white p-4 rounded-lg shadow-lg w-64">
        <h3 className="font-semibold mb-2">Share Project</h3>
        <form onSubmit={handleShare}>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-2 p-2 border rounded"
            required
          />
          <select
            value={access}
            onChange={(e) => setAccess(e.target.value)}
            className="w-full mb-2 p-2 border rounded"
          >
            <option value="view">Can view</option>
            <option value="edit">Can edit</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {loading ? 'Sharing...' : 'Share'}
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}