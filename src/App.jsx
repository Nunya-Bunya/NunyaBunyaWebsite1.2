import React, { useState } from 'react';

const NunyaBunyaWebsite = () => {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="bg-black text-white min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b-2 border-pink-500">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-black bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
              NUNYA BUNYA
            </div>
            <div className="flex gap-8">
              {['home', 'services', 'contact'].map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`font-bold text-lg transition-all ${
                    currentPage === page ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {page.charAt(0).toUpperCase() + page.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20">
        {currentPage === 'home' && (
          <div className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center max-w-4xl">
              <h1 className="text-7xl font-black mb-6 bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Your Marketing Sucks.
              </h1>
              <h2 className="text-5xl font-bold mb-8 text-white">
                We Fix It.
              </h2>
              <p className="text-2xl mb-12 text-gray-300">
                Brisbane's boldest digital marketing agency. No fluff, no BS, just results.
              </p>
              <button
                onClick={() => setCurrentPage('contact')}
                className="px-12 py-5 bg-gradient-to-r from-pink-500 to-cyan-500 text-white text-xl font-bold rounded-xl hover:scale-105 transition-all"
              >
                Get Started →
              </button>
            </div>
          </div>
        )}

        {currentPage === 'services' && (
          <div className="min-h-screen py-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-black mb-6 text-white">Our Services</h1>
              <p className="text-xl text-gray-400 mb-12">Coming soon!</p>
            </div>
          </div>
        )}

        {currentPage === 'contact' && (
          <div className="min-h-screen py-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-black mb-6 bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Let's Talk
              </h1>
              <p className="text-xl text-gray-400 mb-8">
                Email: hello@nunyabunya.com
              </p>
            </div>
          </div>
        )}
      </div>

      <footer className="border-t-2 border-cyan-500 bg-black py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">© 2025 Nunya Bunya. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default NunyaBunyaWebsite;
