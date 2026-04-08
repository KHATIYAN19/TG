import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../utils/Url";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const InterestDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("active"); // active | deleted

  const fetchData = async (type) => {
    try {
      setLoading(true);

      const url =
        type === "deleted"
          ? `${BASE_URL}/interest/deleted-all`
          : `${BASE_URL}/interest/all`;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const sorted = res.data.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setData(sorted);
    } catch (err) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial load
  useEffect(() => {
    fetchData(view);
  }, [view]);

  // ✅ Delete (only for active list)
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/interest/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Deleted successfully");

      // refresh list
      fetchData(view);
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6 mt-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Interest Dashboard</h1>

        {/* Toggle Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setView("active")}
            className={`px-4 py-2 rounded-lg ${
              view === "active"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Active Leads
          </button>

          <button
            onClick={() => setView("deleted")}
            className={`px-4 py-2 rounded-lg ${
              view === "deleted"
                ? "bg-red-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Deleted Leads
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-sm text-gray-600">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Service</th>
              <th className="p-4">Date</th>
              {view === "active" && (
                <th className="p-4 text-right">Action</th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center p-6">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-500">
                  No data found
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item._id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4">{item.contactNumber}</td>
                  <td className="p-4">{item.service}</td>

                  <td className="p-4 text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>

                  {/* Delete only in active */}
                  {view === "active" && (
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InterestDashboard;