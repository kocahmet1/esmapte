import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Home: React.FC = () => {
  return (
    <Layout 
      title="PTE Practice" 
      subtitle="Practice PTE Academic exam with interactive exercises"
    >
      <div className="max-w-4xl mx-auto">
        {/* Introduction */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">Welcome to PTE Practice</h2>
          <p className="mb-4">
            This application provides interactive practice exercises for the Pearson Test of English Academic (PTE Academic) exam.
            Click on the exercise types below to start practicing.
          </p>
          <p className="text-sm text-gray-600">
            Note: This is a practice application. Your responses are saved locally in your browser.
          </p>
        </div>

        {/* Exercise sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Writing Zone */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg overflow-hidden">
            <div className="bg-yellow-200 py-3 px-4">
              <h2 className="text-xl font-bold text-yellow-800">Writing Zone</h2>
            </div>
            <div className="p-4 space-y-2">
              <Link 
                to="/writing/summarize" 
                className="block bg-white p-4 rounded-lg border border-gray-200 hover:border-yellow-300 hover:shadow-md transition"
              >
                <h3 className="font-medium text-lg">Summarize Written Text</h3>
                <p className="text-sm text-gray-600">Summarize a passage in one sentence</p>
              </Link>
              
              <Link 
                to="/writing/essay" 
                className="block bg-white p-4 rounded-lg border border-gray-200 hover:border-yellow-300 hover:shadow-md transition"
              >
                <h3 className="font-medium text-lg">Write Essay</h3>
                <p className="text-sm text-gray-600">Write an essay on a given topic</p>
              </Link>
            </div>
          </div>

          {/* Reading Zone */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
            <div className="bg-blue-200 py-3 px-4">
              <h2 className="text-xl font-bold text-blue-800">Reading Zone</h2>
            </div>
            <div className="p-4 space-y-2">
              <Link 
                to="/reading/mc-single" 
                className="block bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition"
              >
                <h3 className="font-medium text-lg">Multiple Choice, Single Answer</h3>
                <p className="text-sm text-gray-600">Select the best answer from options</p>
              </Link>
              
              <Link 
                to="/reading/mc-multi" 
                className="block bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition"
              >
                <h3 className="font-medium text-lg">Multiple Choice, Multiple Answers</h3>
                <p className="text-sm text-gray-600">Select all correct answers</p>
              </Link>
              
              <Link 
                to="/reading/reorder" 
                className="block bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition"
              >
                <h3 className="font-medium text-lg">Reorder Paragraphs</h3>
                <p className="text-sm text-gray-600">Put paragraphs in the correct order</p>
              </Link>
              
              <Link 
                to="/reading/drag-blank" 
                className="block bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition"
              >
                <h3 className="font-medium text-lg">Fill in the Blanks (Drag)</h3>
                <p className="text-sm text-gray-600">Drag words to appropriate blanks</p>
              </Link>
              
              <Link 
                to="/reading/dropdown-blank" 
                className="block bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition"
              >
                <h3 className="font-medium text-lg">Fill in the Blanks (Dropdown)</h3>
                <p className="text-sm text-gray-600">Select words from dropdown menus</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-700 mb-3">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded border border-gray-200">
              <h3 className="font-medium">Listening Section</h3>
              <p className="text-sm text-gray-600">Audio exercises with transcripts</p>
            </div>
            <div className="p-3 bg-white rounded border border-gray-200">
              <h3 className="font-medium">Speaking Section</h3>
              <p className="text-sm text-gray-600">Record and evaluate your speaking</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
