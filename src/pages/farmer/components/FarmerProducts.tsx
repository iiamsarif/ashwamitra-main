import { useState, type ChangeEvent } from "react";
import { X, Plus, Loader2, Image } from "lucide-react";
import { useMyProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useApi";
import { toast } from "sonner";

type ProductStatus = "Available" | "Low Stock" | "Out of Stock";
type Quality = "Standard" | "Premium" | "Organic";

const categories = ["Vegetables", "Fruits", "Grains", "Dairy", "Other"];
const units = ["Gram", "KG", "Litre", "Quintal"];
const qualities: Quality[] = ["Standard", "Premium", "Organic"];

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    Available: "bg-gradient-to-r from-green-500 to-emerald-600 text-white",
    "Low Stock": "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
    "Out of Stock": "bg-gradient-to-r from-red-500 to-rose-600 text-white",
  };
  return (
    <span className={`px-3 py-1 text-xs rounded-full font-semibold ${styles[status] || styles["Available"]}`}>
      {status}
    </span>
  );
}

function qualityBadge(quality: string) {
  const styles: Record<string, string> = {
    Standard: "bg-gray-100 text-gray-700 border border-gray-300",
    Premium: "bg-purple-100 text-purple-700 border border-purple-300",
    Organic: "bg-green-100 text-green-700 border border-green-300",
  };
  return (
    <span className={`px-2 py-1 text-xs rounded-md font-medium ${styles[quality] || styles["Standard"]}`}>
      {quality}
    </span>
  );
}

export default function FarmerProducts() {
  const { data: products, isLoading } = useMyProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "", category: "", quantity: "", unit: "KG", price: "", 
    status: "Available" as ProductStatus, description: "",
    quality: "Standard" as Quality, imageUrl: "", isOrganic: false,
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be under 5MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImageFile(file);
    setForm((prev) => ({ ...prev, imageUrl: objectUrl }));
    setImageFileName(file.name);
    toast.success("Image selected.");
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const category = form.category === "Other" ? customCategory : form.category;
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("category", category);
    formData.append("quantity", String(Number(form.quantity)));
    formData.append("unit", form.unit);
    formData.append("price", String(parseFloat(form.price.replace(/[₹/kg]/g, ""))));
    formData.append("status", form.status.toLowerCase());
    formData.append("description", form.description);
    formData.append("quality", form.quality);
    formData.append("isOrganic", String(form.isOrganic));
    if (imageFile) {
      formData.append("images", imageFile);
    } else if (form.imageUrl) {
      formData.append("imageUrl", form.imageUrl);
    }
    if (editingId) {
      await updateProduct.mutateAsync({ id: editingId, data: formData });
    } else {
      await createProduct.mutateAsync(formData);
    }
    setOpen(false);
    setEditingId(null);
    setImageFile(null);
    setImageFileName("");
    setForm({ name: "", category: "", quantity: "", unit: "KG", price: "", status: "Available", description: "", quality: "Standard", imageUrl: "", isOrganic: false });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this product?")) await deleteProduct.mutateAsync(id);
  };

  const handleEdit = (product: any) => {
    setForm({
      name: product.name, category: product.category,
      quantity: product.availableQuantity || product.quantity,
      unit: product.unit || "KG",
      price: `₹${product.pricePerUnit || product.price}/${product.unit || "kg"}`,
      status: product.isAvailable !== false ? "Available" : "Out of Stock",
      description: product.description || "", quality: product.quality || "Standard",
      imageUrl: product.imageUrl || "", isOrganic: product.isOrganic || false,
    });
    setImageFileName(product.imageUrl ? "current-product-image" : "");
    setImageFile(null);
    setEditingId(product._id);
    setOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
        <span className="ml-2">Loading products...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-gradient-to-r from-green-600 to-emerald-500 p-4 sm:p-6 rounded-2xl text-white shadow">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Product Management</h1>
          <p className="text-sm">Manage your agricultural products and stock</p>
        </div>
        <button
          onClick={() => {
            setOpen(true);
            setEditingId(null);
            setImageFile(null);
            setImageFileName("");
            setForm({ name: "", category: "", quantity: "", unit: "KG", price: "", status: "Available", description: "", quality: "Standard", imageUrl: "", isOrganic: false });
          }}
          className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 transition"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Cards for mobile, Table for desktop */}
      <div className="hidden md:block bg-white border rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
              <tr>
                {["Name", "Category", "Stock", "Price", "Quality", "Organic", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-4 text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(products || []).map((p: any) => (
                <tr key={p._id} className="border-t hover:bg-green-50 transition">
                  <td className="px-4 py-4 font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-8 h-8 object-cover rounded" />}
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">{p.category}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{p.availableQuantity || p.quantity} {p.unit}</td>
                  <td className="px-4 py-4 font-semibold text-green-700 whitespace-nowrap">₹{p.pricePerUnit || p.price}/{p.unit}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{qualityBadge(p.quality || "Standard")}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {p.isOrganic ? (
                      <span className="px-2 py-1 text-xs rounded-md font-medium bg-green-100 text-green-700 border border-green-300">Organic</span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-md font-medium bg-gray-100 text-gray-500 border border-gray-200">No</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">{statusBadge(p.isAvailable !== false ? "Available" : "Out of Stock")}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(p)} className="px-3 py-1 text-xs rounded-md text-white bg-blue-600 hover:bg-blue-700">Edit</button>
                      <button onClick={() => handleDelete(p._id)} className="px-3 py-1 text-xs rounded-md text-white bg-red-600 hover:bg-red-700">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!products || products.length === 0) && (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400">No products yet. Add your first product!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-4">
        {(products || []).map((p: any) => (
          <div key={p._id} className="bg-white border border-green-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="w-14 h-14 object-cover rounded-lg" />
              ) : (
                <div className="w-14 h-14 bg-green-50 rounded-lg flex items-center justify-center text-2xl">🌾</div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{p.name}</h3>
                <p className="text-xs text-gray-500">{p.category}</p>
                <div className="flex gap-1 mt-1">
                  {qualityBadge(p.quality || "Standard")}
                  {p.isOrganic && <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-700">Organic</span>}
                </div>
              </div>
              {statusBadge(p.isAvailable !== false ? "Available" : "Out of Stock")}
            </div>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-gray-600">Stock: {p.availableQuantity || p.quantity} {p.unit}</span>
              <span className="font-bold text-green-700">₹{p.pricePerUnit || p.price}/{p.unit}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(p)} className="flex-1 py-2 text-xs rounded-lg text-white bg-blue-600 hover:bg-blue-700">Edit</button>
              <button onClick={() => handleDelete(p._id)} className="flex-1 py-2 text-xs rounded-lg text-white bg-red-600 hover:bg-red-700">Delete</button>
            </div>
          </div>
        ))}
        {(!products || products.length === 0) && (
          <div className="text-center py-8 text-gray-400">No products yet. Add your first product!</div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl p-4 sm:p-6 relative shadow-xl max-h-[90vh] overflow-y-auto">
            <button onClick={() => setOpen(false)} className="absolute right-4 top-4 text-gray-500"><X size={18} /></button>
            <h3 className="text-lg font-semibold mb-4">{editingId ? "Edit Product" : "Add Product"}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="name" value={form.name} placeholder="Product Name *" onChange={handleChange} className="border rounded-lg px-4 py-2" required />
              <select name="category" value={form.category} onChange={handleChange} className="border rounded-lg px-4 py-2" required>
                <option value="">Select Category *</option>
                {categories.map((c) => (<option key={c}>{c}</option>))}
              </select>
              {form.category === "Other" && (
                <input placeholder="Add Category" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} className="border rounded-lg px-4 py-2 md:col-span-2" />
              )}
              <input name="quantity" value={form.quantity} type="number" placeholder="Quantity *" onChange={handleChange} className="border rounded-lg px-4 py-2" required />
              <select name="unit" value={form.unit} onChange={handleChange} className="border rounded-lg px-4 py-2">
                {units.map((u) => (<option key={u}>{u}</option>))}
              </select>
              <input name="price" value={form.price} placeholder="Price (₹) *" onChange={handleChange} className="border rounded-lg px-4 py-2" required />
              <select name="quality" value={form.quality} onChange={handleChange} className="border rounded-lg px-4 py-2">
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
                <option value="Organic">Organic</option>
              </select>
              <div className="md:col-span-2">
                <textarea name="description" value={form.description} placeholder="Description" onChange={handleChange} className="border rounded-lg px-4 py-2 w-full" rows={3} />
              </div>
              <div className="md:col-span-2 flex items-center gap-2">
                <input type="checkbox" name="isOrganic" checked={form.isOrganic} onChange={handleChange} className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                <label className="text-sm font-medium text-gray-700">Organic Product</label>
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Image size={16} className="text-gray-400" />
                  <label className="text-sm font-medium text-gray-700">Product Image</label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Upload from device (recommended)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="border rounded-lg px-3 py-2 w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-green-50 file:px-3 file:py-1.5 file:text-green-700"
                    />
                    {imageFileName && (
                      <p className="text-xs text-gray-500 mt-1 truncate">Selected: {imageFileName}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Or paste image URL</label>
                    <input
                      name="imageUrl"
                      value={form.imageUrl}
                      placeholder="https://example.com/image.jpg"
                      onChange={(e) => {
                        handleChange(e);
                        setImageFile(null);
                        setImageFileName("");
                      }}
                      className="border rounded-lg px-4 py-2 w-full"
                    />
                  </div>
                </div>
                {form.imageUrl && (
                  <div className="mt-2 flex items-center gap-3">
                    <img src={form.imageUrl} alt="Preview" className="w-20 h-20 object-cover rounded border" />
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, imageUrl: "" }));
                        setImageFile(null);
                        setImageFileName("");
                      }}
                      className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={createProduct.isPending || updateProduct.isPending}
                  className="px-6 py-2 rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-500 disabled:opacity-50">
                  {(createProduct.isPending || updateProduct.isPending) ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
