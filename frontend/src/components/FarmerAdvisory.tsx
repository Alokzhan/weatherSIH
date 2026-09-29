import React, { useState } from 'react';
import { 
  Sprout, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Droplets, 
  ShieldAlert, 
  Languages 
} from 'lucide-react';

interface FarmerAdvisoryProps {
  lang: 'en' | 'hi' | 'hinglish';
  setLang: (lang: 'en' | 'hi' | 'hinglish') => void;
}

export const FarmerAdvisory: React.FC<FarmerAdvisoryProps> = ({ lang, setLang }) => {
  const [selectedVillage, setSelectedVillage] = useState<string>('Phulpur');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [liveData, setLiveData] = useState<{ rain: string; prob: string; loading: boolean }>({
    rain: 'Loading...',
    prob: 'Loading...',
    loading: true
  });

  // Coordinates for live data fetching
  const villageCoords: Record<string, { lat: number; lon: number }> = {
    'Chinour': { lat: 27.88, lon: 79.91 },
    'Phulpur': { lat: 25.55, lon: 82.08 },
    'Handia': { lat: 25.37, lon: 82.18 },
    'Naini': { lat: 25.39, lon: 81.85 },
    'Karchhana': { lat: 25.29, lon: 81.93 },
    'Soraon': { lat: 25.61, lon: 81.85 },
    'Bara': { lat: 25.21, lon: 81.71 },
  };

  React.useEffect(() => {
    const coords = villageCoords[selectedVillage] || villageCoords['Phulpur'];
    setLiveData(prev => ({ ...prev, loading: true }));
    
    // Fetch live weather data using Open-Meteo API
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=precipitation_sum,precipitation_probability_max&timezone=Asia/Kolkata&forecast_days=1`)
      .then(res => res.json())
      .then(data => {
        const rainRaw = data?.daily?.precipitation_sum?.[0];
        const probRaw = data?.daily?.precipitation_probability_max?.[0];
        
        setLiveData({
          rain: rainRaw !== undefined ? `${rainRaw} mm` : 'No Data',
          prob: probRaw !== undefined ? `${probRaw}%` : 'N/A',
          loading: false
        });
      })
      .catch(err => {
        console.error("Failed to fetch live weather", err);
        setLiveData({
          rain: 'Offline',
          prob: 'Offline',
          loading: false
        });
      });
  }, [selectedVillage]);

  const advisoryText = {
    en: {
      title: 'Kisan Weather Bandhu - Crop & Rain Intelligence',
      villageLabel: 'Select Village / Tehsil:',
      riskBadge: 'HIGH WATERLOGGING RISK (Paddy & Sugarcane)',
      rain24h: '142.5 mm Heavy Rainfall Expected',
      prob: '94% Probability of Exceedance',
      audioBtn: isPlayingAudio ? 'Pause Voice Advisory' : 'Listen Voice Advisory (Hindi/Audio)',
      cropTitle: 'Crop-Specific Protection Directives:',
      crops: [
        { name: 'Paddy (Dhan)', tip: 'Immediately open field drainage outlets to drain excess rainwater. Avoid submerged roots for >48h.' },
        { name: 'Sugarcane (Ganna)', tip: 'Tie tall cane stems together in groups to prevent lodging under gusty monsoon winds.' },
        { name: 'Pulses & Mustard (Dal & Sarson)', tip: 'Postpone sowing or harvesting. Move cut produce to elevated covered sheds.' },
        { name: 'Vegetables (Subzi)', tip: 'Spray anti-fungal copper oxychloride only after rain subsides.' },
      ],
      safetyTitle: 'Field Worker Safety Guidance:',
      safetyTips: [
        'Do not stay under tall trees or metal tube-well sheds during thunder & lightning.',
        'Keep livestock in elevated, dry cattle sheds with clear drainage.',
        'Keep emergency helpline numbers saved (1077 Disaster Emergency Cell).',
      ]
    },
    hi: {
      title: 'किसान मौसम बंधु - फसल एवं वर्षा सुरक्षा सलाह',
      villageLabel: 'अपना गाँव / तहसील चुनें:',
      riskBadge: 'धान एवं गन्ना फसल हेतु अत्यधिक जलभराव का खतरा',
      rain24h: '142.5 मिमी भारी वर्षा का अनुमान',
      prob: '94% संभावना (प्रयागराज/फूलपुर क्षेत्र)',
      audioBtn: isPlayingAudio ? 'ऑडियो बंद करें' : 'हिन्दी आवाज़ में सलाह सुनें (ऑडियो)',
      cropTitle: 'फसल-वार सुरक्षा निर्देश:',
      crops: [
        { name: 'धान की फसल', tip: 'खेत की मेड़ काट कर पानी निकासी के रास्ते तुरंत खोलें। 48 घंटे से अधिक जलभराव से जड़ें सड़ सकती हैं।' },
        { name: 'गन्ना की फसल', tip: 'तेज़ हवाओं से फसल को गिरने से बचाने के लिए 4-5 पौधों की पत्तियों को आपस में बाँध दें।' },
        { name: 'दलहन एवं सरसों', tip: 'कटाई व बुवाई रोक दें। काटी गई फसल को ऊँचे पक्के शेड में ढँक कर रखें।' },
        { name: 'सब्ज़ियों की खेती', tip: 'बारिश रुकने के बाद ही फफूंदनाशक दवा का छिड़काव करें।' },
      ],
      safetyTitle: 'किसान भाईयों के लिए सुरक्षा नियम:',
      safetyTips: [
        'आकाशीय बिजली व गरज के दौरान खेत में बड़े पेड़ या लोहे के ट्यूबवेल शेड के नीचे शरण न लें।',
        'पशुओं को जलभराव वाले स्थान से हटाकर ऊँचे सूखे पशुछप्पर में बाँधें।',
        'आपातकालीन हेल्पलाइन 1077 डायल करें।',
      ]
    },
    hinglish: {
      title: 'Kisan Weather Bandhu - Crop Safety & Baarish Alert',
      villageLabel: 'Select Village / Tehsil:',
      riskBadge: 'HIGH BAARISH & WATERLOGGING ALERT',
      rain24h: '142.5 mm Bhaari Baarish Expect Hogi',
      prob: '94% Pakka Chance (Phulpur & Naini Belt)',
      audioBtn: isPlayingAudio ? 'Audio Stop Karo' : 'Suno Hindi Bolkar Advisory (Voice Player)',
      cropTitle: 'Crop-Wise Advisory Guidelines:',
      crops: [
        { name: 'Dhan (Paddy)', tip: 'Khet ki naali khol kar paani turant nikalne ka rasta banayein. 48 ghante se jyada paani mat rukne de.' },
        { name: 'Ganna (Sugarcane)', tip: 'Tez hawa se bacche ke liye 4-5 ganne ko aapas me baandh de.' },
        { name: 'Dal & Sarson', tip: 'Bowaai aur kataai abhi rok de. Katai ki gayi fasal ko sukhi jagah par tarpal se dhak de.' },
        { name: 'Subzi Kheti', tip: 'Baarish rukne ke baad hi dawai ka chirkav karein.' },
      ],
      safetyTitle: 'Kisan Safety Tips:',
      safetyTips: [
        'Bijli kadakne par ped ke niche mat khade ho.',
        'Gaaye aur bhains ko unchi sookhi jagah par baandho.',
        'Helpline Number: 1077 par call karein.',
      ]
    }
  };

  const currentText = advisoryText[lang];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-emerald-500/40 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">FR-07 FARMER ADVISORY PORTAL</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                KISAN FRIENDLY
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
              <Sprout className="h-7 w-7 text-emerald-400" />
              {currentText.title}
            </h2>
            <p className="text-xs text-slate-300">
              {currentText.riskBadge}
            </p>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 p-1 rounded-xl text-xs">
            <Languages className="h-4 w-4 text-emerald-400 ml-2" />
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                lang === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                lang === 'hi' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLang('hinglish')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                lang === 'hinglish' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hinglish
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Village Selector & Voice Player */}
        <div className="lg:col-span-8 space-y-6">
          {/* Village Risk Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 block font-semibold">{currentText.villageLabel}</span>
                <select
                  value={selectedVillage}
                  onChange={(e) => setSelectedVillage(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-100 font-bold text-base px-3 py-1.5 rounded-xl mt-1 focus:outline-none cursor-pointer"
                >
                  <option value="Chinour">Chinour, Shahjahanpur (चिनौर, शाहजहाँपुर)</option>
                  <option value="Phulpur">Phulpur (फूलपुर)</option>
                  <option value="Handia">Handia (हंडिया)</option>
                  <option value="Naini">Naini (नैनी)</option>
                  <option value="Karchhana">Karchhana (करछना)</option>
                  <option value="Soraon">Soraon (सोरांव)</option>
                  <option value="Bara">Bara (बारा)</option>
                </select>
              </div>

              {/* Audio Voice Player Button */}
              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-lg ${
                  isPlayingAudio
                    ? 'bg-amber-600 text-slate-950 animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isPlayingAudio ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                <span>{currentText.audioBtn}</span>
              </button>
            </div>

            {/* Simulated Audio Playing Bar */}
            {isPlayingAudio && (
              <div className="bg-amber-950/60 border border-amber-800 p-3 rounded-xl flex items-center gap-3 text-amber-300 text-xs">
                <Volume2 className="h-4 w-4 animate-bounce shrink-0" />
                <span className="font-mono">
                  [🔊 PLAYING AUDIO ADVISORY IN HINDI]: &quot;किसान भाइयों, फूलपुर क्षेत्र में अगले 24 घंटे में 142 मिमी भारी बारिश का अनुमान है...&quot;
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-xs">Expected Rain (24h)</span>
                <span className="text-xl font-bold text-red-400 font-mono">
                  {liveData.loading ? '...' : liveData.rain} {liveData.loading ? '' : '(Live)'}
                </span>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-xs">Rain Probability</span>
                <span className="text-xl font-bold text-cyan-300 font-mono">
                  {liveData.loading ? '...' : liveData.prob} {liveData.loading ? '' : '(Live)'}
                </span>
              </div>
            </div>
          </div>

          {/* Crop-Specific Protection Cards */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Droplets className="h-5 w-5 text-cyan-400" />
              {currentText.cropTitle}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentText.crops.map((crop, i) => (
                <div key={i} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{crop.name}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {crop.tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Kisan Safety Directives */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-amber-500/40 space-y-4">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <ShieldAlert className="h-4 w-4" />
              {currentText.safetyTitle}
            </h3>

            <div className="space-y-3 text-xs">
              {currentText.safetyTips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-slate-300">
                  <span className="font-bold text-amber-400 shrink-0">•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
