import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Zap, Shield, ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Professional Equipment
              <span className="text-primary-600"> Photo Enhancement</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your equipment photos into eye-catching thumbnails that drive more clicks and sales. 
              Remove distracting objects, enhance backgrounds, and create professional-looking images that make equipment irresistible to buyers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/upload"
                className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                Try Free Today - No Credit Card
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/pricing"
                className="border border-primary-600 text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Equipment Photo Pro?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional-grade photo enhancement powered by advanced AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Object Removal</h3>
              <p className="text-gray-600">
                AI automatically removes distracting objects, people, and clutter from your photos, 
                making your equipment the clear focal point that draws buyers' attention.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Enhanced Backgrounds</h3>
              <p className="text-gray-600">
                Transform messy backgrounds into clean, professional surfaces. 
                Add beautiful skies and landscapes that make your equipment photos more appealing.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sales-Ready Thumbnails</h3>
              <p className="text-gray-600">
                Perfect for creating eye-catching listing thumbnails that increase click-through rates. 
                Enhance your main gallery images to attract more potential buyers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get professional results in just three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Photos</h3>
              <p className="text-gray-600">
                Drag and drop your equipment photos or click to browse and select files.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Processing</h3>
              <p className="text-gray-600">
                Our AI analyzes and enhances your photos with professional-grade improvements.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Download Results</h3>
              <p className="text-gray-600">
                Download your enhanced photos ready for listing and selling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Examples Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See the Difference
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform cluttered, distracting photos into clean, professional thumbnails that attract more buyers
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Before Image */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Before</h3>
              <div className="relative">
                <img 
                  src="/before-example.jpg" 
                  alt="Equipment photo before enhancement - cluttered background with distracting objects"
                  className="w-full h-64 object-cover rounded-lg shadow-lg border-4 border-red-200"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-64 bg-gray-200 rounded-lg shadow-lg border-4 border-red-200 items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">📷</div>
                    <div className="text-sm">Before Example</div>
                    <div className="text-xs">Upload before-example.jpg</div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3 max-w-sm mx-auto">
                Cluttered background with distracting objects, poor lighting, and messy surroundings
              </p>
            </div>

            {/* After Image */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">After</h3>
              <div className="relative">
                <img 
                  src="/after-example.jpg" 
                  alt="Equipment photo after enhancement - clean professional background"
                  className="w-full h-64 object-cover rounded-lg shadow-lg border-4 border-green-200"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-64 bg-gray-200 rounded-lg shadow-lg border-4 border-green-200 items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">✨</div>
                    <div className="text-sm">After Example</div>
                    <div className="text-xs">Upload after-example.jpg</div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3 max-w-sm mx-auto">
                Clean professional background, enhanced lighting, and equipment as the clear focal point
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center space-x-4 bg-blue-50 px-6 py-3 rounded-full">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Before: Cluttered & Distracting</span>
              </div>
              <div className="text-gray-400">→</div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">After: Clean & Professional</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Equipment Photos?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of dealerships already using Equipment Photo Pro to create compelling listing thumbnails that drive more sales.
          </p>
          <Link
            to="/upload"
            className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
          >
            Start Free Trial - Just Email Required
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
