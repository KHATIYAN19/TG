import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import BASE_URL from "../utils/Url";

const EmployeeDetails = () => {
  const { email } = useParams(); 
  const token = useSelector((state) => state.auth.token);

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${BASE_URL}/admin/employee/${email}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmployee(res.data.data);
      } catch (err) {
        setError("Failed to fetch employee details");
      } finally {
        setLoading(false);
      }
    };
    if (email) fetchEmployee();
  }, [email]);

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-20">{error}</div>;
  if (!employee) return null;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-gray-50 rounded-xl shadow-lg mt-10">
      
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 border-b pb-6 mb-6 mt-20">
        <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-4xl font-bold text-gray-500">
          {employee.name ? employee.name[0] : "U"}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{employee.name}</h1>
          <p className="text-gray-500">{employee.email}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge label={employee.role} color="blue" />
            <StatusBadge label={employee.status} color={employee.status === "Active" ? "green" : "red"} />
            {employee.block && <StatusBadge label="Blocked" color="red" />}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <InfoCard title="Basic Info">
          <Item label="Mobile" value={employee.mobile} />
          <Item label="Role" value={employee.role} />
          <Item label="Status" value={employee.status} />
          <Item label="Blocked" value={employee.block ? "Yes" : "No"} />
        </InfoCard>

        <InfoCard title="Personal Info">
          <Item label="DOB" value={formatDate(employee.dob)} />
          <Item label="Gender" value={employee.gender} />
          <Item label="Address" value={employee.address} />
          <Item label="Emergency Contact" value={employee.emergencyContact} />
        </InfoCard>

        <InfoCard title="Employment">
          <Item label="Employee ID" value={employee.employeeId} />
          <Item label="Department" value={employee.department} />
          <Item label="Designation" value={employee.designation} />
          <Item label="Joining Date" value={formatDate(employee.joiningDate)} />
          <Item label="Experience" value={employee.experience} />
          <Item label="Employment Type" value={employee.employmentType} />
          <Item label="Salary" value={employee.salary} />
          <Item label="Commission" value={employee.commissionRate} />
        </InfoCard>

        <InfoCard title="Bank Details">
          <Item label="Bank Name" value={employee.bankDetails?.bankName} />
          <Item label="Account Number" value={employee.bankDetails?.accountNumber} />
          <Item label="IFSC" value={employee.bankDetails?.ifsc} />
        </InfoCard>

        <InfoCard title="Government Details">
          <Item label="Aadhar" value={employee.governmentDetails?.aadharNumber} />
          <Item label="PAN" value={employee.governmentDetails?.panNumber} />
        </InfoCard>
      </div>

      {/* Documents */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Documents</h2>
        {employee.documents?.length ? (
          <div className="grid md:grid-cols-2 gap-4">
            {employee.documents.map((doc, idx) => (
              <a
                key={idx}
                href={doc.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-100 transition"
              >
                <span className="text-2xl">📄</span>
                <span>{doc.name}</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No documents uploaded</p>
        )}
      </div>
    </div>
  );
};

/* ===== Reusable Components ===== */
const InfoCard = ({ title, children }) => (
  <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
    <h3 className="font-semibold text-lg mb-3">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const Item = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-600">{label}</span>
    <span className="font-medium text-right">{value || <span className="text-gray-400">N/A</span>}</span>
  </div>
);

const StatusBadge = ({ label, color }) => {
  const colorMap = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorMap[color] || colorMap.blue}`}>
      {label}
    </span>
  );
};

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
};

export default EmployeeDetails;