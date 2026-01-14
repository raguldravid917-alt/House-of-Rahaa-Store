import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/auth"; 
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState("stats");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]); 
  
  const [newCategoryName, setNewCategoryName] = useState("");

  // ✅ New States for Editing & Preview Feature
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); 

  const [form, setForm] = useState({ 
    name: "", 
    description: "", 
    price: "", 
    stock: "", 
    category: "" 
  });
  
  const [preview, setPreview] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const CLOUD_NAME = "ddwwters5"; 
  const PRESET = "rahaa_preset"; 

  const handleLogout = () => {
    setAuth({ ...auth, user: null, token: "" });
    localStorage.removeItem("auth");
    toast.success("Vault Session Terminated");
    navigate("/login"); 
  };

  const config = { headers: { Authorization: auth?.token } };

  const transformImage = (url) => {
    if (!url) return "";
    if (url.includes("cloudinary.com") && url.includes("/upload/")) {
      return url.replace("/upload/", "/upload/f_auto,q_auto,w_800/");
    }
    return url;
  };

  // --- 🏷️ FETCH DATA ---
  const getAllCategories = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/v1/category/get-category");
      if (data?.success) setCategories(data.category);
    } catch (err) { console.log(err); }
  };

  const getAllProducts = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/v1/product/get-product");
      if (data?.success) setProducts(data.products);
    } catch (err) { console.log(err); }
  };

  const getAllOrders = async () => {
    if(!auth?.token) return;
    try {
      const { data } = await axios.get("http://localhost:5000/api/v1/auth/all-orders", config);
      setOrders(data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    getAllCategories();
    getAllProducts();
    if (view === "orders" || view === "stats") getAllOrders();
  }, [view, auth?.token]);

  // ✅ Trigger Full Edit Mode
  const handleEditInitiate = (p) => {
    setIsEditing(true);
    setEditId(p._id);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.quantity || p.stock || 0,
      category: p.category?._id || p.category
    });
    setPreview(p.image);
    setUploadedImageUrl(p.image);
    setView("add"); 
    window.scrollTo(0, 0);
  };

  const handleUpdateStock = async (pid, currentStock) => {
    const newStock = window.prompt("Enter new quantity for this artifact:", currentStock);
    if (newStock === null || newStock === "" || isNaN(newStock)) return;
    const updatedValue = parseInt(newStock);
    try {
      const originalProducts = [...products];
      setProducts(products.map((p) => p._id === pid ? { ...p, stock: updatedValue, quantity: updatedValue } : p));
      const { data } = await axios.put(`http://localhost:5000/api/v1/product/update-product/${pid}`, {
        stock: updatedValue,
        quantity: updatedValue 
      }, config);
      if (data?.success) {
        toast.success("Vault Quantity Synchronized");
        getAllProducts();
      } else {
        setProducts(originalProducts);
        toast.error("Update Failed");
      }
    } catch (err) {
      getAllProducts();
      toast.error("Protocol Error");
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:5000/api/v1/category/create-category", { name: newCategoryName }, config);
      if (data?.success) {
        toast.success(`Category Indexed: ${newCategoryName}`);
        setNewCategoryName("");
        getAllCategories();
      }
    } catch (error) { toast.error("Index Failed"); }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Remove this category from the archive?")) return;
    try {
      const { data } = await axios.delete(`http://localhost:5000/api/v1/category/delete-category/${id}`, config);
      if (data.success) { toast.success("Category Removed"); getAllCategories(); }
    } catch (error) { toast.error("Operation Denied"); }
  };

  const handleDelete = async (pid) => {
    if (!window.confirm("Permanently erase this artifact?")) return;
    try {
      const { data } = await axios.delete(`http://localhost:5000/api/v1/product/delete-product/${pid}`, config);
      if (data.success) { toast.success("Artifact Erased"); getAllProducts(); }
    } catch (err) { toast.error("Erasure Failed"); }
  };

  const handleStatus = async (orderId, value) => {
    try {
      await axios.put(`http://localhost:5000/api/v1/auth/order-status/${orderId}`, { status: value }, config);
      toast.success("Protocol Updated");
      getAllOrders();
    } catch (err) { toast.error("Log Update Failed"); }
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    toast.loading("Uploading visual asset...", { id: "img" });
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", PRESET);
      const cloudRes = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formData, {
        transformRequest: [(data, headers) => {
          delete headers.Authorization;
          return data;
        }]
      });
      setUploadedImageUrl(cloudRes.data.secure_url); 
      setPreview(cloudRes.data.secure_url);          
      toast.success("Visual Ready", { id: "img" });
    } catch (error) { toast.error("Asset Sync Failed", { id: "img" }); }
    finally { setUploadingImage(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uploadedImageUrl) return toast.error("Asset Visual Required");
    setLoading(true);
    try {
      const url = isEditing 
        ? `http://localhost:5000/api/v1/product/update-product/${editId}` 
        : "http://localhost:5000/api/v1/product/add-product";
      
      const res = await axios[isEditing ? "put" : "post"](url, { ...form, image: uploadedImageUrl }, config);

      if (res.data?.success) {
        toast.success(isEditing ? "Artifact Re-Indexed! 🏛️" : "Artifact Published! 🏛️");
        setForm({ name: "", description: "", price: "", stock: "", category: "" });
        setPreview(null); setUploadedImageUrl(null);
        setIsEditing(false); setEditId(null);
        getAllProducts();
        setView("products");
      }
    } catch (err) { toast.error("Vault Submission Failed"); }
    finally { setLoading(false); }
  };

  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.payment?.amount || 0), 0) / 100;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-sans selection:bg-[#d4a373]">
      
      {/* 🖼️ IMAGE PREVIEW MODAL */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button className="absolute -top-12 right-0 text-white text-3xl font-light hover:text-[#d4a373]" onClick={() => setSelectedImage(null)}>✕</button>
            <img src={transformImage(selectedImage)} className="max-h-[85vh] rounded-[30px] border border-white/10 shadow-2xl animate-in zoom-in duration-500" alt="Preview" />
          </div>
        </div>
      )}

      {/* ✅ SIDEBAR - Fixed Terminate Visibility (Added inset-y-0) */}
      <aside className="w-20 lg:w-72 bg-[#0a0a0a] border-r border-white/5 flex flex-col fixed inset-y-0 left-0 z-50 shadow-2xl">
        <div className="p-8 mb-10 cursor-pointer" onClick={() => { setIsEditing(false); setView("stats"); }}>
            <h1 className="hidden lg:block font-serif text-2xl text-[#d4a373] tracking-widest">RAHAA <span className="block text-[8px] tracking-[0.6em] text-white opacity-40 uppercase mt-1">Admin Portal</span></h1>
            <div className="lg:hidden w-10 h-10 bg-[#d4a373] rounded-full flex items-center justify-center text-black font-black">R</div>
        </div>

        <nav className="flex-1 space-y-2 px-4 overflow-y-auto no-scrollbar">
          {[
            { id: "stats", label: "Overview", icon: "📊" }, 
            { id: "category", label: "Taxonomy", icon: "🏷️" },
            { id: "add", label: isEditing ? "Editing Asset" : "Publish", icon: "✨" }, 
            { id: "products", label: "Inventory", icon: "📦" }, 
            { id: "orders", label: "Live Ledger", icon: "🚚" }
          ].map((item) => (
            <button key={item.id} onClick={() => { if(item.id !== "add") setIsEditing(false); setView(item.id); }} className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-500 ${view === item.id ? "bg-[#d4a373] text-black font-bold shadow-lg" : "text-gray-500 hover:text-white hover:bg-white/5"}`}>
              <span className="text-xl">{item.icon}</span>
              <span className="hidden lg:block text-[10px] uppercase tracking-[0.3em]">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* ✅ Terminate Section - Explicit padding and background to ensure visibility */}
        <div className="p-6 mt-auto bg-[#0a0a0a] border-t border-white/5">
            <button onClick={handleLogout} className="w-full bg-red-500/10 text-red-500 border border-red-500/20 py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all">Terminate</button>
        </div>
      </aside>

      <main className="flex-1 ml-20 lg:ml-72 p-8 lg:p-16">
        <header className="flex justify-between items-center mb-16 pb-8 border-b border-white/5">
            <div className="text-[10px] uppercase tracking-[0.4em] text-gray-600">Protocol / <span className="text-[#d4a373] font-black">{view}</span></div>
            <div className="flex items-center gap-4">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] uppercase tracking-widest text-gray-400">Vault Secure</span>
            </div>
        </header>

        {/* --- STATS VIEW --- */}
        {view === "stats" && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <h2 className="text-4xl font-serif italic mb-12">Performance Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                 <div className="bg-[#0f0f0f] p-10 rounded-[50px] border border-white/5 shadow-2xl group hover:border-[#d4a373]/30 transition-all">
                    <p className="text-gray-500 text-[10px] uppercase tracking-[0.4em] mb-4">Gross Revenue</p>
                    <h3 className="text-4xl text-[#d4a373] font-light">₹{totalRevenue.toLocaleString()}</h3>
                 </div>
                 <div className="bg-[#0f0f0f] p-10 rounded-[50px] border border-white/5 shadow-2xl">
                    <p className="text-gray-500 text-[10px] uppercase tracking-[0.4em] mb-4">Total Acquisitions</p>
                    <h3 className="text-4xl text-white font-light">{orders.length} <span className="text-xs text-gray-600 uppercase tracking-widest ml-2">Units</span></h3>
                 </div>
                 <div className="bg-[#d4a373] p-10 rounded-[50px] text-black shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-black/60 text-[10px] uppercase tracking-[0.4em] mb-4">System Pulse</p>
                        <h3 className="text-4xl font-black italic">ENCRYPTED</h3>
                    </div>
                    <span className="absolute -bottom-10 -right-10 text-9xl opacity-10">🛡️</span>
                 </div>
              </div>
            </div>
        )}

        {/* --- CATEGORY VIEW --- */}
        {view === "category" && (
            <div className="animate-in fade-in max-w-2xl duration-700">
                <h2 className="text-3xl font-serif italic text-[#d4a373] mb-10">Asset Categorization</h2>
                <form onSubmit={handleCreateCategory} className="flex gap-4 mb-16 bg-white/5 p-2 rounded-full border border-white/10">
                    <input type="text" placeholder="Artifact Category Name" className="flex-1 bg-transparent px-8 py-4 outline-none text-[11px] uppercase tracking-widest transition-all" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} required />
                    <button className="bg-[#d4a373] text-black px-12 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all">Index</button>
                </form>
                <div className="grid grid-cols-1 gap-4">
                    {categories?.map((c) => (
                        <div key={c._id} className="flex justify-between items-center bg-[#0f0f0f] px-10 py-6 rounded-[30px] border border-white/5 group hover:border-red-500/20 transition-all">
                            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-300 font-bold">{c.name}</span>
                            <button onClick={() => handleDeleteCategory(c._id)} className="text-red-500/40 hover:text-red-500 text-[9px] font-black tracking-[0.3em] transition-all">ERASE</button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- ADD/EDIT VIEW --- */}
        {view === "add" && (
          <div className="flex flex-col lg:flex-row gap-20 animate-in fade-in duration-1000">
              <div className="lg:w-1/3 aspect-[3/4] bg-white/[0.02] rounded-[60px] border-2 border-dashed border-[#d4a373]/20 flex items-center justify-center relative overflow-hidden cursor-pointer group shadow-inner" onClick={() => !uploadingImage && document.getElementById('f').click()}>
                {preview ? (
                   <img src={transformImage(preview)} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Preview" />
                ) : (
                   <div className="text-center group-hover:scale-110 transition-transform">
                     <p className="text-[#d4a373] text-5xl mb-6 opacity-30">📸</p>
                     <p className="text-[#d4a373] text-[9px] uppercase tracking-[0.5em] font-black">Upload Artifact Visual</p>
                   </div>
                )}
                {uploadingImage && <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-[10px] tracking-[0.5em] animate-pulse font-black text-[#d4a373]">ENCRYPTING ASSET...</div>}
                <input id="f" type="file" hidden onChange={handleImage} accept="image/*" />
              </div>

              <form onSubmit={handleSubmit} className="lg:w-2/3 space-y-10">
                 <h2 className="text-4xl font-serif italic text-white">{isEditing ? "Modify Artifact" : "Digital Registry"}</h2>
                 <div className="space-y-8">
                    <input type="text" placeholder="Artifact Name" className="w-full bg-transparent border-b border-white/10 py-5 outline-none text-xs tracking-[0.3em] uppercase focus:border-[#d4a373] transition-colors" onChange={e => setForm({...form, name: e.target.value})} value={form.name} required />
                    <textarea placeholder="The provenance and description..." className="w-full bg-transparent border-b border-white/10 py-5 outline-none h-32 text-sm leading-relaxed focus:border-[#d4a373] transition-colors resize-none" onChange={e => setForm({...form, description: e.target.value})} value={form.description} required />
                    <div className="grid grid-cols-2 gap-12">
                      <div>
                        <label className="text-[8px] text-gray-600 uppercase tracking-[0.5em] mb-4 block">Valuation (INR)</label>
                        <input type="number" className="w-full bg-transparent border-b border-white/10 py-3 outline-none focus:border-[#d4a373] font-mono text-xl" onChange={e => setForm({...form, price: e.target.value})} value={form.price} required />
                      </div>
                      <div>
                        <label className="text-[8px] text-gray-600 uppercase tracking-[0.5em] mb-4 block">Vault Quantity</label>
                        <input type="number" className="w-full bg-transparent border-b border-white/10 py-3 outline-none focus:border-[#d4a373] font-mono text-xl" onChange={e => setForm({...form, stock: e.target.value})} value={form.stock} required />
                      </div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[8px] text-gray-600 uppercase tracking-[0.5em] font-black">Archive Assignment</label>
                        <select className="w-full bg-[#0a0a0a] border border-white/10 py-6 px-10 rounded-[30px] outline-none focus:border-[#d4a373] text-[10px] tracking-[0.3em] appearance-none uppercase transition-all" onChange={e => setForm({...form, category: e.target.value})} value={form.category} required>
                            <option value="">-- Assign to Collection --</option>
                            {categories?.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
                        </select>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button disabled={loading || uploadingImage} className="bg-[#d4a373] text-black flex-1 py-6 rounded-full font-black uppercase text-[10px] tracking-[0.5em] hover:bg-white transition-all disabled:opacity-20 shadow-2xl" type="submit">
                      {loading ? "Syncing..." : isEditing ? "Update Artifact" : "Publish to Vault"}
                    </button>
                    {isEditing && (
                      <button type="button" onClick={() => {setIsEditing(false); setView("products");}} className="bg-white/10 text-white px-10 rounded-full text-[10px] uppercase tracking-widest">Cancel</button>
                    )}
                 </div>
              </form>
          </div>
        )}

        {/* --- INVENTORY VIEW --- */}
        {view === "products" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 animate-in fade-in duration-1000">
            {products.map(p => (
              <div key={p._id} className="bg-[#0f0f0f] rounded-[50px] p-6 group border border-white/5 relative overflow-hidden hover:border-[#d4a373]/40 transition-all duration-700">
                 <div className="h-64 rounded-[40px] overflow-hidden mb-6 border border-white/5 shadow-2xl cursor-zoom-in" onClick={() => setSelectedImage(p.image)}>
                    <img src={transformImage(p.image)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 duration-1000 transition-all" alt={p.name} title="Click to preview" />
                 </div>
                 <h3 className="font-serif italic text-lg text-white truncate px-2">{p.name}</h3>
                 <div className="flex justify-between items-center mt-4 px-2">
                    <p className="text-[#d4a373] text-[11px] font-mono font-bold">₹{p.price?.toLocaleString()}</p>
                    <div onClick={() => handleUpdateStock(p._id, p.stock || p.quantity)} className="cursor-pointer group/stock flex items-center gap-2">
                      <p className="text-gray-600 text-[8px] uppercase tracking-widest group-hover/stock:text-[#d4a373] transition-colors">Stock: {p.quantity !== undefined ? p.quantity : (p.stock || 0)}</p>
                      <span className="text-[8px] opacity-0 group-hover/stock:opacity-100 transition-opacity">✎</span>
                    </div>
                 </div>
                 <button onClick={() => handleEditInitiate(p)} className="absolute top-10 right-24 bg-white text-black w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center font-bold hover:bg-[#d4a373]">✎</button>
                 <button onClick={() => handleDelete(p._id)} className="absolute top-10 right-10 bg-red-600 text-white w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center font-bold hover:bg-white hover:text-red-600">✕</button>
              </div>
            ))}
          </div>
        )}

        {/* --- ORDERS VIEW --- */}
        {view === "orders" && (
           <div className="bg-[#0f0f0f] rounded-[60px] border border-white/5 p-12 overflow-hidden animate-in fade-in shadow-2xl">
             <h2 className="text-3xl font-serif italic mb-12 text-[#d4a373]">Acquisition Ledger</h2>
             <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px] uppercase tracking-[0.3em]">
                  <thead><tr className="text-gray-600 border-b border-white/5 pb-10"><th className="pb-8">Master Token</th><th className="pb-8">Protocol</th><th className="pb-8">Collector</th><th className="pb-8 text-right">Action</th></tr></thead>
                  <tbody className="text-white">
                    {orders.map((o, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                        <td className="py-10 font-mono text-gray-500">#{o._id.slice(-8)}</td>
                        <td className="py-10"><span className={`px-5 py-1.5 rounded-full text-[8px] font-black ${o.status === 'Delivered' ? 'bg-green-500/10 text-green-500' : 'bg-[#d4a373]/10 text-[#d4a373]'}`}>{o.status}</span></td>
                        <td className="py-10 text-gray-400 font-serif italic capitalize">{o.buyer?.name || "Private Guest"}</td>
                        <td className="py-10 text-right"><select onChange={(e) => handleStatus(o._id, e.target.value)} defaultValue={o.status} className="bg-black border border-white/10 rounded-2xl px-6 py-3 text-[9px] outline-none focus:border-[#d4a373] cursor-pointer hover:bg-white/5 transition-all">{["Not Process", "Processing", "Shipped", "Delivered", "Cancel"].map(s => <option key={s} value={s}>{s}</option>)}</select></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;