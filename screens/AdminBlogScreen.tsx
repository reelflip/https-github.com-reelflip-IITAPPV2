
import React, { useState } from 'react';
import { BlogPost } from '../lib/types';
import { RichTextEditor } from '../components/RichTextEditor';
import { Save, Plus, Trash2, Layout, Eye, PenTool, Image as ImageIcon } from 'lucide-react';

interface Props {
  blogs?: BlogPost[];
  onAddBlog?: (blog: BlogPost) => void;
  onDeleteBlog?: (id: number) => void;
}

export const AdminBlogScreen: React.FC<Props> = ({ blogs = [], onAddBlog, onDeleteBlog }) => {
  // Editor State
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [author, setAuthor] = useState('Admin');
  const [category, setCategory] = useState('Strategy');
  
  const [isPreview, setIsPreview] = useState(false);

  const handleSubmit = () => {
    if (!title || !content) {
        alert("Title and Content are required!");
        return;
    }
    const newPost: BlogPost = {
        id: Date.now(),
        title,
        excerpt,
        content,
        author,
        category,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1000',
        date: new Date().toISOString()
    };
    if(onAddBlog) onAddBlog(newPost);
    
    // Reset
    setTitle('');
    setExcerpt('');
    setContent('');
    setImageUrl('');
    alert("Blog Published!");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Blog Editor</h2>
            <p className="text-slate-500">Create engaging content for students.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setIsPreview(!isPreview)}
                className={`px-4 py-2 rounded-lg font-bold flex items-center transition-colors ${isPreview ? 'bg-slate-200 text-slate-700' : 'bg-white border border-slate-200 text-blue-600'}`}
            >
                {isPreview ? <><PenTool size={16} className="mr-2"/> Edit</> : <><Eye size={16} className="mr-2"/> Preview</>}
            </button>
            <button 
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700 flex items-center"
            >
                <Save size={18} className="mr-2" /> Publish
            </button>
        </div>
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
    </div>
  );
};
