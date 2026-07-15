import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import SchemaBuilderPage from './modules/schema-builder/pages/SchemaBuilderPage';
import { ApplicationDashboard } from './modules/application/pages/ApplicationDashboard';

const ApplicationDetailPlaceholder = () => (
  <div className="p-8">
    <h2 className="text-xl">Application Detail View</h2>
    {/* In full implementation, this fetches the app details and renders Workspace */}
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">SRF Management Platform</h1>
            <p>Welcome to the SRF Admin. To test the Schema Builder, navigate to an edition.</p>
            <div className="mt-4">
              <Link 
                to="/admin/schema-builder/test-edition-id" 
                className="text-blue-600 hover:underline"
              >
                Open Schema Builder (Test Edition)
              </Link>
            </div>
          </div>
        } />
        <Route path="/admin/schema-builder/:editionId" element={<SchemaBuilderPage />} />
        
        {/* User Application Routes */}
        <Route path="/applications" element={<ApplicationDashboard />} />
        <Route path="/applications/:id" element={<ApplicationDetailPlaceholder />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
