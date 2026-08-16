import React, { useState } from 'react';
import {
  Users,
  Calendar,
  MapPin,
  Instagram,
  Heart,
  MessageCircle,
  Share2,
  Plus,
  ExternalLink,
  CheckCircle2,
  Clock,
  X,
} from 'lucide-react';
import { CommunityEvent, InstagramPost } from '../types';

interface CommunityEventsHubProps {
  events: CommunityEvent[];
  instagramPosts: InstagramPost[];
  onAddEvent: (event: CommunityEvent) => void;
  searchQuery: string;
}

export const CommunityEventsHub: React.FC<CommunityEventsHubProps> = ({
  events,
  instagramPosts,
  onAddEvent,
  searchQuery,
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'instagram'>('events');
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // New Event State
  const [evtTitle, setEvtTitle] = useState('');
  const [evtCategory, setEvtCategory] = useState<'Educational Panel' | 'Community Development' | 'Child Health Screening' | 'Sports Summit'>('Educational Panel');
  const [evtDate, setEvtDate] = useState('2026-09-01');
  const [evtLocation, setEvtLocation] = useState('JCC Main Academic Hall, Bo');
  const [evtDesc, setEvtDesc] = useState('');

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredEvents = events.filter((e) => {
    return (
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle.trim()) return;
    const newEvt: CommunityEvent = {
      id: `EVT-${10 + events.length + 1}`,
      title: evtTitle,
      category: evtCategory,
      date: evtDate,
      time: '10:00 AM - 01:00 PM',
      location: evtLocation,
      description: evtDesc || 'Community engagement event supporting education and youth in Bo District.',
      organizer: 'Jonathan’s Child Care',
      attendeesCount: 120,
      status: 'Upcoming',
    };
    onAddEvent(newEvt);
    setShowAddEventModal(false);
    setEvtTitle('');
    setEvtDesc('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs uppercase tracking-wider">
            <Users className="w-4 h-4" />
            Bo District Civic Engagement
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Community Panels & Social Feed</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Hosting educational panels, local development summits, and sharing real-time updates on the Jonathan's Child Care Instagram page.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'events' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Community Events ({events.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('instagram')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'instagram' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Instagram className="w-4 h-4" />
            <span>Instagram Feed</span>
          </button>
        </div>
      </div>

      {activeTab === 'events' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" /> Educational Panels & Summits in Bo
            </h3>
            <button
              onClick={() => setShowAddEventModal(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Host New Event</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-purple-500/50 p-6 transition-all shadow-lg space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      {evt.category}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        evt.status === 'Upcoming'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-base leading-snug">{evt.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{evt.description}</p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800 text-xs text-slate-400">
                  <p className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-purple-400" /> {evt.date} ({evt.time})
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" /> {evt.location}
                  </p>
                  <div className="flex justify-between items-center pt-2 text-[11px] font-medium text-slate-300">
                    <span>Organizer: {evt.organizer}</span>
                    <span className="text-purple-300 font-bold">{evt.attendeesCount} Registered</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Instagram Feed View */
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-slate-900 border border-pink-800/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-pink-600/20 text-pink-400 border border-pink-500/30">
                <Instagram className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Jonathan's Child Care Instagram Page</h3>
                <p className="text-xs text-slate-300">
                  Bo District campus stories, science lab moments & JCC FC championship wins!
                </p>
              </div>
            </div>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Follow @JCCBoDistrict</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instagramPosts.map((post) => {
              const isLiked = likedPosts[post.id];
              return (
                <div
                  key={post.id}
                  className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-4 flex flex-col justify-between"
                >
                  {/* Post Header */}
                  <div className="p-4 flex items-center justify-between border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-0.5">
                        <div className="w-full h-full bg-slate-900 rounded-full p-0.5">
                          <Users className="w-full h-full text-pink-400 p-1" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs">jonathanschildcare_bo</h4>
                        <p className="text-[10px] text-slate-400">{post.location}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">{post.postDate}</span>
                  </div>

                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={post.imageUrl}
                      alt="Instagram update"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Caption & Actions */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-slate-300">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleLike(post.id)}
                          className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                            isLiked ? 'text-rose-500' : 'text-slate-300 hover:text-rose-400'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500' : ''}`} />
                          <span>{post.likesCount + (isLiked ? 1 : 0)}</span>
                        </button>
                        <span className="flex items-center gap-1.5 text-xs text-slate-300">
                          <MessageCircle className="w-5 h-5 text-slate-400" />
                          <span>{post.commentsCount}</span>
                        </span>
                      </div>
                      <button className="text-slate-400 hover:text-white">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed">{post.caption}</p>

                    <div className="flex flex-wrap gap-1 pt-2">
                      {post.tags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] text-pink-400 font-semibold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" /> Create Bo Community Event
              </h3>
              <button onClick={() => setShowAddEventModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={evtTitle}
                  onChange={(e) => setEvtTitle(e.target.value)}
                  placeholder="e.g. Bo STEM Girl Child Mentorship"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={evtCategory}
                    onChange={(e) => setEvtCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Educational Panel">Educational Panel</option>
                    <option value="Community Development">Community Development</option>
                    <option value="Child Health Screening">Child Health Screening</option>
                    <option value="Sports Summit">Sports Summit</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={evtDate}
                    onChange={(e) => setEvtDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Venue / Location</label>
                <input
                  type="text"
                  value={evtLocation}
                  onChange={(e) => setEvtLocation(e.target.value)}
                  placeholder="JCC Main Campus Hall, Bo"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={evtDesc}
                  onChange={(e) => setEvtDesc(e.target.value)}
                  placeholder="Goals and target community impact in Bo..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
