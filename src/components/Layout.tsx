import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-xl font-bold">PTE Practice</Link>
            <nav className="hidden md:block">
              <ul className="flex space-x-6">
                <li><Link to="/" className="hover:text-blue-200">Home</Link></li>
                <li><Link to="/reading" className="hover:text-blue-200">Reading</Link></li>
                <li><Link to="/writing" className="hover:text-blue-200">Writing</Link></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-lg text-gray-600">{subtitle}</p>
            )}
          </div>

          {/* Page content */}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-gray-600">
            PTE Practice App &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
