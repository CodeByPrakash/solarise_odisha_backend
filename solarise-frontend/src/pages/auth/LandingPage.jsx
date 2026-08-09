import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LandingPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.identifier.trim(), formData.password);
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
      const msg = err.response?.data?.error || err.response?.data?.message || 'Invalid email/phone number or password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative overflow-x-hidden">
      {/* Background Geometric Android Mesh & Spotlights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] [background-size:28px_28px] opacity-40 pointer-events-none"></div>
      <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-300/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-300/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Android Material Navbar */}
      <nav className="sticky top-4 z-40 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white/90 backdrop-blur-xl rounded-full border border-slate-200/80 shadow-sm p-3 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-[14px] bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-0.5 shadow-sm">
              <div className="h-full w-full bg-white rounded-[12px] flex items-center justify-center text-emerald-600 font-bold text-lg">
                ☀️
              </div>
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 block font-mono">
                SOLARISE <span className="text-emerald-600">ODISHA</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 block -mt-1 tracking-wider uppercase">
                PM Surya Ghar Portal
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-xs font-bold text-slate-600">
            <a href="#features" className="hover:text-emerald-600 transition">Key Features</a>
            <a href="#stats" className="hover:text-emerald-600 transition">Live Stats</a>
            <a href="#discom" className="hover:text-emerald-600 transition">DISCOM Integration</a>
          </div>

          <button
            onClick={() => setShowLoginModal(true)}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
          >
            <span>Portal Login</span>
            <span>→</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Hero Copy & CTA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 font-bold text-xs px-4 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>PM-SURYA GHAR: MUFT BIJLI YOJANA</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Powering Odisha with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">Clean Solar Energy</span>
            </h1>

            <p className="text-base text-slate-600 leading-relaxed font-normal max-w-2xl">
              Official operations dashboard for solar rooftop installations, DISCOM net-metering approvals, geotagged inspection records, and automated CFA/SFA subsidy disbursals across Odisha state.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
              >
                <span>Sign In to Access Portal</span>
                <span className="text-lg">→</span>
              </button>

              <a
                href="#features"
                className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm px-6 py-3.5 rounded-full border border-slate-200 shadow-2xs transition"
              >
                Explore Operations Grid
              </a>
            </div>

            {/* Scheme Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
              <div>
                <span className="block text-2xl font-extrabold text-slate-900 font-mono">300 Units</span>
                <span className="text-xs text-slate-500 font-medium">Free electricity monthly</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-slate-900 font-mono">₹78,000</span>
                <span className="text-xs text-slate-500 font-medium">Max Govt subsidy per home</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-slate-900 font-mono">100% Digital</span>
                <span className="text-xs text-slate-500 font-medium">Geotagged DISCOM sync</span>
              </div>
            </div>
          </div>

          {/* Right Column: Android Geometry Styled Login Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative bg-white rounded-[32px] border border-slate-200/90 shadow-xl p-8 space-y-6">
              
              {/* Android Geometric Header Badge */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-[16px] bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center font-bold text-lg shadow-2xs">
                    ⬡
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">System Sign In</h3>
                    <p className="text-xs text-slate-500">Authorized Personnel & Installers</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  SECURE SSO
                </span>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
                    Email Address or Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="identifier"
                      value={formData.identifier}
                      onChange={handleChange}
                      required
                      placeholder="e.g. admin@solarise.gov.in or 9876543210"
                      className="w-full pl-11 pr-4 py-3 rounded-[16px] border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      👤
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
                    Account Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={4}
                      placeholder="Enter security password"
                      className="w-full pl-11 pr-4 py-3 rounded-[16px] border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      🔒
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-50 text-rose-700 rounded-[14px] p-3 text-xs border border-rose-200 font-semibold shadow-2xs">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-[16px] transition shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Solarise Operations & Material Delivery System
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Android Geometry Feature Bento Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-200/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-mono">
            Platform Capabilities
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            Designed for DISCOMs, Vendors, & Field Agents
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Streamlined workflow across multi-batch material delivery, geotagged inspections, and net-metering clearances.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-[28px] border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4">
            <div className="h-12 w-12 rounded-[18px] bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center text-xl shadow-2xs">
              📦
            </div>
            <h3 className="text-lg font-bold text-slate-900">Multi-Batch Material Delivery</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track DCR solar panels, inverter serial numbers, and mounting structure batch logs per project with zero unique constraint bottlenecks.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-[28px] border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4">
            <div className="h-12 w-12 rounded-[18px] bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center text-xl shadow-2xs">
              📍
            </div>
            <h3 className="text-lg font-bold text-slate-900">Geotagged Photo Inspection</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload GPS geotagged installation photos, DISCOM NOC copies, and PMSGY portal proof documents for instant verification.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-[28px] border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4">
            <div className="h-12 w-12 rounded-[18px] bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center text-xl shadow-2xs">
              💳
            </div>
            <h3 className="text-lg font-bold text-slate-900">Automated Subsidy Clearance</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Monitor CFA (Central Financial Assistance) & SFA state subsidies with automated payment ledger updates and bank loan logs.
            </p>
          </div>
        </div>
      </section>

      {/* Floating Login Modal (If triggered from header) */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white rounded-[32px] border border-slate-200 shadow-2xl p-8 space-y-6">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold text-base"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-[20px] bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center mx-auto text-xl shadow-2xs">
                ☀️
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Sign In to Solarise</h3>
              <p className="text-xs text-slate-500">Access your project pipelines and operations</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 font-mono">
                  Email or Phone
                </label>
                <input
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  required
                  placeholder="Enter registered identifier"
                  className="w-full px-4 py-3 rounded-[16px] border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 font-mono">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter account password"
                  className="w-full px-4 py-3 rounded-[16px] border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {error && (
                <div className="bg-rose-50 text-rose-700 rounded-[14px] p-3 text-xs border border-rose-200 font-semibold">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-[16px] transition shadow-md disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-8 text-center text-xs text-slate-500">
        <p>© 2026 Solarise Odisha Operations Platform • PM Surya Ghar Muft Bijli Yojana</p>
      </footer>
    </div>
  );
};

export default LandingPage;
