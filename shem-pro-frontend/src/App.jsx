import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { EnergyDataProvider } from './hooks/EnergyDataContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import PageLoader from './components/ui/PageLoader.jsx';

// Lazy Load Pages
const LandingPage = lazy(() => import('./components/LandingPage.jsx'));
const LoginPage = lazy(() => import('./components/LoginPage.jsx'));
const RegistrationForm = lazy(() => import('./components/auth/RegistrationForm.jsx'));
const Dashboard = lazy(() => import('./components/Dashboard.jsx'));
const WelcomePage = lazy(() => import('./components/WelcomePage.jsx'));
const PrivacyPolicy = lazy(() => import('./components/Legal/PrivacyPolicy.jsx'));
const TermsAndConditions = lazy(() => import('./components/Legal/TermsAndConditions.jsx'));
const MetaTags = lazy(() => import('./components/MetaTags.jsx'));
const Documentation = lazy(() => import('./components/Documentation.tsx'));
const Support = lazy(() => import('./components/Support.tsx'));
const ProtectedRoute = lazy(() => import('./components/auth/ProtectedRoute.jsx'));

function App() {
  return (
    <EnergyDataProvider>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <Router>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={
                    <>
                      <MetaTags title="SHEM - Home" description="Welcome to SHEM, your energy management solution." canonical="/" />
                      <LandingPage />
                    </>
                  } />
                  <Route path="/login" element={
                    <>
                      <MetaTags title="SHEM - Login" description="Login to your SHEM account." canonical="/login" />
                      <LoginPage />
                    </>
                  } />
                  <Route path="/register" element={
                    <>
                      <MetaTags title="SHEM - Register" description="Create a new SHEM account." canonical="/register" />
                      <RegistrationForm />
                    </>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <MetaTags title="SHEM - Dashboard" description="Your personal energy dashboard." canonical="/dashboard" />
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/privacy-policy" element={
                    <>
                      <MetaTags title="SHEM - Privacy Policy" description="Read our privacy policy." canonical="/privacy-policy" />
                      <PrivacyPolicy />
                    </>
                  } />
                  <Route path="/terms-and-conditions" element={
                    <>
                      <MetaTags title="SHEM - Terms and Conditions" description="Read our terms and conditions." canonical="/terms-and-conditions" />
                      <TermsAndConditions />
                    </>
                  } />
                  <Route path="/documentation" element={
                    <>
                      <MetaTags title="SHEM - Documentation" description="Detailed project documentation for SHEM." canonical="/documentation" />
                      <Documentation />
                    </>
                  } />
                  <Route path="/support" element={
                    <>
                      <MetaTags title="SHEM - Support" description="Get support for your SHEM device." canonical="/support" />
                      <Support />
                    </>
                  } />
                  <Route path="/welcome" element={
                    <ProtectedRoute>
                      <MetaTags title="Welcome to SHEM" description="Complete your profile." canonical="/welcome" />
                      <WelcomePage />
                    </ProtectedRoute>
                  } />
                </Routes>
              </Suspense>
            </Router>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </EnergyDataProvider>
  );
}

export default App;