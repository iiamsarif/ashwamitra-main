import React, { useState, useEffect } from "react";
import { productsApi } from "@/lib/api";
import { useMyProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useApi";
import { Loader2, Plus, Pencil, Trash2, CheckCircle, XCircle, ImagePlus, LucideIcon, X } from "lucide-react";
import { toast } from "sonner";

interface Category {
  label: string;
  value: string;
  icon: LucideIcon;
}

const Products = () => {
  const { data: products, isLoading, refetch } = useMyProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    unit: "kg",
    category: "Fruits",
    isAvailable: true,
    images: [],
  });

  const categories: Category[] = [
    { label: "Fruits", value: "Fruits", icon: CheckCircle },
    { label: "Vegetables", value: "Vegetables", icon: CheckCircle },
    { label: "Grains", value: "Grains", icon: CheckCircle },
    { label: "Spices", value: "Spices", icon: CheckCircle },
    { label: "Dairy", value: "Dairy", icon: CheckCircle },
    { label: "Other", value: "Other", icon: CheckCircle },
  ];

  useEffect(() => {
    if (editProduct) {
      setForm({
        name: editProduct.name,
        description: editProduct.description,
        price: editProduct.price,
        unit: editProduct.unit,
        category: editProduct.category,
        isAvailable: editProduct.isAvailable,
        images: editProduct.images,
      });
    } else {
      setForm({
        name: "",
        description: "",
        price: 0,
        unit: "kg",
        category: "Fruits",
        isAvailable: true,
        images: [],
      });
    }
  }, [editProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, isAvailable: e.target.checked });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    try {
      // Store images as base64 data URLs for preview (actual upload happens on product create)
      const imageUrls: string[] = [];
      for (const file of files) {
        const reader = new FileReader();
        const url = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        imageUrls.push(url);
      }
      setForm({ ...form, images: [...form.images, ...imageUrls] });
      toast.success("Images added!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editProduct) {
      await updateProduct.mutateAsync({ id: editProduct._id, data: form });
      toast.success("Product updated!");
    } else {
      await createProduct.mutateAsync(form);
      toast.success("Product created!");
    }
    setShowForm(false);
    setEditProduct(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProduct.mutateAsync(id);
      toast.success("Product deleted!");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3">Loading products...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manage Products</h1>
            <p className="text-blue-100 text-sm">Add, edit, and manage your product listings</p>
          </div>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-blue-50">
            <Plus className="w-4 h-4 mr-2 inline-block" /> Add Product
          </button>
        </div>
      </div>

      {products && products.length === 0 ? (
        <div className="text-center py-12">
          <ImagePlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Yet</h3>
          <p className="text-gray-500">Add your first product to start selling!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-xs text-left font-medium text-gray-500">Name</th>
                <th className="px-5 py-3 text-xs text-left font-medium text-gray-500">Category</th>
                <th className="px-5 py-3 text-xs text-left font-medium text-gray-500">Price</th>
                <th className="px-5 py-3 text-xs text-left font-medium text-gray-500">Unit</th>
                <th className="px-5 py-3 text-xs text-left font-medium text-gray-500">Available</th>
                <th className="px-5 py-3 text-xs text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product: any) => (
                <tr key={product._id} className="border-b hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">{product.name}</td>
                  <td className="px-5 py-3 text-gray-500">{product.category}</td>
                  <td className="px-5 py-3">₹{product.price}</td>
                  <td className="px-5 py-3">{product.unit}</td>
                  <td className="px-5 py-3">
                    {product.isAvailable ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditProduct(product)} className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md">
                        <Pencil className="w-4 h-4 inline-block mr-1" /> Edit
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="px-3 py-1 text-sm bg-red-500 text-white rounded-md">
                        <Trash2 className="w-4 h-4 inline-block mr-1" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Form Modal */}
      {showForm || editProduct ? (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setShowForm(false); setEditProduct(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{editProduct ? "Edit Product" : "Add New Product"}</h3>
                <button onClick={() => { setShowForm(false); setEditProduct(null); }} type="button" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select name="category" value={form.category} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <input type="number" name="price" value={form.price} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                  <select name="unit" value={form.unit} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="piece">piece</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="inline-flex items-center">
                  <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleCheckboxChange} className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                  <span className="ml-2 text-gray-700">Available</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                <div className="flex items-center space-x-4">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300">
                      <ImagePlus className="w-6 h-6" />
                    </div>
                    <input type="file" id="image-upload" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <div className="flex space-x-2 overflow-x-auto">
                    {form.images.map((img: string, index: number) => (
                      <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden">
                        <img src={img} alt={`Uploaded ${index + 1}`} className="object-cover w-full h-full" />
                        <button type="button" className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50">
                  {createProduct.isPending || updateProduct.isPending ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Products;
