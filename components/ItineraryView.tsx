import React, { useState } from 'react';
import { TripItinerary, UserPreferences } from '../types';
import { MapPin, Clock, DollarSign, Share2, Map, ArrowLeft, Sun, Moon, Coffee, List, Info, ExternalLink, FileText, Users } from './Icons';
import BudgetChart from './BudgetChart';
import TripMap from './TripMap';

interface ItineraryViewProps {
  itinerary: TripItinerary;
  preferences: UserPreferences;
  onBack: () => void;
}

const ItineraryView: React.FC<ItineraryViewProps> = ({ itinerary, preferences, onBack }) => {
  const [activeDay, setActiveDay] = useState(1);
  const [activeTab, setActiveTab] = useState<'timeline' | 'budget' | 'map' | 'report'>('timeline');
  const [highlightedActivityId, setHighlightedActivityId] = useState<string | null>(null);

  const currentDayPlan = itinerary.days.find(d => d.dayNumber === activeDay);

  const getIconForTimeSlot = (slot: string) => {
    switch (slot) {
      case 'Morning': return <Coffee className="w-4 h-4 text-orange-500" />;
      case 'Afternoon': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'Evening': return <Moon className="w-4 h-4 text-indigo-500" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const openGoogleMapsRoute = (day: typeof currentDayPlan) => {
    if (!day || day.activities.length === 0) return;

    const baseUrl = "https://www.google.com/maps/dir/?api=1";
    // Helper to format coordinate or name
    const formatLoc = (act: any) => 
      act.coordinates ? `${act.coordinates.lat},${act.coordinates.lng}` : encodeURIComponent(act.name + ", " + itinerary.destination);

    const origin = formatLoc(day.activities[0]);
    const destination = formatLoc(day.activities[day.activities.length - 1]);
    
    // Intermediate waypoints
    const waypoints = day.activities.slice(1, -1).map(formatLoc).join('|');

    const url = `${baseUrl}&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    <div className="animate-fade-in pb-20">
      {/* Header */}
      <div className="relative h-64 bg-slate-900 text-white overflow-hidden">
        <img 
          src={`https://picsum.photos/seed/${itinerary.destination}/1200/400`} 
          alt={itinerary.destination}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 h-full flex flex-col justify-end pb-8">
          <button 
            onClick={onBack}
            className="absolute top-6 left-6 p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center space-x-2 text-emerald-400 mb-2 text-sm font-medium uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>Trip to {itinerary.destination}</span>
              </div>
              <h1 className="text-4xl font-bold mb-2">{itinerary.summary}</h1>
              <div className="flex items-center text-slate-300 text-sm space-x-4">
                <span>{preferences.duration} Days</span>
                <span>•</span>
                <span>{preferences.travelers} Travelers</span>
                <span>•</span>
                <span>{preferences.budget} Budget</span>
              </div>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-3xl font-bold text-emerald-400">
                {itinerary.currency} {itinerary.totalEstimatedCost}
              </div>
              <div className="text-sm text-slate-400">Est. Total Cost</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
          
          {/* Left Sidebar (Navigation) */}
          <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 flex-shrink-0 flex flex-col">
            <div className="p-4 border-b border-slate-200 font-semibold text-slate-700">
              Trip Overview
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
               {/* View Toggles */}
              <div className="mb-4 space-y-1">
                 <button
                  onClick={() => setActiveTab('map')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center space-x-2 ${
                    activeTab === 'map'
                      ? 'bg-slate-800 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Map className="w-4 h-4" />
                  <span className="font-bold">Interactive Map</span>
                </button>
                <button
                  onClick={() => setActiveTab('report')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center space-x-2 ${
                    activeTab === 'report'
                      ? 'bg-purple-600 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="font-bold">Detailed Report</span>
                </button>
                <button
                  onClick={() => setActiveTab('budget')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center space-x-2 ${
                    activeTab === 'budget'
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span className="font-bold">Budget Breakdown</span>
                </button>
              </div>

              <div className="border-t border-slate-200 my-2 mx-2"></div>
              <div className="px-2 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Daily Itinerary
              </div>

              {itinerary.days.map((day) => (
                <button
                  key={day.dayNumber}
                  onClick={() => { setActiveDay(day.dayNumber); setActiveTab('timeline'); }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                    activeDay === day.dayNumber && activeTab === 'timeline'
                      ? 'bg-emerald-500 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <div className="font-bold flex items-center">
                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-2 text-xs">
                      {day.dayNumber}
                    </span>
                    Day {day.dayNumber}
                  </div>
                  <div className={`truncate text-xs opacity-90 pl-8 ${activeDay === day.dayNumber ? 'text-emerald-50' : 'text-slate-500'}`}>
                    {day.title}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col h-[600px] md:h-[800px]">
            {activeTab === 'map' && (
               <div className="flex-1 relative">
                 <div className="absolute inset-0">
                    <TripMap 
                      itinerary={itinerary} 
                      activeDay={activeDay}
                      highlightedActivityId={highlightedActivityId}
                    />
                 </div>
                 {/* Floating Day Selector on Map */}
                 <div className="absolute top-4 left-4 right-4 z-[400] bg-white/90 backdrop-blur shadow-lg rounded-xl p-2 flex space-x-2 overflow-x-auto">
                    <button 
                      onClick={() => setActiveDay(0)}
                      className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${activeDay === 0 ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      All Days
                    </button>
                    {itinerary.days.map(d => (
                       <button 
                        key={d.dayNumber}
                        onClick={() => setActiveDay(d.dayNumber)}
                        className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${activeDay === d.dayNumber ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        Day {d.dayNumber}
                      </button>
                    ))}
                 </div>
               </div>
            )}

            {activeTab === 'report' && (
              <div className="p-8 overflow-y-auto space-y-8 animate-fade-in bg-slate-50 h-full">
                <div className="mb-6">
                   <h2 className="text-3xl font-bold text-slate-800 mb-2">Detailed Trip Report</h2>
                   <p className="text-slate-500">Everything you need to know before you go.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {itinerary.detailedReport ? (
                    <>
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                         <h3 className="text-lg font-bold text-purple-600 mb-3 flex items-center">
                           <Info className="w-5 h-5 mr-2"/> Why This Fits You
                         </h3>
                         <p className="text-slate-600 text-sm leading-relaxed">{itinerary.detailedReport.whyThisFits}</p>
                      </div>

                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                         <h3 className="text-lg font-bold text-blue-600 mb-3 flex items-center">
                           <MapPin className="w-5 h-5 mr-2"/> Logistics & Safety
                         </h3>
                         <p className="text-slate-600 text-sm leading-relaxed">{itinerary.detailedReport.logistics}</p>
                      </div>

                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                         <h3 className="text-lg font-bold text-emerald-600 mb-3 flex items-center">
                           <List className="w-5 h-5 mr-2"/> Packing Tips
                         </h3>
                         <p className="text-slate-600 text-sm leading-relaxed">{itinerary.detailedReport.packingTips}</p>
                      </div>

                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                         <h3 className="text-lg font-bold text-orange-600 mb-3 flex items-center">
                           <Users className="w-5 h-5 mr-2"/> Local Etiquette
                         </h3>
                         <p className="text-slate-600 text-sm leading-relaxed">{itinerary.detailedReport.localEtiquette}</p>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2 text-center text-slate-400 py-10">
                      Report details are not available for this trip.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'budget' && (
              <div className="p-6 overflow-y-auto space-y-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Trip Expenses</h2>
                  <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                    {preferences.travelers} Travelers
                  </div>
                </div>
                <BudgetChart itinerary={itinerary} travelers={preferences.travelers} />
                <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-2">Money Saving Tips for {itinerary.destination}</h4>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
                    <li>Consider getting a city pass for attractions.</li>
                    <li>Public transport is often cheaper and faster than taxis.</li>
                    <li>Look for lunch specials at high-end restaurants.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="p-6 overflow-y-auto animate-fade-in space-y-8">
                {currentDayPlan && (
                  <>
                    <div className="flex items-start justify-between bg-white sticky top-0 z-20 py-4 border-b border-slate-100">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800">Day {currentDayPlan.dayNumber}: {currentDayPlan.title}</h2>
                        <p className="text-slate-500 mt-1">Explore the best spots clustered for convenience.</p>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openGoogleMapsRoute(currentDayPlan)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all flex items-center text-sm font-medium"
                          title="Open optimized route in Google Maps"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" /> Route on Maps
                        </button>
                      </div>
                    </div>

                    <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pl-8 py-2">
                      {currentDayPlan.activities.map((activity, idx) => (
                        <div 
                          key={idx} 
                          className="relative group cursor-pointer"
                          onMouseEnter={() => setHighlightedActivityId(`${currentDayPlan.dayNumber}-${idx}`)}
                          onMouseLeave={() => setHighlightedActivityId(null)}
                        >
                          {/* Timeline Dot */}
                          <div className={`absolute -left-[41px] top-1 w-6 h-6 rounded-full border-4 transition-all z-10 ${
                            highlightedActivityId === `${currentDayPlan.dayNumber}-${idx}` 
                              ? 'bg-emerald-500 border-emerald-200 scale-125' 
                              : 'bg-white border-emerald-500'
                          }`}></div>
                          
                          <div className={`bg-white p-5 rounded-xl border transition-all ${
                             highlightedActivityId === `${currentDayPlan.dayNumber}-${idx}`
                              ? 'border-emerald-500 shadow-lg translate-x-1'
                              : 'border-slate-200 hover:border-emerald-300 hover:shadow-md'
                          }`}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                                  {getIconForTimeSlot(activity.timeSlot)}
                                  <span className="ml-1.5">{activity.timeSlot}</span>
                                </span>
                                <span className="text-xs text-slate-400">• {activity.duration}</span>
                              </div>
                              {activity.costEstimate && activity.costEstimate > 0 && (
                                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                                  ~{itinerary.currency}{activity.costEstimate}
                                </span>
                              )}
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 mb-1">{activity.name}</h3>
                            <p className="text-slate-600 text-sm mb-3">{activity.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mt-3">
                              {activity.location && (
                                <div className="flex items-center text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {activity.location}
                                </div>
                              )}
                              
                              {activity.googleMapLink && (
                                <a 
                                  href={activity.googleMapLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center text-xs text-emerald-600 hover:text-emerald-700 font-medium bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-100 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Map className="w-3 h-3 mr-1" />
                                  See Location
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryView;