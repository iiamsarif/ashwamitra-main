import React from 'react'
import { useAdminFarmers, useApproveFarmer } from '@/hooks/useApi'
import { Loader2 } from 'lucide-react'

const Farmers = () => {
  const { data: farmers, isLoading } = useAdminFarmers();
  const approveFarmer = useApproveFarmer();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading farmers...</span>
      </div>
    );
  }

  const farmersData = farmers || [];

  return (
    <div>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Farmers Management</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="text-xl font-bold">{farmersData.length}</div>
            <div className="text-xs text-muted-foreground">Total Farmers</div>
          </div>
          <div className="stat-card">
            <div className="text-xl font-bold">
              {farmersData.filter((f: any) => f.isApproved).length}
            </div>
            <div className="text-xs text-muted-foreground">Approved</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-muted">
              <tr>
                {["Name", "Location", "Category", "Rating", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {farmersData.map((f: any) => (
                <tr key={f._id} className="data-table-row">
                  <td className="px-5 py-3 font-medium">{f.userId?.name || "—"}</td>
                  <td className="px-5 py-3">{f.village}, {f.district}, {f.state}</td>
                  <td className="px-5 py-3">{f.category}</td>
                  <td className="px-5 py-3">{f.rating || 0}/5</td>
                  <td className="px-5 py-3">
                    <span className={f.isApproved ? "badge-success" : "badge-warning"}>
                      {f.isApproved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {!f.isApproved ? (
                      <div className="flex gap-2">
                        <button onClick={() => approveFarmer.mutate({ id: f._id, approved: true })} className="px-2 py-1 text-xs bg-green-600 text-white rounded">Approve</button>
                        <button onClick={() => approveFarmer.mutate({ id: f._id, approved: false })} className="px-2 py-1 text-xs bg-red-600 text-white rounded">Reject</button>
                      </div>
                    ) : (
                      <span className="text-xs text-green-600">✓ Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Farmers
