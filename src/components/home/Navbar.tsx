"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Track scroll position for glass effect intensity
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? 'bg-white/0  backdrop-blur-lg'
                    : 'bg-white/0  backdrop-blur-sm'
                }`}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20 md:h-24 py-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <div className="relative w-15 h-10 flex items-center justify-center mr-3">
                        <svg  fill="#ffffff"
                        style={{width: '30px'}}
                        xmlns="http://www.w3.org/2000/svg" viewBox="92.902 -417.5753 284.3811 261.536" width="284.3811px" height="261.536px"><path d="M 422.51 641.38 C404.26,636.97 386.25,622.62 378.12,606.00 C370.86,591.15 370.91,591.96 371.22,511.19 L 371.50 439.50 L 374.22 431.50 C378.14,420.02 383.40,411.57 392.01,403.00 C400.85,394.19 411.59,387.74 423.38,384.15 C434.72,380.71 453.80,380.55 465.31,383.81 C487.82,390.19 503.42,403.78 517.18,429.00 C522.26,438.31 542.88,474.61 579.37,538.49 L 596.50 568.49 L 596.76 475.23 L 597.01 381.97 L 626.26 382.23 L 655.50 382.50 L 655.50 492.00 L 655.50 601.50 L 653.29 608.50 C648.02,625.20 635.47,637.04 618.30,641.51 C614.12,642.60 606.98,643.00 591.86,643.00 L 571.13 643.00 L 567.75 636.75 C563.80,629.46 516.07,546.39 475.44,476.11 C460.74,450.68 459.08,448.92 449.08,448.20 C441.75,447.67 436.13,450.34 432.25,456.20 L 429.50 460.35 L 429.50 512.09 L 429.50 563.83 L 432.51 568.12 C438.39,576.48 438.31,576.46 473.75,576.80 L 505.00 577.11 L 505.00 586.84 C505.00,603.85 500.34,615.57 489.00,627.09 C481.99,634.22 473.97,638.73 463.47,641.47 C455.76,643.47 430.95,643.42 422.51,641.38 Z" id="object-0" transform="matrix(1, 0, 0, 1, -278.2169189453125, -799.0392456054688)" data-index="0"></path></svg>

                        </div>
                        <span className="font-light text-xl text-white">Norai</span>
                    </Link>

                    {/* Desktop menu */}
                    <nav className="hidden md:flex space-x-10">
                        <Link href="/docs" className="text-white hover:text-white/80 transition-colors">
                            Features
                        </Link>

                        <Link href="/docs" className="text-white hover:text-white/80 transition-colors">
                            Use Cases         
                        </Link>

                        <Link href="/docs" className="text-white hover:text-white/80 transition-colors">
                            Documentation
                        </Link>

                        <div className="relative group">
                            <button className="flex items-center space-x-1 text-white hover:text-white/80 transition-colors">
                                <span>Company</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <div className="absolute left-0 mt-2 w-56 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg">
                                <div className="py-2 px-3">
                                    <Link href="/about" className="block px-3 py-2 text-gray-800 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors">
                                        About Us
                                    </Link>
                                    <Link href="/blog" className="block px-3 py-2 text-gray-800 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors">
                                        Blog
                                    </Link>
                                    <Link href="/contact" className="block px-3 py-2 text-gray-800 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors">
                                        Contact
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </nav>

                    {/* Auth buttons */}
                    <div className="hidden md:flex items-center space-x-3">
                        <Link href="/login" className="text-white hover:text-white/80 transition-colors px-3 py-2">
                            Log in
                        </Link>
                        <Link href="/register" className="bg-white text-black px-5 py-2 rounded-[20px] hover:bg-gray-200 transition-all hover:-translate-y-0.5 shadow-lg shadow-white/5">
                            Sign up
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden text-white hover:text-white/80 transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <div
                className={`md:hidden absolute w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-[500px] border-b border-gray-200 dark:border-gray-700' : 'max-h-0'
                    }`}
            >
                <div className="container mx-auto px-4 py-4">
                    <nav className="flex flex-col space-y-4">
                        <Link href="/docs" className="py-2 text-white hover:text-white/80 transition-colors border-b border-gray-200 dark:border-gray-700">
                            Features
                        </Link>

                        <Link href="/docs" className="py-2 text-white hover:text-white/80 transition-colors border-b border-gray-200 dark:border-gray-700">
                            Use Cases
                        </Link>

                        <Link href="/docs" className="py-2 text-white hover:text-white/80 transition-colors border-b border-gray-200 dark:border-gray-700">
                            Documentation
                        </Link>

                        <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                            <div className="flex items-center justify-between py-2">
                                <span className="font-medium text-gray-900 dark:text-white">Company</span>
                                <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="pl-4 pb-2">
                                <Link href="/about" className="block py-2 text-white hover:text-white/80 transition-colors">
                                    About Us
                                </Link>
                                <Link href="/blog" className="block py-2 text-white hover:text-white/80 transition-colors">
                                    Blog
                                </Link>
                                <Link href="/contact" className="block py-2 text-white hover:text-white/80 transition-colors">
                                    Contact
                                </Link>
                            </div>
                        </div>

                        <div className="flex flex-col pt-2 space-y-3">
                            <Link href="/login" className="py-2 text-center text-white hover:text-white/80 transition-colors">
                                Log in
                            </Link>
                            <Link href="/register" className="bg-white text-black py-3 rounded-md text-center hover:bg-gray-200 transition-all shadow-md">
                                Sign up
                            </Link>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
} 