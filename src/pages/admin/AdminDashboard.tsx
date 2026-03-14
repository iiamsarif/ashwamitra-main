import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Users, Wheat, Building2, CreditCard, TrendingUp, ArrowUpRight,
  CheckCircle, XCircle, Clock, Download, Eye, Package, Truck, Filter, Search, Loader2, X, MessageSquare
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import DeliveryManagement from "./component/DeliveryManagement";
import AdminWalletComponent from "../../components/wallet/AdminWalletComponent";
import MapboxStaticViewer from "@/components/map/MapboxStaticViewer";
import { toast } from "sonner";
import {
  useAdminDashboard, useAdminUsers, useAdminFarmers, useAdminBusinesses,
  useAdminOrders, useAdminPayments, useApproveFarmer, useVerifyBusiness,
  useUpdateUserStatus, useExportReport, useAdminContactMessages, useUpdateContactMessageStatus,
  useAdminPricingAdjustments, useUpdateAdminPricingAdjustments
} from "@/hooks/useApi";

const PIE_COLORS = ["hsl(150,57%,22%)", "hsl(38,90%,55%)", "hsl(210,80%,45%)", "hsl(142,70%,35%)"];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [pricingForm, setPricingForm] = useState({ farmer: "0", b2b: "0", customer: "0" });
  const [pricingUpdatedAt, setPricingUpdatedAt] = useState("");

  const { data: dashboard, isLoading: dashLoading } = useAdminDashboard();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers(
    searchTerm ? { search: searchTerm } : undefined
  );
  const { data: farmers, isLoading: farmersLoading } = useAdminFarmers();
  const { data: businesses, isLoading: businessesLoading } = useAdminBusinesses();
  const { data: orders } = useAdminOrders();
  const { data: payments } = useAdminPayments();
  const { data: contactMessages, isLoading: contactMessagesLoading } = useAdminContactMessages();
  const { data: pricingData } = useAdminPricingAdjustments();

  const approveFarmer = useApproveFarmer();
  const verifyBusiness = useVerifyBusiness();
  const updateUserStatus = useUpdateUserStatus();
  const exportReport = useExportReport();
  const updateContactMessageStatus = useUpdateContactMessageStatus();
  const updatePricingAdjustments = useUpdateAdminPricingAdjustments();

  const users = usersData?.users || [];
  const filteredUsers = filterRole === "all" ? users : users.filter((u: any) => u.role === filterRole);

  useEffect(() => {
    if (pricingData) {
      setPricingForm({
        farmer: String(pricingData.farmer ?? 0),
        b2b: String(pricingData.b2b ?? 0),
        customer: String(pricingData.customer ?? 0),
      });
      setPricingUpdatedAt(pricingData.updatedAt || "");
    }
  }, [pricingData]);

  const handleSavePricing = async () => {
    try {
      const next = await updatePricingAdjustments.mutateAsync({
        farmer: Number(pricingForm.farmer) || 0,
        b2b: Number(pricingForm.b2b) || 0,
        customer: Number(pricingForm.customer) || 0,
      });
      setPricingUpdatedAt(next.updatedAt || "");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update pricing difference.");
    }
  };

  if (dashLoading) {
    return (
      <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3">Loading admin dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }

  const stats = dashboard || {};

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "dashboard" && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Admin Control Panel</h1>
              <p className="text-muted-foreground text-xs sm:text-sm">Real-time platform data from database</p>
            </div>
            <button
              onClick={() => exportReport.mutate("users")}
              disabled={exportReport.isPending}
              className="flex items-center gap-2 text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {exportReport.isPending ? "Exporting..." : "Export Report"}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: "Farmers", value: stats.totalFarmers || 0, icon: Wheat, color: "from-green-500 to-emerald-600" },
              { label: "Businesses", value: stats.totalBusinesses || 0, icon: Building2, color: "from-blue-500 to-indigo-600" },
              { label: "Customers", value: stats.totalCustomers || 0, icon: Users, color: "from-purple-500 to-violet-600" },
              { label: "Revenue", value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: "from-orange-500 to-red-500" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`p-4 sm:p-5 rounded-xl text-white shadow-xl bg-gradient-to-br ${s.color}`}>
                  <div className="flex justify-between mb-3">
                    <Icon className="w-5 h-5" />
                    <ArrowUpRight className="w-4 h-4 opacity-70" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold">{s.value}</div>
                  <div className="text-xs opacity-90">{s.label}</div>
                </div>
              );
            })}
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white border rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-500">Total Orders</p>
              <p className="text-xl sm:text-2xl font-bold">{stats.totalOrders || 0}</p>
            </div>
            <div className="bg-white border rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-500">Total Products</p>
              <p className="text-xl sm:text-2xl font-bold">{stats.totalProducts || 0}</p>
            </div>
            <div className="bg-white border rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-500">Pending Approvals</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pendingApprovals || 0}</p>
            </div>
            <div className="bg-white border rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-500">Pending Farmers</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-600">{stats.pendingFarmers || 0}</p>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h3 className="font-semibold">Pricing Difference Control</h3>
                <p className="text-xs text-gray-500">Admin added amount is automatically added to listing prices per role.</p>
              </div>
              {pricingUpdatedAt && (
                <p className="text-xs text-gray-500">
                  Last updated: {new Date(pricingUpdatedAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="text-xs text-gray-600 font-medium">Farmer Listing Increment (₹)</label>
                <input
                  type="number"
                  value={pricingForm.farmer}
                  onChange={(e) => setPricingForm((prev) => ({ ...prev, farmer: e.target.value }))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  step="0.5"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Business Listing Increment (₹)</label>
                <input
                  type="number"
                  value={pricingForm.b2b}
                  onChange={(e) => setPricingForm((prev) => ({ ...prev, b2b: e.target.value }))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  step="0.5"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Customer Listing Increment (₹)</label>
                <input
                  type="number"
                  value={pricingForm.customer}
                  onChange={(e) => setPricingForm((prev) => ({ ...prev, customer: e.target.value }))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  step="0.5"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-gray-600">
                Example preview (base price ₹100): Farmer ₹{(100 + (Number(pricingForm.farmer) || 0)).toFixed(2)} ·
                Business ₹{(100 + (Number(pricingForm.b2b) || 0)).toFixed(2)} ·
                Customer ₹{(100 + (Number(pricingForm.customer) || 0)).toFixed(2)}
              </p>
              <button
                onClick={handleSavePricing}
                disabled={updatePricingAdjustments.isPending}
                className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
              >
                {updatePricingAdjustments.isPending ? "Saving..." : "Save Pricing Difference"}
              </button>
            </div>
          </div>

          {/* Monthly Trend Chart */}
          {stats.monthlyTrend && stats.monthlyTrend.length > 0 && (
            <div className="bg-white border rounded-xl p-4 sm:p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Monthly Transaction Volume</h3>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyTrend.map((m: any) => ({ month: `M${m._id}`, volume: m.volume, count: m.count }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                    <Bar dataKey="volume" fill="#16a34a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Farmer & Business Locations Map */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Farmer & Business Locations</h3>
            <MapboxStaticViewer
              height="350px"
              locations={[
                ...((farmers || []) as any[])
                  .filter((f: any) => f.latitude && f.longitude)
                  .map((f: any) => ({ lat: f.latitude, lng: f.longitude, label: `Farmer: ${f.userId?.name || "Unknown"}`, color: "#16a34a" })),
                ...((businesses || []) as any[])
                  .filter((b: any) => b.latitude && b.longitude)
                  .map((b: any) => ({ lat: b.latitude, lng: b.longitude, label: `Business: ${b.businessName || "Unknown"}`, color: "#2563eb" })),
              ]}
            />
            <p className="text-xs text-muted-foreground mt-2">Green pins = Farmers · Blue pins = Businesses</p>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">User Management</h1>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border rounded-lg text-sm"
                />
              </div>
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
                <option value="all">All Roles</option>
                <option value="farmer">Farmer</option>
                <option value="b2b">B2B</option>
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {usersLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : (
            <div className="bg-white border rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["Name", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u: any) => (
                    <tr key={u._id} className="border-t hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium">{u.name}</td>
                      <td className="px-5 py-3 text-gray-500">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          u.role === "farmer" ? "bg-green-100 text-green-700" :
                          u.role === "b2b" ? "bg-blue-100 text-blue-700" :
                          u.role === "admin" ? "bg-red-100 text-red-700" :
                          "bg-purple-100 text-purple-700"
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          u.status === "active" ? "bg-green-100 text-green-700" :
                          u.status === "suspended" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>{u.status}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          {u.status !== "active" && (
                            <button onClick={() => updateUserStatus.mutate({ id: u._id, status: "active" })} className="px-2 py-1 text-xs bg-green-600 text-white rounded">Activate</button>
                          )}
                          {u.status === "active" && u.role !== "admin" && (
                            <button onClick={() => updateUserStatus.mutate({ id: u._id, status: "suspended" })} className="px-2 py-1 text-xs bg-red-600 text-white rounded">Suspend</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "farmers" && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Farmers Management</h1>
          {farmersLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : (
            <div className="bg-white border rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-green-50">
                  <tr>
                    {["Name", "Location", "Category", "Rating", "Approved", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(farmers || []).map((f: any) => (
                    <tr key={f._id} className="border-t hover:bg-green-50">
                      <td className="px-5 py-3 font-medium">{f.userId?.name || "—"}</td>
                      <td className="px-5 py-3 text-gray-500">{f.village}, {f.district}, {f.state}</td>
                      <td className="px-5 py-3">{f.category}</td>
                      <td className="px-5 py-3">{f.rating || 0}/5</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${f.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {f.isApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {!f.isApproved ? (
                          <div className="flex gap-2 items-center">
                            <button onClick={() => approveFarmer.mutate({ id: f._id, approved: true })} className="px-2 py-1 text-xs bg-green-600 text-white rounded">Approve</button>
                            <button onClick={() => approveFarmer.mutate({ id: f._id, approved: false })} className="px-2 py-1 text-xs bg-red-600 text-white rounded">Reject</button>
                            <button
                              onClick={() => navigate(`/admin/farmer-details/${f._id}`)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 items-center">
                            <span className="text-xs text-green-600">✓ Active</span>
                            <button
                              onClick={() => navigate(`/admin/farmer-details/${f._id}`)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "businesses" && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Business Management</h1>
          {businessesLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : (
            <div className="bg-white border rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    {["Business Name", "Contact", "GSTIN", "Verified", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(businesses || []).map((b: any) => (
                    <tr key={b._id} className="border-t hover:bg-blue-50">
                      <td className="px-5 py-3 font-medium">{b.businessName || "—"}</td>
                      <td className="px-5 py-3 text-gray-500">{b.userId?.name} · {b.userId?.email}</td>
                      <td className="px-5 py-3">{b.gstin || "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${b.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {b.isVerified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {!b.isVerified ? (
                          <div className="flex gap-2 items-center">
                            <button onClick={() => verifyBusiness.mutate({ id: b._id, verified: true })} className="px-2 py-1 text-xs bg-green-600 text-white rounded">Verify</button>
                            <button onClick={() => verifyBusiness.mutate({ id: b._id, verified: false })} className="px-2 py-1 text-xs bg-red-600 text-white rounded">Reject</button>
                            <button
                              onClick={() => navigate(`/admin/business-details/${b._id}`)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 items-center">
                            <span className="text-xs text-green-600">✓ Verified</span>
                            <button
                              onClick={() => navigate(`/admin/business-details/${b._id}`)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "orders" && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">All Orders</h1>
          <div className="bg-white border rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Order ID", "Buyer", "Items", "Amount", "Status", "Date"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(orders || []).map((o: any) => (
                  <tr key={o._id} className="border-t hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs">#{o._id?.slice(-8)}</td>
                    <td className="px-5 py-3">{o.buyerId?.name || "—"}</td>
                    <td className="px-5 py-3">{o.items?.map((i: any) => i.productName).join(", ")}</td>
                    <td className="px-5 py-3 font-semibold">₹{o.totalAmount?.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        o.status === "delivered" ? "bg-green-100 text-green-700" :
                        o.status === "cancelled" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>{o.status}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {(!orders || orders.length === 0) && (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "payments" && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">All Payments</h1>
          <div className="bg-white border rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["ID", "From", "To", "Amount", "Method", "Status", "Date"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(payments || []).map((p: any) => (
                  <tr key={p._id} className="border-t hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs">#{p._id?.slice(-6)}</td>
                    <td className="px-5 py-3">{p.payerId?.name || "—"}</td>
                    <td className="px-5 py-3">{p.receiverId?.name || "—"}</td>
                    <td className="px-5 py-3 font-semibold">₹{p.amount?.toLocaleString()}</td>
                    <td className="px-5 py-3">{p.method?.toUpperCase()}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        p.status === "completed" ? "bg-green-100 text-green-700" :
                        p.status === "failed" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>{p.status}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {(!payments || payments.length === 0) && (
                  <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">No payments yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "contact_messages" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Contact Messages</h1>
          </div>

          {contactMessagesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="bg-white border rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["Name", "Email", "Phone", "Message", "Status", "Date", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(contactMessages || []).map((m: any) => (
                    <tr key={m._id} className="border-t hover:bg-gray-50 align-top">
                      <td className="px-5 py-3 font-medium">{m.name}</td>
                      <td className="px-5 py-3">{m.email}</td>
                      <td className="px-5 py-3">{m.phone}</td>
                      <td className="px-5 py-3 max-w-md">
                        <p className="line-clamp-3 text-gray-700">{m.message}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          m.status === "responded"
                            ? "bg-green-100 text-green-700"
                            : m.status === "read"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{new Date(m.createdAt).toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          {m.status !== "read" && (
                            <button
                              onClick={() => updateContactMessageStatus.mutate({ id: m._id, status: "read" })}
                              className="px-2 py-1 text-xs rounded bg-blue-600 text-white"
                            >
                              Mark Read
                            </button>
                          )}
                          {m.status !== "responded" && (
                            <button
                              onClick={() => updateContactMessageStatus.mutate({ id: m._id, status: "responded" })}
                              className="px-2 py-1 text-xs rounded bg-green-600 text-white"
                            >
                              Mark Responded
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!contactMessages || contactMessages.length === 0) && (
                    <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">No contact messages yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "delivery" && <DeliveryManagement />}
      {activeTab === "wallet" && <AdminWalletComponent />}
    </DashboardLayout>
  );
};

export default AdminDashboard;
