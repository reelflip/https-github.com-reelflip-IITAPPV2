
import React, { useState } from 'react';
import { BlogPost } from '../lib/types';
import { ArrowLeft, User, Calendar, Tag } from 'lucide-react';

interface Props {
  blogs: BlogPost[];
  onBack: () => void;
}

export const PublicBlogScreen: React.FC<Props> = ({ blogs, onBack }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  if (selectedPost) {
      return (
          <div className="min-h-screen bg-white font-inter">
              <nav className="border-b sticky top-0 bg-white/95 backdrop-blur-md z-20">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                   <button 
                     onClick={() => setSelectedPost(null)}
                     className="flex items-center text-slate-600 hover:text-blue-600 transition-colors text-sm font-bold"
                   >
                     <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
                   </button>
                   <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Reading Mode</span>
                </div>
              </nav>

              <div className="max-w-3xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4">
                  {selectedPost.imageUrl && (
                      <img src={selectedPost.imageUrl} alt={selectedPost.title} className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-lg mb-8" />
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
                      <span className="flex items-center font-bold text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded">
                          <Tag className="w-3 h-3 mr-1" /> {selectedPost.category || 'General'}
                      </span>
                      <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" /> {selectedPost.author}
                      </span>
                      <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" /> {new Date(selectedPost.date).toLocaleDateString()}
                      </span>
                  </div>

                  <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">{selectedPost.title}</h1>
                  
                  <div className="h-px bg-slate-100 my-8"></div>

                  <div 
                      className="blog-content prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-blue-600"
                      dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                  />
                  
                  <div className="h-px bg-slate-100 my-12"></div>
                  
                  <div className="text-center">
                      <button 
                        onClick={() => setSelectedPost(null)}
                        className="text-slate-500 hover:text-slate-800 text-sm font-bold"
                      >
                          Read more articles
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-white animate-in fade-in">
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
                 <article 
                    key={post.id} 
                    className="flex flex-col group cursor-pointer"
                    onClick={() => setSelectedPost(post)}
                 >
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
                       <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight">
                          {post.title}
                       </h2>
                       <p className="text-slate-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                          {post.excerpt}
                       </p>
                       <button
                          onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPost(post);
                          }} 
                          className="text-blue-600 font-bold text-sm underline decoration-blue-200 hover:decoration-blue-600 transition-all"
                       >
                          Read Article
                       </button>
                    </div>
                 </article>
               ))}
            </div>
         )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-50 border-t py-12 text-center text-slate-400 text-sm">
         <p>&copy; {new Date().getFullYear()} IITGEEPrep. All rights reserved.</p>
      </footer>
    </div>
  );
};
