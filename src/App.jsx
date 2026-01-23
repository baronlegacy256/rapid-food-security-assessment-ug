import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { ChevronRight, ChevronLeft, Save, CheckCircle2, Circle, User, LogOut, Settings, Bell, ChevronDown, Loader2, LayoutGrid, ClipboardList, Menu, X, Home, Users } from 'lucide-react';
import IntroSection from './components/IntroSection';
import CropSection from './components/CropSection';
import LivestockSection from './components/LivestockSection';
import FisheriesSection from './components/FisheriesSection';
import MarketsSection from './components/MarketsSection';
import ReviewSection from './components/ReviewSection';
import Auth from './components/Auth';
import TeamManager from './components/TeamManager';
import Profile from './components/Profile';
import faoLogo from './assets/fao-logo.svg';
import wfpLogo from './assets/wfp-logo.png';
import worldBankLogo from './assets/world-bank-logo.png';
import coatOfArms from './assets/uganda-coat-of-arms.png';
import { useToast } from './components/ToastProvider.jsx';

const FoodSecurityAssessment = () => {
  const { success, error } = useToast();
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [currentView, setCurrentView] = useState('assessment'); // 'assessment', 'team', 'profile'

  // Collaboration State
  const [activeAssessmentId, setActiveAssessmentId] = useState(null);
  const [userRole, setUserRole] = useState('owner');
  const [notifications, setNotifications] = useState([]);
  const [pendingInvite, setPendingInvite] = useState(null);

  const [currentSection, setCurrentSection] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);
  const isCreatingAssessmentRef = useRef(false);

  const [formData, setFormData] = useState({
    statisticalRegion: '',
    district: '',
    subCounty: '',
    officialName: '',
    officialTitle: '',
    normalYearEvents: {}, lastSeasonEvents: {}, normalYearLevels: {}, currentYearLevels: {},
    cropPerformance: {}, landSizeByHousehold: {}, cropYields: {}, cropUtilization: {},
    foodStocks: {}, stapleAvailability: {}, mealsPerDay: {}, poorPerformanceReasons: {},
    subCountyRanking: {}, affectedParishes: {}, foodSecurityRanking: {},
    productionConstraints: {}, diseaseOutbreaks: {}, copingStrategies: {},
    livestockConditions: {}, livestockNumbers: {}, livestockMigration: {},
    livestockMarket: {}, livestockDiseases: {}, livestockInterventions: {},
    drugAvailability: '', milkProduction: {}, waterSources: {},
    fishingHouseholds: '', fishingActivityChange: {}, waterBodies: '',
    fishCatch: {}, fishUtilization: {}, fishPonds: {}, stockedPonds: '',
    fishSpecies: {}, aquacultureHarvest: {}, fishingChallenges: '',
    marketAssessments: {}
  });

  const allSections = [
    { id: 'intro', title: 'Introduction', icon: '📋' },
    { id: 'crop', title: 'Crop Production', icon: '🌾' },
    { id: 'livestock', title: 'Livestock', icon: '🐄' },
    { id: 'fisheries', title: 'Fisheries', icon: '🐟' },
    { id: 'markets', title: 'Markets & Trade', icon: '🏪' },
    { id: 'review', title: 'Review & Submit', icon: '✓' }
  ];

  const sectionFields = {
    intro: ['statisticalRegion', 'district', 'subCounty', 'officialName', 'officialTitle'],
    crop: ['normalYearEvents', 'lastSeasonEvents', 'normalYearLevels', 'currentYearLevels', 'cropPerformance', 'landSizeByHousehold', 'cropYields', 'cropUtilization', 'foodStocks', 'stapleAvailability', 'mealsPerDay', 'poorPerformanceReasons', 'subCountyRanking', 'affectedParishes', 'foodSecurityRanking', 'productionConstraints', 'diseaseOutbreaks', 'copingStrategies'],
    livestock: ['livestockConditions', 'livestockNumbers', 'livestockMigration', 'livestockMarket', 'livestockDiseases', 'livestockInterventions', 'drugAvailability', 'milkProduction', 'waterSources'],
    fisheries: ['fishingHouseholds', 'fishingActivityChange', 'waterBodies', 'fishCatch', 'fishUtilization', 'fishPonds', 'stockedPonds', 'fishSpecies', 'aquacultureHarvest', 'fishingChallenges'],
    markets: ['marketAssessments']
  };

  const calculateSectionProgress = (sectionId) => {
    if (!sectionId || !sectionFields[sectionId]) return 0;
    const fields = sectionFields[sectionId];
    let filledCount = 0;

    fields.forEach(field => {
      const value = formData[field];
      if (value && typeof value === 'object') {
        // For objects/sets, check if they have any non-empty values
        if (Object.values(value).some(v => v !== '' && v !== null && v !== false)) {
          filledCount++;
        }
      } else if (value && value !== '') {
        filledCount++;
      }
    });

    return Math.round((filledCount / fields.length) * 100);
  };

  const sections = userRole === 'owner'
    ? allSections
    : allSections.filter(s => s.id === userRole);

  useEffect(() => {
    const validateSession = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        if (authError?.message?.includes('User not found') || authError?.status === 401) {
          await supabase.auth.signOut();
          setSession(null);
        }
        setLoadingSession(false);
        return;
      }

      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      if (currentSession) checkUserPermissions(currentSession.user.id, currentSession.user.email);
      setLoadingSession(false);
    };

    validateSession();

    // Remove automated onAuthStateChange trigger for permissions since we handle it in validateSession 
    // and manual sign-ins/refreshes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkUserPermissions = async (userId, email) => {
    // 1. Always check for pending invites regardless of other roles
    const { data: allInvites } = await supabase
      .from('assessment_collaborators')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    const pending = allInvites?.find(i => i.status === 'pending');
    if (pending) {
      setPendingInvite(pending);
    }

    // 2. Check if the user is the owner of any assessment
    const { data: ownAssessment } = await supabase
      .from('assessments')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (ownAssessment) {
      setUserRole('owner');
      setActiveAssessmentId(ownAssessment.id);
      loadAssessmentData(ownAssessment.id);
    } else {
      // 3. If not an owner, check if they have an accepted collaboration
      // We pick the most recent one due to the sort order above
      const accepted = allInvites?.find(i => i.status === 'accepted');

      if (accepted) {
        setUserRole(accepted.role);
        setActiveAssessmentId(accepted.assessment_id);
        loadAssessmentData(accepted.assessment_id);
      } else if (pending) {
        setUserRole('pending');
      } else {
        setUserRole('owner');
        createOrGetDraftAssessment(userId);
      }
    }

    const { data: notes } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_email', email)
      .eq('is_read', false)
      .order('created_at', { ascending: false });
    if (notes) setNotifications(notes);
  };

  const markAllAsRead = async () => {
    if (!session || notifications.length === 0) return;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_email', session.user.email);

    if (!error) setNotifications([]);
  };

  const acceptInvite = async () => {
    try {
      const { error } = await supabase.from('assessment_collaborators')
        .update({ status: 'accepted' })
        .eq('id', pendingInvite.id);
      if (error) throw error;
      success('Invite accepted! Redirecting to your section...');
      window.location.reload();
    } catch (err) {
      error(`Error accepting invite: ${err.message}`);
    }
  };

  const createOrGetDraftAssessment = async (userId) => {
    if (isCreatingAssessmentRef.current || activeAssessmentId) return;
    isCreatingAssessmentRef.current = true;

    try {
      const { data } = await supabase
        .from('assessments')
        .select('id, submission_data')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setActiveAssessmentId(data.id);
        if (data.submission_data) setFormData(prev => ({ ...prev, ...data.submission_data }));
      } else {
        const { data: newAssessment } = await supabase
          .from('assessments')
          .insert([{ user_id: userId, submission_data: {} }])
          .select()
          .single();
        if (newAssessment) setActiveAssessmentId(newAssessment.id);
      }
    } finally {
      isCreatingAssessmentRef.current = false;
    }
  }

  const loadAssessmentData = async (id) => {
    const { data } = await supabase.from('assessments').select('submission_data').eq('id', id).single();
    if (data && data.submission_data) {
      setFormData(prev => ({ ...prev, ...data.submission_data }));
    }
  }

  const updateFormData = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (activeAssessmentId) {
        supabase.from('assessments').update({ submission_data: newData }).eq('id', activeAssessmentId).then();
      }
      return newData;
    });
  };

  const nextSection = () => {
    if (currentSection < sections.length - 1) setCurrentSection(currentSection + 1);
  };

  const prevSection = () => {
    if (currentSection > 0) setCurrentSection(currentSection - 1);
  };

  const submitAssessment = async () => {
    if (!session) return;

    // 1. Check completion for all assigned sections
    const incompleteSections = sections
      .filter(s => s.id !== 'review' && sectionFields[s.id])
      .filter(s => calculateSectionProgress(s.id) < 100);

    // Only owners are blocked by the 100% completion rule
    if (userRole === 'owner' && incompleteSections.length > 0) {
      error(`Cannot submit: The following sections are incomplete: ${incompleteSections.map(s => s.title).join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Explicitly save the final state to the database
      const { error: submitError } = await supabase
        .from('assessments')
        .update({
          submission_data: { ...formData, submittedAt: new Date().toISOString() }
        })
        .eq('id', activeAssessmentId);

      if (submitError) throw submitError;

      if (userRole !== 'owner') {
        success('Section submitted! The District Officer has been notified.');
      } else {
        success('Assessment finalized and saved to database!');
      }
    } catch (err) {
      console.error("Submission Error", err);
      error(`Submission error: ${err.message ?? err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session) return <Auth />;



  const renderView = () => {
    switch (currentView) {
      case 'profile':
        return <Profile session={session} userRole={userRole} allSections={allSections} />;
      case 'team':
        return (
          <div className="max-w-4xl mx-auto">
            <TeamManager
              assessmentId={activeAssessmentId}
              currentUserEmail={session.user.email}
              district={formData.district}
              region={formData.statisticalRegion}
            />
          </div>
        );
      case 'assessment':
      default:
        if (sections.length === 0) {
          return (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-600">
              Accept the invite to access your assigned section.
            </div>
          );
        }

        const sectionId = sections[currentSection]?.id;
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {sectionId === 'intro' && <IntroSection formData={formData} updateFormData={updateFormData} />}
            {sectionId === 'crop' && <CropSection formData={formData} updateFormData={updateFormData} />}
            {sectionId === 'livestock' && <LivestockSection formData={formData} updateFormData={updateFormData} />}
            {sectionId === 'fisheries' && <FisheriesSection formData={formData} updateFormData={updateFormData} />}
            {sectionId === 'markets' && <MarketsSection formData={formData} updateFormData={updateFormData} />}
            {sectionId === 'review' && <ReviewSection formData={formData} sections={allSections} />}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentView('assessment')}>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md overflow-hidden p-1 bg-white border border-gray-100">
                  <img src={coatOfArms} alt="Uganda Coat of Arms" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-sm md:text-lg font-bold text-gray-900 leading-tight">Food Security</h1>
                  <p className="text-[8px] md:text-[10px] text-blue-600 font-bold uppercase tracking-widest">MAAIF UG</p>
                </div>
              </div>
            </div>



            <div className="flex items-center gap-3">
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    setIsUserMenuOpen(false);
                  }}
                  className={`p-2 rounded-full transition-all relative ${isNotificationsOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 md:right-0 mt-2 w-[calc(100vw-32px)] md:w-80 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 -mr-[80px] md:mr-0">
                    <div className="px-4 py-2 border-b border-gray-50 flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900">Notifications</h4>
                      {notifications.length > 0 && (
                        <button onClick={markAllAsRead} className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-wider">Mark all as read</button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-400">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          <p className="text-sm">No new notifications</p>
                        </div>
                      ) : (
                        notifications.map((note) => (
                          <div key={note.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">
                            <p className="text-sm text-gray-700 leading-tight">{note.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{new Date(note.created_at).toLocaleDateString()} at {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden md:block relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full hover:shadow-md transition-all active:scale-95"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {session.user.email?.substring(0, 2)}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">{userRole === 'owner' ? 'District Officer' : 'Section Officer'}</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{session.user.email}</p>
                    </div>
                    <button onClick={() => { setCurrentView('profile'); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors">
                      <User className="w-4 h-4" /> My Profile
                    </button>
                    {userRole === 'owner' && (
                      <button onClick={() => { setCurrentView('team'); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors">
                        <Settings className="w-4 h-4" /> Manage Team
                      </button>
                    )}
                    <button onClick={() => { setCurrentView('assessment'); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors">
                      <ClipboardList className="w-4 h-4" /> Assessment Form
                    </button>
                    <div className="h-px bg-gray-50 my-1"></div>
                    <button onClick={() => supabase.auth.signOut()} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Side Drawer */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-[280px] bg-white z-[70] shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm">
                  <img src={coatOfArms} alt="Logo" className="w-full h-full object-contain p-1" />
                </div>
                <span className="font-bold text-gray-900">Form Navigation</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-80px)]">
              <p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assessment Sections</p>
              {sections.map((section, idx) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setCurrentSection(idx);
                    setCurrentView('assessment');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm transition-all ${currentSection === idx && currentView === 'assessment'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <span className="text-lg">{section.icon}</span>
                  {section.title}
                  {currentSection > idx && <CheckCircle2 className="w-4 h-4 ml-auto text-green-500" />}
                </button>
              ))}

              <div className="pt-6">
                <p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account & Settings</p>
                <button
                  onClick={() => { setCurrentView('profile'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm transition-all ${currentView === 'profile' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <User className="w-5 h-5" /> My Profile
                </button>
                {userRole === 'owner' && (
                  <button
                    onClick={() => { setCurrentView('team'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm transition-all ${currentView === 'team' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Users className="w-5 h-5" /> Team Management
                  </button>
                )}
                <div className="h-px bg-gray-100 my-2 mx-3"></div>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-6 py-3 flex items-center justify-between z-[50] pb-safe">
        <button
          onClick={() => setCurrentView('assessment')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'assessment' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        {userRole === 'owner' && (
          <button
            onClick={() => setCurrentView('team')}
            className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'team' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-bold">Team</span>
          </button>
        )}
        <button
          onClick={() => { setIsNotificationsOpen(true); setIsMobileMenuOpen(false); }}
          className={`flex flex-col items-center gap-1 transition-colors relative ${isNotificationsOpen ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <Bell className="w-6 h-6" />
          {notifications.length > 0 && <span className="absolute top-0 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
          <span className="text-[10px] font-bold">Alerts</span>
        </button>
        <button
          onClick={() => setCurrentView('profile')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'profile' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] border-2 ${currentView === 'profile' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-400 border-gray-100'}`}>
            {session.user.email?.substring(0, 1).toUpperCase()}
          </div>
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 pb-32 md:pb-8">
        {pendingInvite && (
          <div className="mb-8 p-6 bg-blue-600 rounded-2xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-5">
              <div className="bg-white/20 p-4 rounded-xl backdrop-blur-md">
                <Bell className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">New Collaboration Invite</h3>
                <p className="text-blue-100 opacity-90">Assigning you as the <span className="font-bold underline uppercase">{pendingInvite.role} Officer</span></p>
              </div>
            </div>
            <div className="relative z-10 flex gap-3">
              <button className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all">Decline</button>
              <button onClick={acceptInvite} className="px-8 py-2.5 bg-white text-blue-600 rounded-lg font-bold shadow-lg hover:bg-gray-50 active:scale-95 transition-all">Accept Invite</button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          </div>
        )}

        {currentView === 'assessment' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-widest">
                <LayoutGrid className="w-4 h-4" />
                {userRole === 'owner' ? (
                  <span>Section {currentSection + 1} of {sections.length}</span>
                ) : (
                  <span>Assigned Section: {sections[currentSection]?.title}</span>
                )}
              </div>
              <div className="text-sm font-bold text-gray-500">
                {userRole === 'owner'
                  ? `${Math.round(((currentSection + 1) / sections.length) * 100)}% OVERALL`
                  : `${calculateSectionProgress(sections[currentSection]?.id)}% SECTION COMPLETE`
                }
              </div>
            </div>
            <div className="w-full bg-gray-200/50 rounded-full h-3 backdrop-blur-sm overflow-hidden border border-gray-100">
              <div
                className="bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${userRole === 'owner'
                    ? ((currentSection + 1) / sections.length) * 100
                    : calculateSectionProgress(sections[currentSection]?.id)}%`
                }}
              />
            </div>

            <div className="flex gap-2 mt-6 overflow-x-auto pt-4 pb-4 scrollbar-hide no-scrollbar">
              {sections.map((section, idx) => (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(idx)}
                  className={`flex items-center gap-3 px-5 py-2.5 rounded-xl whitespace-nowrap transition-all duration-300 font-bold text-sm ${currentSection === idx
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 -translate-y-1'
                    : currentSection > idx
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                    }`}
                >
                  {currentSection > idx ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4 opacity-50" />}
                  {section.icon} {section.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {renderView()}

        {currentView === 'assessment' && (
          <div className="flex justify-between mt-8 gap-4">
            <button onClick={prevSection} disabled={currentSection === 0} className="group flex items-center gap-3 px-8 py-3.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition-all font-bold text-gray-700 shadow-sm hover:shadow-md">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Previous
            </button>

            {currentSection < sections.length - 1 ? (
              <button onClick={nextSection} className="group flex items-center gap-3 px-8 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-xl shadow-blue-200 active:scale-95">
                Next
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button onClick={submitAssessment} disabled={isSubmitting} className="flex items-center gap-3 px-10 py-3.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold shadow-xl shadow-green-200 active:scale-95 disabled:opacity-50">
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> {userRole === 'owner' ? 'Submitting...' : 'Saving...'}</>
                ) : (
                  <><Save className="w-5 h-5" /> {userRole === 'owner' ? 'Submit Assessment' : 'Save Changes'}</>
                )}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default FoodSecurityAssessment;