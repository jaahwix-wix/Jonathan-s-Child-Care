import React, { useState } from 'react';
import {
  HeartHandshake,
  DollarSign,
  Award,
  Sparkles,
  Globe,
  Heart,
  CheckCircle2,
  Loader2,
  Plus,
  Shield,
  Send,
  X,
} from 'lucide-react';
import { Sponsorship } from '../types';

interface SponsorshipPortalProps {
  sponsorships: Sponsorship[];
  onAddSponsorship: (sponsorship: Sponsorship) => void;
}

export const SponsorshipPortal: React.FC<SponsorshipPortalProps> = ({
  sponsorships,
  onAddSponsorship,
}) => {
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'Child Education' | 'Science & Math Lab' | 'JCC FC Women Football' | 'School Meal Program'>('Child Education');

  // AI Grant Writer State
  const [grantTitle, setGrantTitle] = useState('Expansion of STEM Laboratory Microscopes & Solar Power in Bo');
  const [grantAmount, setGrantAmount] = useState(5000);
  const [grantCategory, setGrantCategory] = useState('Science & Math Lab Equipment');
  const [grantDesc, setGrantDesc] = useState('Procuring 12 additional compound microscopes, digital calipers, and solar battery storage for evening science practicals.');
  const [grantOutput, setGrantOutput] = useState('');
  const [isGeneratingGrant, setIsGeneratingGrant] = useState(false);

  // New Sponsor Form State
  const [sponName, setSponName] = useState('');
  const [sponCountry, setSponCountry] = useState('Sierra Leone');
  const [sponAmount, setSponAmount] = useState(250);
  const [sponPeriod, setSponPeriod] = useState<'Monthly' | 'Annual' | 'One-Time'>('Annual');

  const totalFundedUSD = sponsorships.reduce((sum, s) => sum + s.amountUSD, 0);

  const handleGenerateGrantProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingGrant(true);
    setGrantOutput('');

    try {
      const response = await fetch('/api/gemini/grant-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initiativeTitle: grantTitle,
          targetFundingUSD: grantAmount,
          fundingCategory: grantCategory,
          projectDescription: grantDesc,
        }),
      });
      const data = await response.json();
      if (data.result) {
        setGrantOutput(data.result);
      } else {
        setGrantOutput('Failed to generate grant proposal.');
      }
    } catch (err) {
      console.error(err);
      setGrantOutput('Error calling AI service.');
    } finally {
      setIsGeneratingGrant(false);
    }
  };

  const handleCreateSponsorship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponName.trim()) return;

    const newSpon: Sponsorship = {
      id: `SPON-0${sponsorships.length + 1}`,
      sponsorName: sponName,
      country: sponCountry,
      tier: Number(sponAmount) >= 1000 ? 'Gold Champion' : 'Silver Patron',
      category: selectedCategory,
      amountUSD: Number(sponAmount),
      recurringPeriod: sponPeriod,
      impactNote: `Direct sponsorship supporting ${selectedCategory} in Bo District.`,
    };

    onAddSponsorship(newSpon);
    setShowSponsorModal(false);
    setSponName('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 sm:p-8 rounded-2xl border border-emerald-800/60 shadow-2xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold uppercase tracking-wider">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
            Transparent Donor & Impact Hub
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Empower Education & Champion Girls in Bo
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Support 20+ years of educational excellence at Jonathan's Child Care, furnish the Science & Math Lab, or power champion athletes in JCC FC Women Football.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-right bg-slate-900/80 p-3 rounded-xl border border-emerald-800/60">
            <span className="text-[10px] uppercase text-slate-400 font-semibold block">Total Active Grants & Sponsorships</span>
            <span className="text-2xl font-black text-emerald-400">${totalFundedUSD.toLocaleString()} USD</span>
          </div>
          <button
            onClick={() => setShowSponsorModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2"
          >
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            <span>Sponsor a Child or Player</span>
          </button>
        </div>
      </div>

      {/* Active Sponsors Directory */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-400" /> Active Institutional Partners & Donors
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sponsorships.map((spon) => (
            <div
              key={spon.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-emerald-500/50 p-6 transition-all shadow-lg space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    {spon.tier}
                  </span>
                  <span className="text-xs font-bold text-amber-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    ${spon.amountUSD} USD ({spon.recurringPeriod})
                  </span>
                </div>

                <h4 className="font-bold text-white text-base">{spon.sponsorName}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" /> {spon.country} • Focus: <strong className="text-emerald-300">{spon.category}</strong>
                </p>
                <p className="text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 italic leading-relaxed">
                  "{spon.impactNote}"
                </p>
              </div>

              <div className="pt-2 text-[10px] text-slate-500 uppercase tracking-wider flex justify-between items-center border-t border-slate-800">
                <span>Verified Impact Partner</span>
                <span className="text-emerald-400">Status: Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Grant & Sponsorship Proposal Writer */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950/20 to-slate-900 border border-teal-800/50 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Formal Grant & Sponsorship Proposal Generator</h3>
            <p className="text-xs text-slate-300">
              Draft professional grant applications and donor outreach proposals for international organizations & Bo community funds.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerateGrantProposal} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-300 mb-1">Grant Project Title</label>
            <input
              type="text"
              required
              value={grantTitle}
              onChange={(e) => setGrantTitle(e.target.value)}
              placeholder="e.g. Science Lab Equipment Expansion in Bo"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Target Funding ($ USD)</label>
            <input
              type="number"
              required
              value={grantAmount}
              onChange={(e) => setGrantAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Focus Area</label>
            <select
              value={grantCategory}
              onChange={(e) => setGrantCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            >
              <option value="Science & Math Lab Equipment">Science & Math Lab Equipment</option>
              <option value="Girl Child STEM Scholarship">Girl Child STEM Scholarship</option>
              <option value="JCC FC Women Football Travel & Kits">JCC FC Women Football Travel & Kits</option>
              <option value="School Lunch & Nutrition Program">School Lunch & Nutrition Program</option>
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="block font-semibold text-slate-300 mb-1">Project Impact Summary</label>
            <textarea
              rows={2}
              value={grantDesc}
              onChange={(e) => setGrantDesc(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div className="sm:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={isGeneratingGrant}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isGeneratingGrant ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Drafting Grant Proposal...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Draft Proposal Letter</span>
                </>
              )}
            </button>
          </div>
        </form>

        {grantOutput && (
          <div className="p-5 rounded-xl bg-slate-950 border border-teal-800/80 text-xs text-slate-200 space-y-3 font-mono leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
            <div className="flex items-center justify-between text-teal-400 font-semibold font-sans border-b border-slate-800 pb-2">
              <span>📄 Official Grant Application Draft for JCC Bo</span>
              <button
                onClick={() => navigator.clipboard.writeText(grantOutput)}
                className="text-[10px] text-slate-400 hover:text-white underline"
              >
                Copy Proposal
              </button>
            </div>
            {grantOutput}
          </div>
        )}
      </div>

      {/* Sponsor Modal */}
      {showSponsorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400 fill-rose-400" /> Become a JCC Sponsor
              </h3>
              <button onClick={() => setShowSponsorModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSponsorship} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Your Name / Organization</label>
                <input
                  type="text"
                  required
                  value={sponName}
                  onChange={(e) => setSponName(e.target.value)}
                  placeholder="e.g. Sierra Leone Youth Fund"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Sponsorship Focus</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Child Education">Child Education</option>
                    <option value="Science & Math Lab">Science & Math Lab</option>
                    <option value="JCC FC Women Football">JCC FC Women Football</option>
                    <option value="School Meal Program">School Meal Program</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Country</label>
                  <input
                    type="text"
                    value={sponCountry}
                    onChange={(e) => setSponCountry(e.target.value)}
                    placeholder="Sierra Leone / International"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Pledge Amount ($ USD)</label>
                  <input
                    type="number"
                    min={10}
                    value={sponAmount}
                    onChange={(e) => setSponAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Frequency</label>
                  <select
                    value={sponPeriod}
                    onChange={(e) => setSponPeriod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Annual">Annual</option>
                    <option value="One-Time">One-Time</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSponsorModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Confirm Pledge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
