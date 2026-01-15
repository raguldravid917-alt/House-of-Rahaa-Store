import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";

const CreateCategory = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [auth] = useAuth();
  const navigate = useNavigate();

  // Modal States
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. GET ALL CATEGORIES
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get("https://house-of-rahaa-store.onrender.com/api/v1/category/get-category");
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      console.log(error);
      toast.error("Registry Sync Failed");
    }
  };

  useEffect(() => {
    getAllCategory();
  }, []);

  // 2. CREATE CATEGORY
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return toast.error("Taxonomy name required");
    
    try {
      toast.loading("Indexing New Category...", { id: "create" });
      const { data } = await axios.post(
        "https://house-of-rahaa-store.onrender.com/api/v1/category/create-category",
        { name },
        { headers: { Authorization: auth?.token } }
      );
      if (data?.success) {
        toast.success(`${name} added to archive`, { id: "create" });
        setName("");
        getAllCategory();
      } else {
        toast.error(data.message, { id: "create" });
      }
    } catch (error) {
      toast.error("Creation protocol failed", { id: "create" });
    }
  };

  // 3. UPDATE CATEGORY
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        `https://house-of-rahaa-store.onrender.com/api/v1/category/update-category/${selected._id}`,
        { name: updatedName },
        { headers: { Authorization: auth?.token } }
      );
      if (data.success) {
        toast.success("Protocol Updated");
        setSelected(null);
        setUpdatedName("");
        setVisible(false);
        getAllCategory();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Update override failed");
    }
  };

  // 4. DELETE CATEGORY
  const handleDelete = async (id) => {
    if (!window.confirm("Permanently erase this taxonomy from the vault?")) return;
    try {
      const { data } = await axios.delete(
        `https://house-of-rahaa-store.onrender.com/api/v1/category/delete-category/${id}`,
        { headers: { Authorization: auth?.token } }
      );
      if (data.success) {
        toast.success(`Entry Erased`);
        getAllCategory();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Erasure failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#d4a373] pt-32 px-6 lg:px-20 pb-20 relative overflow-hidden">
      
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1a0104] rounded-full blur-[150px] opacity-20 pointer-events-none"></div>

      {/* HEADER SECTION */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-end mb-16 border-b border-white/5 pb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div>
            <span className="text-[#d4a373] text-[9px] uppercase tracking-[0.8em] font-black opacity-60">Admin Protocol</span>
            <h1 className="text-5xl lg:text-7xl font-serif italic text-white mt-4 tracking-tighter">Manage Taxonomy</h1>
            <p className="text-gray-600 text-[10px] tracking-[0.5em] uppercase mt-4">Defining the Archives of Rahaa</p>
        </div>
        <button 
          onClick={() => navigate("/dashboard/admin")} 
          className="group text-[9px] uppercase tracking-[0.4em] text-gray-500 hover:text-[#d4a373] transition-all flex items-center gap-3"
        >
          <span className="transition-transform group-hover:-translate-x-2">←</span> Terminal Dashboard
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* 1. INPUT MODULE */}
        <div className="bg-white/[0.02] backdrop-blur-3xl p-10 md:p-12 rounded-[50px] border border-white/5 shadow-2xl relative overflow-hidden group hover:border-[#d4a373]/20 transition-all duration-700">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#d4a373]/30 to-transparent"></div>
            
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                <div className="flex-1 w-full space-y-2">
                    <label className="text-[8px] uppercase tracking-[0.5em] text-gray-500 ml-6">New Category Identifier</label>
                    <input 
                        type="text" 
                        className="w-full bg-white/[0.03] border border-white/10 p-5 px-8 rounded-full outline-none focus:border-[#d4a373] text-sm tracking-widest text-white placeholder:text-gray-800 transition-all"
                        placeholder="E.G. COUTURE ARCHIVE" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <button type="submit" className="w-full md:w-auto bg-[#d4a373] text-black font-black uppercase text-[10px] tracking-[0.4em] py-5 px-12 rounded-full hover:bg-white hover:scale-[1.05] transition-all shadow-xl active:scale-95 mt-6 md:mt-0">
                    Index Item
                </button>
            </form>
        </div>

        {/* 2. REGISTRY LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
            {categories?.length === 0 ? (
                <div className="col-span-full py-20 text-center opacity-20 text-[10px] tracking-[1em] uppercase">No Taxonomies Indexed</div>
            ) : (
                categories.map((c) => (
                    <div key={c._id} className="flex justify-between items-center bg-white/[0.01] p-8 rounded-[35px] border border-white/5 hover:bg-white/[0.03] hover:border-[#d4a373]/30 transition-all duration-500 group">
                        <div className="flex flex-col">
                            <span className="text-[7px] uppercase tracking-[0.4em] text-gray-600 mb-1 font-bold">Category Name</span>
                            <span className="font-serif italic text-2xl text-white group-hover:text-[#d4a373] transition-colors">{c.name}</span>
                        </div>
                        
                        <div className="flex gap-6 opacity-40 group-hover:opacity-100 transition-all duration-500">
                            <button 
                                onClick={() => { setVisible(true); setUpdatedName(c.name); setSelected(c); }} 
                                className="text-[9px] uppercase tracking-[0.3em] text-gray-400 hover:text-white border-b border-transparent hover:border-white transition-all"
                            >
                                Edit
                            </button>
                            <button 
                                onClick={() => handleDelete(c._id)} 
                                className="text-[9px] uppercase tracking-[0.3em] text-red-900 hover:text-red-500 transition-all"
                            >
                                Erase
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* 3. MODERN MODAL OVERRIDE */}
        {visible && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500">
                <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setVisible(false)}></div>
                
                <div className="bg-[#0a0a0a] p-12 rounded-[60px] border border-[#d4a373]/30 w-full max-w-xl relative z-10 shadow-[0_0_100px_rgba(212,163,115,0.1)] overflow-hidden animate-in zoom-in duration-500">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#d4a373] to-transparent"></div>
                    
                    <button onClick={() => setVisible(false)} className="absolute top-10 right-10 text-gray-600 hover:text-white text-2xl transition-all">✕</button>
                    
                    <div className="text-center mb-12">
                        <span className="text-[#d4a373] text-[9px] uppercase tracking-[0.6em] font-black">System Override</span>
                        <h3 className="text-4xl font-serif italic text-white mt-4">Modify Taxonomy</h3>
                    </div>
                    
                    <form onSubmit={handleUpdate} className="space-y-12">
                        <div className="space-y-4">
                            <label className="text-[8px] uppercase tracking-[0.5em] text-gray-600 ml-8">Updated Identifier</label>
                            <input 
                                type="text" 
                                className="w-full bg-white/[0.02] border border-white/10 p-6 px-10 rounded-full outline-none focus:border-[#d4a373] text-white text-lg tracking-widest text-center uppercase"
                                value={updatedName}
                                onChange={(e) => setUpdatedName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        
                        <button type="submit" className="w-full bg-[#d4a373] text-black font-black uppercase text-[10px] tracking-[0.5em] py-6 rounded-full hover:bg-white transition-all shadow-2xl">
                            Verify & Update Protocol
                        </button>
                    </form>
                </div>
            </div>
        )}

      </div>

      <footer className="mt-40 text-center opacity-20 py-10 border-t border-white/5 max-w-4xl mx-auto">
          <p className="text-[8px] uppercase tracking-[1em] text-gray-500 font-light leading-loose">
            Taxonomy Management System • House of Rahaa Global Logistics Hub 2026
          </p>
      </footer>
    </div>
  );
};

export default CreateCategory;