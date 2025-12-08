
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { Button } from '../components/Button';

export const ContactUsScreen: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    
    // Simulate API call
    try {
        await fetch('/api/contact.php', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
    } catch(e) { console.error(e); }

    setTimeout(() => {
        setSent(false);
        setFormData({ name: '', email: '', subject: '', message: '' });
        alert("Message sent successfully!");
    }, 2000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 pb-10">
       <div className="bg-slate-50 py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
             <h1 className="text-3xl font-bold text-slate-800">Get in Touch</h1>
             <p className="text-slate-500 mt-2">Have questions about the app? We're here to help.</p>
          </div>
       </div>

       <div className="max-w-5xl mx-auto px-4 mt-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Contact Info */}
              <div className="md:col-span-1 space-y-6">
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start space-x-4">
                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                       <Mail className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-800">Email Us</h3>
                       <p className="text-sm text-slate-500 mt-1">support@iitjeeprep.com</p>
                       <p className="text-sm text-slate-500">admin@iitjeeprep.com</p>
                    </div>
                 </div>

                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start space-x-4">
                    <div className="bg-green-50 p-3 rounded-xl text-green-600">
                       <Phone className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-800">Call Us</h3>
                       <p className="text-sm text-slate-500 mt-1">Mon-Fri from 9am to 6pm</p>
                       <p className="text-sm text-slate-500 font-mono">+91 98765 43210</p>
                    </div>
                 </div>

                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start space-x-4">
                    <div className="bg-orange-50 p-3 rounded-xl text-orange-600">
                       <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-800">Office</h3>
                       <p className="text-sm text-slate-500 mt-1">
                          123 Education Hub,<br/>
                          Kota, Rajasthan 324005
                       </p>
                    </div>
                 </div>
              </div>

              {/* Contact Form */}
              <div className="md:col-span-2 bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                 <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-blue-600" /> Send us a Message
                 </h2>
                 <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase">Your Name</label>
                          <input 
                            id="name"
                            type="text" 
                            required
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                          />
                       </div>
                       <div className="space-y-2">
                          <label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase">Your Email</label>
                          <input 
                            id="email"
                            type="email" 
                            required
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label htmlFor="subject" className="text-xs font-bold text-slate-500 uppercase">Subject</label>
                       <input 
                         id="subject"
                         type="text" 
                         required
                         className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
                         placeholder="How can we help?"
                         value={formData.subject}
                         onChange={e => setFormData({...formData, subject: e.target.value})}
                       />
                    </div>

                    <div className="space-y-2">
                       <label htmlFor="message" className="text-xs font-bold text-slate-500 uppercase">Message</label>
                       <textarea 
                         id="message"
                         required
                         className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none h-32 resize-none"
                         placeholder="Type your message here..."
                         value={formData.message}
                         onChange={e => setFormData({...formData, message: e.target.value})}
                       />
                    </div>

                    <Button 
                        type="submit" 
                        isLoading={sent}
                        className="w-full"
                    >
                        <Send className="w-4 h-4 mr-2" /> Send Message
                    </Button>
                 </form>
              </div>
           </div>
       </div>
    </div>
  );
};
