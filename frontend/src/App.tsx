import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ApplicationForm from './pages/ApplicationForm';
import ResultsPage from './pages/ResultsPage';
import PolicyManager from './pages/PolicyManager';

import Dashboard from './pages/Dashboard';
import ApplicationDetail from './pages/ApplicationDetail';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
          <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <span className="text-xl font-bold text-blue-600">Kaaj Lending</span>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <Link to="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Apply for Loan
                    </Link>
                    <Link to="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Dashboard
                    </Link>
                    <Link to="/policies" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Manage Policies
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <div className="py-10">
            <main>
              <Routes>
                <Route path="/" element={<ApplicationForm />} />
                <Route path="/results" element={<ResultsPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/applications/:id" element={<ApplicationDetail />} />
                <Route path="/policies" element={<PolicyManager />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
