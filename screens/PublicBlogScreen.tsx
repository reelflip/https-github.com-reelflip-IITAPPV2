
import React from 'react';
import { BlogPost } from '../lib/types';

interface Props {
  blogs: BlogPost[];
  onBack: () => void;
}

export const PublicBlogScreen: React.FC<Props> = ({ blogs, onBack }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">IIT<span className="text-blue-600">JEE</span>Prep</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded font-bold uppercase">Blog</span>
           </div>
           <button 
             onClick={onBack}
             className="text-sm font-bold text-slate-600 hover:text-blue-600"
           >
             ← Back to Login
           </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-slate-900 text-white py-20 px-4">
         <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Insights for Aspirants</h1>
            <p className="text-slate-400 text-lg">Exam strategies, motivational stories, and subject deep-dives.</p>
         </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
         {blogs.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
               <p className="text-xl">No posts published yet.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {blogs.map(post => (
                 <article key={post.id} className="flex flex-col group cursor-pointer">
                    <div className="aspect-video bg-slate-200 rounded-xl overflow-hidden mb-4 relative">
                       {post.imageUrl ? (
                          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                             <span className="text-4xl opacity-20">✍️</span>
                          </div>
                       )}
                    </div>
                    <div className="flex-1">
                       <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                          <span className="font-bold text-blue-600 uppercase">{post.author}</span>
                          <span>•</span>
                          <span>{new Date(post.date).toLocaleDateString()}</span>
                       </div>
                       <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {post.title}
                       </h2>
                       <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                          {post.excerpt}
                       </p>
                       <span className="text-blue-600 font-bold text-sm underline decoration-blue-200 hover:decoration-blue-600 transition-all">
                          Read Article
                       </span>
                    </div>
                 </article>
               ))}
            </div>
         )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-50 border-t py-12 text-center text-slate-400 text-sm">
         <p>&copy; {new Date().getFullYear()} IITJEEPrep. All rights reserved.</p>
      </footer>
    </div>
  );
};