
import React, { useState } from 'react';
import { BlogPost } from '../lib/types';
import { RichTextEditor } from '../components/RichTextEditor';
import { Save, Plus, Trash2, Layout, Eye, PenTool, Image as ImageIcon, Edit, Search, X } from 'lucide-react';

interface Props {
  blogs?: BlogPost[];
  onAddBlog?: (blog: BlogPost) => void;
  onUpdateBlog?: (blog: BlogPost) => void;
  onDeleteBlog?: (id: number) => void;
}

export const AdminBlogScreen: React.FC<Props> = ({ blogs = [], onAddBlog, onUpdateBlog, onDeleteBlog }) => {
  // Editor State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [author, setAuthor] = useState('Admin');
  const [category, setCategory] = useState('Strategy');
  
  const [isPreview, setIsPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = () => {
    if (!title || !content) {
        alert("Title and Content are required!");
        return;
    }
    
    const postData: BlogPost = {
        id: editingId || Date.now(),
        title,
        excerpt,
        content,
        author,
        category,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1000',
        date: editingId ? (blogs.find(b => b.id === editingId)?.date || new Date().toISOString()) : new Date().toISOString()
    };

    if (editingId && onUpdateBlog) {
        onUpdateBlog(postData);
        alert("Blog Updated!");
    } else if (onAddBlog) {
        onAddBlog(postData);
        alert("Blog Published!");
    }
    
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setExcerpt('');
    setContent('');
    setImageUrl('');
    setAuthor('Admin');
    setCategory('Strategy');
    setIsPreview(false);
  };

  const handleEdit = (blog: BlogPost) => {
      setEditingId(blog.id);
      setTitle(blog.title);
      setExcerpt(blog.excerpt);
      setContent(blog.content);
      setImageUrl(blog.imageUrl || '');
      setAuthor(blog.author);
      setCategory(blog.category || 'Strategy');
      setIsPreview(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredBlogs = blogs.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                  <div className="flex items-center space-x-3 mb-2">
                      <PenTool className="w-8 h-8 text-white" />
                      <h1 className="text-3xl font-bold">Blog Editor</h1>
                  </div>
                  <p className="text-pink-100 text-lg opacity-90 max-w-2xl">
                      Write and publish insightful articles, exam strategies, and updates for students.
                  </p>
              </div>
              
              <div className="flex gap-2">
                  <button 
                      onClick={() => setIsPreview(!isPreview)}
                      className={`px-4 py-2 rounded-lg font-bold flex items-center transition-colors ${isPreview ? 'bg-white/90 text-rose-700' : 'bg-pink-700 text-white border border-pink-500 hover:bg-pink-800'}`}
                  >
                      {isPreview ? <><PenTool size={16} className="mr-2"/> Edit</> : <><Eye size={16} className="mr-2"/> Preview</>}
                  </button>
                  {editingId && (
                      <button 
                          onClick={resetForm}
                          className="bg-white/20 text-white px-4 py-2 rounded-lg font-bold hover:bg-white/30 flex items-center backdrop-blur-sm"
                      >
                          <X size={18} className="mr-2" /> Cancel
                      </button>
                  )}
                  <button 
                      onClick={handleSubmit}
                      className="bg-white text-rose-600 px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-slate-50 flex items-center transition-all active:scale-95"
                  >
                      <Save size={18} className="mr-2" /> {editingId ? 'Update Post' : 'Publish'}
                  </button>
              </div>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10"></div>
          <div className="absolute bottom-0 right-20 w-32 h-32 rounded-full bg-white opacity-10"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Editor Column */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* Metadata Inputs */}
            <div className={`space-y-4 ${isPreview ? 'hidden' : 'block'}`}>
                <input 
                    type="text" 
                    placeholder="Article Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full text-3xl font-black text-slate-900 placeholder:text-slate-300 border-none outline-none bg-transparent"
                />
                
                <textarea 
                    placeholder="Short excerpt or summary..."
                    value={excerpt}
                    onChange={e => setExcerpt(e.target.value)}
                    className="w-full text-lg text-slate-600 placeholder:text-slate-300 border-none outline-none bg-transparent resize-none h-20"
                />
            </div>

            {/* Rich Editor or Preview */}
            {isPreview ? (
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm min-h-[600px]">
                    {imageUrl && (
                        <img src={imageUrl} alt="Cover" className="w-full h-64 object-cover rounded-xl mb-8" />
                    )}
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">{title || "Untitled Post"}</h1>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-8 border-b border-slate-100 pb-6">
                        <span className="font-bold text-blue-600 uppercase">{author}</span>
                        <span>•</span>
                        <span>{new Date().toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-xs uppercase font-bold">{category}</span>
                    </div>
                    <div 
                        className="blog-content"
                        dangerouslySetInnerHTML={{ __html: content }} 
                    />
                </div>
            ) : (
                <RichTextEditor 
                    content={content} 
                    onChange={setContent} 
                    placeholder="Write your masterpiece here... Use the toolbar for formatting."
                />
            )}
         </div>

         {/* Sidebar Settings */}
         <div className={`lg:col-span-1 space-y-6 ${isPreview ? 'hidden lg:block opacity-50 pointer-events-none' : ''}`}>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 sticky top-6">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Post Settings</h3>
                
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
                    <select 
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100"
                    >
                        <option>Strategy</option>
                        <option>Motivation</option>
                        <option>Subject-wise</option>
                        <option>Updates</option>
                        <option>News</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Author Name</label>
                    <input 
                        value={author}
                        onChange={e => setAuthor(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cover Image URL</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <ImageIcon className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                            <input 
                                value={imageUrl}
                                onChange={e => setImageUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>
                    {imageUrl && (
                        <div className="mt-2 rounded-lg overflow-hidden h-32 border border-slate-200">
                            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
            </div>
         </div>
      </div>

      {/* Published Blogs List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                  <h3 className="text-lg font-bold text-slate-800">Published Content</h3>
                  <p className="text-sm text-slate-500">Manage existing blog posts.</p>
              </div>
              <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                      type="text" 
                      placeholder="Search posts..." 
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>
          
          <div className="divide-y divide-slate-100">
              {filteredBlogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                      No blog posts found.
                  </div>
              ) : (
                  filteredBlogs.map(blog => (
                      <div key={blog.id} className={`p-4 sm:p-6 flex flex-col sm:flex-row gap-4 hover:bg-slate-50 transition-colors ${editingId === blog.id ? 'bg-blue-50/50 ring-2 ring-inset ring-blue-100' : ''}`}>
                          <div className="w-full sm:w-48 h-32 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                              {blog.imageUrl ? (
                                  <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                                      <ImageIcon className="w-8 h-8" />
                                  </div>
                              )}
                          </div>
                          
                          <div className="flex-1">
                              <div className="flex flex-wrap gap-2 mb-2">
                                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                      {blog.category}
                                  </span>
                                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                      {new Date(blog.date).toLocaleDateString()}
                                  </span>
                              </div>
                              <h4 className="text-lg font-bold text-slate-800 mb-2">{blog.title}</h4>
                              <p className="text-sm text-slate-600 line-clamp-2 mb-3">{blog.excerpt}</p>
                              
                              <div className="flex gap-2">
                                  <button 
                                      onClick={() => handleEdit(blog)}
                                      className="flex items-center px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 text-xs font-bold hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all bg-slate-50"
                                  >
                                      <Edit className="w-3 h-3 mr-1.5" /> Edit
                                  </button>
                                  <button 
                                      onClick={() => {
                                          if(confirm('Are you sure you want to delete this post?')) {
                                              if(onDeleteBlog) onDeleteBlog(blog.id);
                                          }
                                      }}
                                      className="flex items-center px-3 py-1.5 rounded-md border border-red-100 text-red-600 text-xs font-bold hover:bg-red-50 hover:border-red-200 transition-all bg-white"
                                  >
                                      <Trash2 className="w-3 h-3 mr-1.5" /> Delete
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))
              )}
          </div>
      </div>
    </div>
  );
};
