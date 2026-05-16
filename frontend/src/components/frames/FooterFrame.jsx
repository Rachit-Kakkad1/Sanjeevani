import React from 'react';
import { ArrowRight, Mail, Twitter, Linkedin, Github } from 'lucide-react';

export const FooterFrame = () => {
    return (
        <footer className="w-full bg-white border-t border-gray-200 pt-20 pb-10 px-6 relative z-10 text-gray-600">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
                    
                    {/* Brand Column */}
                    <div className="lg:col-span-4 flex flex-col items-start pr-4">
                        <div className="flex items-center gap-3 mb-6">
                            <img src="/logo.png" alt="MedClear Shield" className="h-10 w-auto" />
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter">MedClear</h2>
                        </div>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            Empowering patients with AI-driven opacity resolution. We ensure you only pay what is fair, legal, and mandated by government benchmarks.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-primary hover:text-white transition-colors border border-gray-100">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-primary hover:text-white transition-colors border border-gray-100">
                                <Linkedin size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-primary hover:text-white transition-colors border border-gray-100">
                                <Github size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <h3 className="font-bold text-gray-900 mb-2">Product</h3>
                        <a href="#" className="hover:text-primary transition-colors">How it works</a>
                        <a href="#" className="hover:text-primary transition-colors">Pricing</a>
                        <a href="#" className="hover:text-primary transition-colors">Hospital Directory</a>
                        <a href="#" className="hover:text-primary transition-colors">Report a Fraud</a>
                    </div>
                    
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <h3 className="font-bold text-gray-900 mb-2">Company</h3>
                        <a href="#" className="hover:text-primary transition-colors">About Us</a>
                        <a href="#" className="hover:text-primary transition-colors">Careers</a>
                        <a href="#" className="hover:text-primary transition-colors">Blog</a>
                        <a href="#" className="hover:text-primary transition-colors">Contact</a>
                    </div>

                    {/* Newsletter Column */}
                    <div className="lg:col-span-4 flex flex-col">
                        <h3 className="font-bold text-gray-900 mb-4">Stay updated</h3>
                        <p className="text-gray-500 mb-6 text-sm">
                            Join our newsletter for the latest updates on medical pricing laws and consumer rights.
                        </p>
                        <div className="flex w-full bg-gray-50 border border-gray-200 rounded-full p-1 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                            <div className="pl-4 flex items-center text-gray-400">
                                <Mail size={18} />
                            </div>
                            <input 
                                type="email" 
                                placeholder="Email address" 
                                className="w-full bg-transparent border-none outline-none px-3 text-sm text-gray-900"
                            />
                            <button className="bg-primary text-white rounded-full p-2.5 hover:bg-gray-800 transition-colors">
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Legal Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-100 text-sm gap-4">
                    <p>© 2026 MedClear Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-gray-900 transition-colors">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
