// pages/customer/Profile.jsx
import { useState } from "react";
import { User, Shield, Edit2, CheckCircle, FileText, Upload, X, Briefcase, CreditCard, TrendingUp } from "lucide-react";
import { useSelector } from "react-redux";
import { useUpdateProfileMutation, useUploadKYCMutation } from "../api/customerApi";

export default function CustomerProfile() {
  const { user: userInfo } = useSelector(state => state.auth);
  const { profile } = useSelector(state => state.customer);

  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingKYC, setIsUploadingKYC] = useState(false);

  const [formData, setFormData] = useState({
    first_name: userInfo?.first_name || "",
    last_name: userInfo?.last_name || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
    date_of_birth: profile?.date_of_birth || "",
    aadhaar_number: profile?.aadhaar_number || "",
    pan_number: profile?.pan_number || "",
    monthly_salary: profile?.monthly_salary || "",
    employment_type: profile?.employment_type || "SALARIED",
    company_name: profile?.company_name || "",
  });

  const [kycFiles, setKycFiles] = useState({
    aadhaar_doc: null,
    pan_doc: null,
  });

  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();
  const [uploadKYC, { isLoading: uploading }] = useUploadKYCMutation();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (type, file) => {
    if (file) {
      setKycFiles(prev => ({ ...prev, [type]: file }));
    }
  };

  const handleProfileSave = async () => {
    try {
      await updateProfile(formData).unwrap();
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch {
      alert("Failed to update profile");
    }
  };

  const handleKYCUpload = async () => {
    if (!kycFiles.aadhaar_doc || !kycFiles.pan_doc) {
      alert("Please upload both Aadhaar and PAN.");
      return;
    }

    const formData = new FormData();
    formData.append("aadhaar_doc", kycFiles.aadhaar_doc);
    formData.append("pan_doc", kycFiles.pan_doc);

    try {
      await uploadKYC(formData).unwrap();
      setKycFiles({ aadhaar_doc: null, pan_doc: null });
      setIsUploadingKYC(false);
      alert("KYC documents uploaded successfully!");
    } catch {
      alert("KYC upload failed");
    }
  };

  const kycStatus = profile?.kyc_status || "pending";
  const kycStatusColor = {
    verified: "text-green-600 bg-green-50",
    submitted: "text-blue-600 bg-blue-50",
    pending: "text-yellow-600 bg-yellow-50",
    rejected: "text-red-600 bg-red-50",
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal details and complete KYC</p>
        </div>

        {!isEditing && kycStatus !== "verified" && (
          <button
            onClick={() => setIsUploadingKYC(true)}
            className="bg-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700 flex items-center gap-2"
          >
            <Upload className="w-5 h-5" /> Complete KYC
          </button>
        )}
      </div>

      {/* Layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <img
              src="https://avatars.githubusercontent.com/u/121487855?v=4"
              className="w-32 h-32 rounded-full mx-auto border-4 border-teal-100"
              alt="Profile"
            />
            <h2 className="text-2xl font-bold text-gray-800 mt-6">
              {userInfo?.first_name} {userInfo?.last_name}
            </h2>

            <div className={`mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full font-medium ${kycStatusColor[kycStatus]}`}>
              <Shield className="w-5 h-5" />
              <span className="capitalize">KYC {kycStatus}</span>
              {kycStatus === "verified" && <CheckCircle className="w-5 h-5" />}
            </div>
          </div>

          {/* Credit Score Card */}
          {kycStatus === "verified" && profile?.credit_score && (
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6" />
                <h3 className="text-lg font-bold">Credit Score</h3>
              </div>
              <div className="text-5xl font-bold mb-2">{profile.credit_score}</div>
              <p className="text-purple-100 text-sm">
                {profile.credit_score >= 750 ? "Excellent" : 
                 profile.credit_score >= 650 ? "Good" : 
                 profile.credit_score >= 550 ? "Fair" : "Needs Improvement"}
              </p>
              <div className="mt-4 pt-4 border-t border-purple-400">
                <p className="text-sm text-purple-100">Max Eligible Loan</p>
                <p className="text-2xl font-bold">₹{parseFloat(profile.max_eligible_loan || 0).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="lg:col-span-2 space-y-6">

          {/* Personal Info */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <User className="w-6 h-6 text-teal-600" /> Personal Information
              </h3>

              <button
                onClick={() => (isEditing ? handleProfileSave() : setIsEditing(true))}
                disabled={updating}
                className="text-teal-600 hover:underline font-medium flex items-center gap-2"
              >
                {isEditing ? (updating ? "Saving..." : "Save") : <><Edit2 className="w-4 h-4" /> Edit</>}
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {isEditing ? (
                <>
                  <input name="first_name" value={formData.first_name} onChange={handleInputChange} className="border rounded-lg px-4 py-3" placeholder="First Name" />
                  <input name="last_name" value={formData.last_name} onChange={handleInputChange} className="border rounded-lg px-4 py-3" placeholder="Last Name" />
                  <input name="phone" value={formData.phone} onChange={handleInputChange} className="border rounded-lg px-4 py-3" placeholder="Phone" />
                  <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} className="border rounded-lg px-4 py-3" />
                  <textarea name="address" value={formData.address} onChange={handleInputChange} className="md:col-span-2 border rounded-lg px-4 py-3" placeholder="Full Address" rows="3" />
                </>
              ) : (
                <>
                  <div><label className="text-sm text-gray-500">Full Name</label><p className="font-semibold">{userInfo?.first_name} {userInfo?.last_name}</p></div>
                  <div><label className="text-sm text-gray-500">Email</label><p className="font-semibold">{userInfo?.email}</p></div>
                  <div><label className="text-sm text-gray-500">Phone</label><p className="font-semibold">{profile?.phone || "Not set"}</p></div>
                  <div><label className="text-sm text-gray-500">Date of Birth</label><p className="font-semibold">{profile?.date_of_birth || "Not set"}</p></div>
                  <div className="md:col-span-2"><label className="text-sm text-gray-500">Address</label><p className="font-semibold">{profile?.address || "Not set"}</p></div>
                </>
              )}
            </div>
          </div>

          {/* KYC Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-teal-600" /> KYC Information
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {isEditing ? (
                <>
                  <input 
                    name="aadhaar_number" 
                    value={formData.aadhaar_number} 
                    onChange={handleInputChange} 
                    className="border rounded-lg px-4 py-3" 
                    placeholder="Aadhaar Number (12 digits)"
                    maxLength="12"
                  />
                  <input 
                    name="pan_number" 
                    value={formData.pan_number} 
                    onChange={handleInputChange} 
                    className="border rounded-lg px-4 py-3" 
                    placeholder="PAN Number"
                    maxLength="10"
                    style={{textTransform: 'uppercase'}}
                  />
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm text-gray-500">Aadhaar Number</label>
                    <p className="font-semibold">{profile?.aadhaar_number || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">PAN Number</label>
                    <p className="font-semibold">{profile?.pan_number || "Not provided"}</p>
                  </div>
                  {profile?.kyc_submitted_at && (
                    <div>
                      <label className="text-sm text-gray-500">KYC Submitted</label>
                      <p className="font-semibold">{new Date(profile.kyc_submitted_at).toLocaleDateString()}</p>
                    </div>
                  )}
                  {profile?.kyc_verified_at && (
                    <div>
                      <label className="text-sm text-gray-500">KYC Verified</label>
                      <p className="font-semibold">{new Date(profile.kyc_verified_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Employment Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold flex items-center gap-3 mb-6">
              <Briefcase className="w-6 h-6 text-teal-600" /> Employment Details
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {isEditing ? (
                <>
                  <select 
                    name="employment_type" 
                    value={formData.employment_type} 
                    onChange={handleInputChange} 
                    className="border rounded-lg px-4 py-3"
                  >
                    <option value="SALARIED">Salaried</option>
                    <option value="SELF_EMPLOYED">Self Employed</option>
                    <option value="BUSINESS">Business</option>
                  </select>
                  <input 
                    name="company_name" 
                    value={formData.company_name} 
                    onChange={handleInputChange} 
                    className="border rounded-lg px-4 py-3" 
                    placeholder="Company/Business Name"
                  />
                  <input 
                    name="monthly_salary" 
                    type="number" 
                    value={formData.monthly_salary} 
                    onChange={handleInputChange} 
                    className="border rounded-lg px-4 py-3" 
                    placeholder="Monthly Salary/Income"
                  />
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm text-gray-500">Employment Type</label>
                    <p className="font-semibold">{profile?.employment_type || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Company Name</label>
                    <p className="font-semibold">{profile?.company_name || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Monthly Salary</label>
                    <p className="font-semibold">₹{parseFloat(profile?.monthly_salary || 0).toLocaleString()}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* KYC Modal */}
          {isUploadingKYC && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">Upload KYC Documents</h3>
                  <button onClick={() => setIsUploadingKYC(false)}><X className="w-6 h-6" /></button>
                </div>

                <div className="space-y-6">
                  {["aadhaar", "pan"].map(doc => (
                    <div key={doc} className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-teal-500"
                      onClick={() => document.getElementById(`${doc}-input`).click()}
                    >
                      <input
                        id={`${doc}-input`}
                        type="file"
                        hidden
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(`${doc}_doc`, e.target.files[0])}
                      />

                      {kycFiles[`${doc}_doc`] ? (
                        <div className="text-green-600">
                          <CheckCircle className="w-12 h-12 mx-auto mb-3" />
                          <p>{kycFiles[`${doc}_doc`].name}</p>
                        </div>
                      ) : (
                        <>
                          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                          <p>Upload {doc.toUpperCase()} Card</p>
                        </>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={handleKYCUpload}
                    disabled={uploading || !kycFiles.aadhaar_doc || !kycFiles.pan_doc}
                    className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 disabled:bg-gray-400"
                  >
                    {uploading ? "Uploading..." : "Submit KYC"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {kycStatus === "verified" && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex gap-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
              <div>
                <p className="font-bold text-green-800">KYC Verified</p>
                <p>You can now access all banking features including loans and transfers.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}