import React, { useState } from 'react';
import { TripItinerary, UserPreferences, INTERESTS_LIST } from './types';
import { generateTripItinerary } from './services/geminiService';
import ItineraryView from './components/ItineraryView';
import { Plane, Compass, Users, DollarSign, Calendar, MapPin, Loader2, ArrowLeft } from './components/Icons';

type ViewState = 'landing' | 'wizard' | 'loading' | 'itinerary' | 'error';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [preferences, setPreferences] = useState<UserPreferences>({
    destination: '',
    duration: 3,
    travelers: 1,
    budget: 'Moderate',
    interests: [],
  });
  const [itinerary, setItinerary] = useState<TripItinerary | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleStartPlanning = () => setView('wizard');

  const handleInterestToggle = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferences.destination) return;
    
    setView('loading');
    setErrorMsg('');
    
    try {
      const result = await generateTripItinerary(preferences);
      setItinerary(result);
      setView('itinerary');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to generate itinerary. Please try again later.');
      setView('error');
    }
  };

  const handleReset = () => {
    setView('landing');
    setItinerary(null);
    setPreferences({
      destination: '',
      duration: 3,
      travelers: 1,
      budget: 'Moderate',
      interests: [],
    });
  };

  // --- Render Functions ---

  const renderLanding = () => (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <nav className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-500 p-2 rounded-lg text-white">
            <Compass className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-slate-800">WanderPlan AI</span>
        </div>
        <button className="text-sm font-medium text-slate-600 hover:text-emerald-600">Sign In</button>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-6">
        <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-emerald-700 text-sm font-medium mb-8 animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Powered by Gemini 2.5 & Google Maps</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 max-w-4xl leading-tight">
          Plan your dream trip <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">in seconds, not hours.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-10 leading-relaxed">
          Experience AI-curated itineraries backed by real-world data. 
          Get personalized recommendations, route optimization, and budget breakdowns instantly.
        </p>

        <button 
          onClick={handleStartPlanning}
          className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-200 bg-slate-900 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-1"
        >
          Start Planning Free
          <Plane className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
          {[
            { icon: <MapPin className="text-emerald-500" />, title: "Smart Routing", desc: "Optimized paths to save travel time." },
            { icon: <DollarSign className="text-blue-500" />, title: "Budget Estimates", desc: "Know your costs before you go." },
            { icon: <Compass className="text-indigo-500" />, title: "Local Gems", desc: "Discover places only locals know." }
          ].map((f, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center">{f.icon}</div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );

  const renderWizard = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="max-w-3xl mx-auto w-full px-4 py-12 flex-1 flex flex-col justify-center">
        <button onClick={() => setView('landing')} className="flex items-center text-slate-500 hover:text-slate-800 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 p-6 text-white">
            <h2 className="text-2xl font-bold">Trip Wizard</h2>
            <p className="text-slate-400">Tell us about your dream vacation</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Where do you want to go?</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={preferences.destination}
                  onChange={(e) => setPreferences({...preferences, destination: e.target.value})}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="e.g. Kyoto, Japan"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Duration (Days)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={preferences.duration}
                    onChange={(e) => setPreferences({...preferences, duration: parseInt(e.target.value)})}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Travelers */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Travelers</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={preferences.travelers}
                    onChange={(e) => setPreferences({...preferences, travelers: parseInt(e.target.value)})}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Budget Level</label>
              <div className="grid grid-cols-3 gap-4">
                {['Budget', 'Moderate', 'Luxury'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setPreferences({...preferences, budget: level as any})}
                    className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                      preferences.budget === level
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Interests (Select at least 1)</label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS_LIST.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`py-2 px-4 rounded-full text-sm font-medium transition-all border ${
                      preferences.interests.includes(interest)
                        ? 'bg-slate-800 border-slate-800 text-white'
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!preferences.destination || preferences.interests.length === 0}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Itinerary
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 mb-6 text-emerald-500">
        <Loader2 className="w-full h-full animate-spin" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Designing your Trip to {preferences.destination}</h2>
      <p className="text-slate-500 max-w-md animate-pulse">
        Our AI is checking Google Maps for the best routes, hidden gems, and local favorites...
      </p>
      <div className="mt-8 w-64 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 animate-[loading_2s_ease-in-out_infinite]" style={{width: '50%'}}></div>
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );

  const renderError = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-red-50 p-6 rounded-full mb-6">
        <div className="text-red-500 text-4xl">⚠️</div>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h2>
      <p className="text-slate-500 max-w-md mb-8">{errorMsg}</p>
      <button 
        onClick={() => setView('wizard')}
        className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <>
      {view === 'landing' && renderLanding()}
      {view === 'wizard' && renderWizard()}
      {view === 'loading' && renderLoading()}
      {view === 'error' && renderError()}
      {view === 'itinerary' && itinerary && (
        <ItineraryView 
          itinerary={itinerary} 
          preferences={preferences} 
          onBack={handleReset} 
        />
      )}
    </>
  );
};

export default App;
