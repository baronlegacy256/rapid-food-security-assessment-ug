import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { ChevronRight, ChevronLeft, Save, CheckCircle2, Circle, User, LogOut, Settings, Bell, ChevronDown, Loader2, LayoutGrid, ClipboardList, Menu, X, Home, Users, Database, Cloud, HardDrive, AlertCircle } from 'lucide-react';
import IntroSection from './components/IntroSection';
import CropSection from './components/CropSection';
import LivestockSection from './components/LivestockSection';
import FisheriesSection from './components/FisheriesSection';
import MarketsSection from './components/MarketsSection';
import ReviewSection from './components/ReviewSection';
import Auth from './components/Auth';
import TeamManager from './components/TeamManager';
import Profile from './components/Profile';
import AdminPanel from './pages/AdminPanel';
import coatOfArms from './assets/uganda-coat-of-arms.png';
import { ugandaDistricts } from './data/districts';
import { useToast } from './components/ToastProvider.jsx';
import { getCurrentReportingPeriod, REPORTING_CONFIG, formatReportingPeriod } from './utils/reportingPeriods';

// ============================================
// MAIN COMPONENT
// ============================================
const FoodSecurityAssessment = () => {
  const { success, error } = useToast();
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [currentView, setCurrentView] = useState('assessment');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);

  // Save Status Tracking
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving' | 'saved' | 'error' | 'syncing'
  const [lastSaved, setLastSaved] = useState(null);

  const SYSTEM_ADMIN_EMAILS = [
    'admin@foodsecurity.ug',
    'system.admin@kobbo.co',
    'aaronbaraka292@gmail.com',
    ...(import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean)
  ];

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin' || path.startsWith('/admin/')) {
      setIsAdminMode(true);
    }
  }, []);

  const enterAdminMode = () => {
    setIsAdminMode(true);
    window.history.pushState({}, '', '/admin');
  };

  const exitAdminMode = () => {
    setIsAdminMode(false);
    window.history.pushState({}, '', '/');
    setCurrentView('assessment');
  };

  const [reportingInfo, setReportingInfo] = useState(() =>
    getCurrentReportingPeriod(REPORTING_CONFIG.defaultFrequency)
  );

  const [activeAssessmentId, setActiveAssessmentId] = useState(null);
  const [userRole, setUserRole] = useState('owner');
  const [notifications, setNotifications] = useState([]);
  const [pendingInvite, setPendingInvite] = useState(null);
  const [linkStatus, setLinkStatus] = useState(null);
  const [linkError, setLinkError] = useState('');

  const [currentSection, setCurrentSection] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);
  const isCreatingAssessmentRef = useRef(false);
  const lastCloudSyncRef = useRef(0);

  const urlToken = new URLSearchParams(window.location.search).get('token');
  if (urlToken) {
    sessionStorage.setItem('district_link_token', urlToken);
  }

  const [linkedDistrict, setLinkedDistrict] = useState(null);

  const [formData, setFormData] = useState({
    statisticalRegion: '',
    district: '',
    subCounty: '',
    officialName: '',
    officialTitle: '',
    normalYearEvents: {},
    lastSeasonEvents: {},
    normalYearLevels: {},
    currentYearLevels: {},
    cropPerformance: {},
    landSizeByHousehold: {},
    cropYields: {},
    cropUtilization: {},
    foodStocks: {},
    stapleAvailability: {},
    mealsPerDay: {},
    poorPerformanceReasons: {},
    subCountyRanking: {},
    affectedParishes: {},
    foodSecurityRanking: {},
    productionConstraints: {},
    diseaseOutbreaks: {},
    copingStrategies: {},
    livestockConditions: {},
    livestockNumbers: {},
    livestockMigration: {},
    livestockMarketConditions: {},
    livestockOutbreaks: {},
    livestockInterventions: {},
    drugAvailability: '',
    milkProduction: {},
    waterSources: {},
    fishingHouseholds: '',
    fishingActivityChange: {},
    waterBodies: '',
    fishCatch: {},
    fishUtilization: {},
    fishPonds: {},
    stockedPonds: '',
    fishSpecies: {},
    aquacultureHarvest: {},
    fishingChallenges: '',
    markets: []
  });

  // ============================================
  // CLOUD SYNC FUNCTIONS
  // ============================================
  const saveToCloud = async (dataToSave, immediate = false) => {
    if (!activeAssessmentId) return false;

    try {
      setSaveStatus('syncing');

      const payload = {
        submission_data: dataToSave,
        district: dataToSave.district || null
      };

      const { error: updateError } = await supabase
        .from('assessments')
        .update(payload)
        .eq('id', activeAssessmentId);

      if (updateError) {
        // Handle unique constraint violation (district + period conflict)
        if (updateError.code === '23505') {
          console.warn('District conflict detected, falling back to JSON-only save');
          const { error: fallbackError } = await supabase
            .from('assessments')
            .update({ submission_data: dataToSave })
            .eq('id', activeAssessmentId);
          if (fallbackError) throw fallbackError;
        } else {
          throw updateError;
        }
      }

      lastCloudSyncRef.current = Date.now();
      setSaveStatus('saved');
      setLastSaved(new Date());

      return true;
    } catch (err) {
      console.error('Cloud sync failed:', err);
      setSaveStatus('error');

      if (!immediate) {
        // Retry after delay for non-immediate saves
        setTimeout(() => {
          saveToCloud(dataToSave, false);
        }, 5000);
      }

      return false;
    }
  };


  // ============================================
  // FORM DATA MANAGEMENT (Supabase only)
  // ============================================
  const updateFormData = (field, value) => {
    setFormData(prev => {
      if (prev[field] === value) return prev;

      const newData = { ...prev, [field]: value };

      if (activeAssessmentId) {
        saveToCloud(newData, true);
      }

      return newData;
    });
  };

  const saveFormDataNow = async (dataOverride) => {
    if (!activeAssessmentId) return;

    const payload = dataOverride || formData;

    // Immediate cloud save
    await saveToCloud(payload, true);
  };

  // ============================================
  // LOAD ASSESSMENT DATA (from Supabase only)
  // ============================================
  const loadAssessmentData = async (id) => {
    try {
      const { data, error: dbError } = await supabase
        .from('assessments')
        .select('submission_data, district')
        .eq('id', id)
        .single();

      if (dbError) throw dbError;

      if (data?.submission_data) {
        const submissionData = data.submission_data;

        // Data Migration: ensure markets array exists for newer UI
        if (submissionData.marketAssessments &&
          (!submissionData.markets || submissionData.markets.length === 0)) {
          submissionData.markets = [
            { id: 1, name: 'Market 1', data: {} },
            { id: 2, name: 'Market 2', data: {} }
          ];
        }

        if (data.district) {
          setLinkedDistrict(data.district);
          // Infer region
          let inferredRegion = '';
          for (const [region, districts] of Object.entries(ugandaDistricts)) {
            if (districts.includes(data.district)) {
              inferredRegion = region;
              break;
            }
          }
          setFormData(prev => ({
            ...prev,
            ...submissionData,
            district: data.district,
            statisticalRegion: inferredRegion || prev.statisticalRegion
          }));
        } else {
          setFormData(prev => ({ ...prev, ...submissionData }));
        }

        setSaveStatus('saved');
        setLastSaved(new Date());
      }
    } catch (err) {
      console.error('Load failed:', err);
      // error('Failed to load assessment data from the server.');
      setSaveStatus('error');
    }
  };

  // ============================================
  // CREATE OR GET DRAFT ASSESSMENT
  // ============================================
  const createOrGetDraftAssessment = async (userId) => {
    if (isCreatingAssessmentRef.current || activeAssessmentId) return;
    isCreatingAssessmentRef.current = true;

    try {
      const { data, error: fetchError } = await supabase
        .from('assessments')
        .select('id, submission_data, district')
        .eq('user_id', userId)
        .eq('reporting_year', reportingInfo.year)
        .eq('reporting_period', reportingInfo.period)
        .maybeSingle();

      if (fetchError && fetchError.message?.includes("column")) {
        console.warn("Reporting columns not found, falling back to legacy mode");
        const { data: legacyData } = await supabase
          .from('assessments')
          .select('id, submission_data')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (legacyData) {
          setActiveAssessmentId(legacyData.id);
          if (legacyData.submission_data) {
            setFormData(prev => ({ ...prev, ...legacyData.submission_data }));
          }
          return;
        }
      }

      if (data) {
        setActiveAssessmentId(data.id);
        await loadAssessmentData(data.id);
      } else {
        // Try to find a pre-assigned district from the directory
        let assignedDistrict = null;
        try {
          const { data: directoryData } = await supabase
            .from('district_dpo_directory')
            .select('district')
            .eq('email', session?.user?.email)
            .maybeSingle();

          if (directoryData?.district) {
            assignedDistrict = directoryData.district;
            setLinkedDistrict(assignedDistrict);
          }
        } catch (dirError) {
          console.warn("Could not fetch district assignment:", dirError);
        }

        const newAssessmentData = {
          user_id: userId,
          submission_data: {},
          district: assignedDistrict
        };

        try {
          const { data: newAssessment, error: insertError } = await supabase
            .from('assessments')
            .insert([{
              ...newAssessmentData,
              reporting_year: reportingInfo.year,
              reporting_period: reportingInfo.period,
              reporting_frequency: REPORTING_CONFIG.defaultFrequency
            }])
            .select()
            .single();

          if (insertError) throw insertError;
          if (newAssessment) {
            setActiveAssessmentId(newAssessment.id);
            if (assignedDistrict) {
              // Also update the form data immediately for the UI
              setFormData(prev => ({ ...prev, district: assignedDistrict }));
            }
          }
        } catch (err) {
          console.warn("Failed to insert with reporting period, falling back:", err);
          const { data: fallbackAssessment } = await supabase
            .from('assessments')
            .insert([{ user_id: userId, submission_data: {}, district: assignedDistrict }])
            .select()
            .single();
          if (fallbackAssessment) {
            setActiveAssessmentId(fallbackAssessment.id);
          }
        }
      }
    } catch (outerErr) {
      console.error("Critical error in createOrGetDraftAssessment:", outerErr);
    } finally {
      isCreatingAssessmentRef.current = false;
    }
  };

  // ============================================
  // SECTION CONFIGURATION
  // ============================================
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
    livestock: ['livestockConditions', 'livestockNumbers', 'livestockMigration', 'livestockMarketConditions', 'livestockOutbreaks', 'livestockInterventions', 'drugAvailability', 'milkProduction', 'waterSources'],
    fisheries: ['fishingHouseholds', 'fishingActivityChange', 'waterBodies', 'fishCatch', 'fishUtilization', 'fishPonds', 'stockedPonds', 'fishSpecies', 'aquacultureHarvest', 'fishingChallenges'],
    markets: ['markets']
  };

  const calculateSectionProgress = (sectionId) => {
    if (!sectionId || !sectionFields[sectionId]) return 0;
    const fields = sectionFields[sectionId];
    let filledCount = 0;
    let totalFields = fields.length;

    if (sectionId === 'fisheries' && formData.waterBodies === 'no') {
      const conditionalFields = ['fishCatch', 'fishUtilization'];
      totalFields = fields.filter(f => !conditionalFields.includes(f)).length;

      fields.forEach(field => {
        if (conditionalFields.includes(field)) return;

        const value = formData[field];
        if (value && typeof value === 'object') {
          if (Object.values(value).some(v => v !== '' && v !== null && v !== false)) {
            filledCount++;
          }
        } else if (value && value !== '') {
          filledCount++;
        }
      });
    } else if (sectionId === 'crop') {
      fields.forEach(field => {
        const value = formData[field];
        if (field === 'diseaseOutbreaks') {
          if (value?.hasOutbreak === 'no' ||
            (value?.hasOutbreak === 'yes' && Object.keys(value).length > 1)) {
            filledCount++;
          }
        } else if (value && typeof value === 'object') {
          if (Object.values(value).some(v => v !== '' && v !== null && v !== false)) {
            filledCount++;
          }
        } else if (value && value !== '') {
          filledCount++;
        }
      });
    } else if (sectionId === 'markets') {
      const markets = formData.markets || [];
      if (markets.length >= 2) {
        const allMarketsValid = markets.every(m =>
          m.name &&
          m.data?.parish &&
          m.data?.marketType &&
          m.data?.frequency
        );
        if (allMarketsValid) {
          filledCount = totalFields;
        } else {
          filledCount = 0.5 * totalFields;
        }
      } else if (markets.length > 0) {
        filledCount = 0.3 * totalFields;
      }
    } else {
      fields.forEach(field => {
        const value = formData[field];
        if (value && typeof value === 'object') {
          if (Object.values(value).some(v => v !== '' && v !== null && v !== false)) {
            filledCount++;
          }
        } else if (value && value !== '') {
          filledCount++;
        }
      });
    }

    return Math.round((filledCount / totalFields) * 100);
  };

  const sections = userRole === 'pending' ? [] : allSections;

  const assignedSection =
    userRole !== 'owner' && userRole !== 'pending'
      ? allSections.find(s => s.id === userRole)
      : null;

  // ============================================
  // AUTH & PERMISSIONS
  // ============================================
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

      if (currentSession) {
        const params = new URLSearchParams(window.location.search);
        const hasToken = !!params.get('token') || !!sessionStorage.getItem('district_link_token');

        await openDistrictLinkFromUrl(currentSession.user.id);

        if (!hasToken) {
          checkUserPermissions(currentSession.user.id, currentSession.user.email);
        }
        checkSystemAdmin(currentSession.user.email);
      }
      setLoadingSession(false);
    };

    validateSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const openDistrictLinkFromUrl = async (currentUserId) => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || sessionStorage.getItem('district_link_token');

    if (!token) return;

    setLinkStatus('processing');
    setLinkError('');

    try {
      const { data, error: rpcError } = await supabase.rpc('open_district_link', { link_token: token });
      if (rpcError) throw rpcError;

      const linkInfo = Array.isArray(data) ? data[0] : data;
      if (!linkInfo?.assessment_id) {
        throw new Error('No assessment returned for this link.');
      }

      if (currentUserId) {
        await supabase
          .from('assessments')
          .update({ user_id: currentUserId })
          .eq('id', linkInfo.assessment_id);
      }

      setActiveAssessmentId(linkInfo.assessment_id);
      setLinkedDistrict(linkInfo.district || null);
      setUserRole('owner');
      await loadAssessmentData(linkInfo.assessment_id);

      if (linkInfo.district) {
        setFormData(prev => ({ ...prev, district: linkInfo.district }));
      }

      sessionStorage.removeItem('district_link_token');
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', newUrl);
      setLinkStatus('ready');
    } catch (err) {
      console.error('District link error:', err);
      // Clear token if it's invalid (400) or if explicitly failed
      if (err?.status === 400 || err?.message?.includes('400')) {
        console.warn('Clearing invalid district link token');
        sessionStorage.removeItem('district_link_token');
      }
      setLinkStatus('error');
      setLinkError(err?.message || String(err));
    }
  };

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
    if (activeAssessmentId) {
      const { data: notes } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_email', email)
        .eq('is_read', false)
        .order('created_at', { ascending: false });
      if (notes) setNotifications(notes);
      return;
    }

    const { data: allInvites } = await supabase
      .from('assessment_collaborators')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    const pending = allInvites?.find(i => i.status === 'pending');
    if (pending) {
      setPendingInvite(pending);
    }

    const { data: ownAssessment } = await supabase
      .from('assessments')
      .select('id')
      .eq('user_id', userId)
      .eq('reporting_year', reportingInfo.year)
      .eq('reporting_period', reportingInfo.period)
      .maybeSingle();

    if (ownAssessment) {
      setUserRole('owner');
      setActiveAssessmentId(ownAssessment.id);
      loadAssessmentData(ownAssessment.id);
    } else {
      const accepted = allInvites?.find(i => i.status === 'accepted');

      if (accepted) {
        setUserRole(accepted.role);
        setActiveAssessmentId(accepted.assessment_id);
        loadAssessmentData(accepted.assessment_id);
      } else if (pending) {
        setUserRole('pending');
      } else {
        setUserRole('owner');
        await createOrGetDraftAssessment(userId);
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

  const checkSystemAdmin = (email) => {
    if (!email) return;
    const lowerEmail = email.toLowerCase();
    if (SYSTEM_ADMIN_EMAILS.some(e => e.toLowerCase() === lowerEmail)) {
      setIsSystemAdmin(true);
    }
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

  // ============================================
  // NAVIGATION
  // ============================================
  const nextSection = () => {
    saveFormDataNow();
    if (currentSection < sections.length - 1) setCurrentSection(currentSection + 1);
  };

  const prevSection = () => {
    saveFormDataNow();
    if (currentSection > 0) setCurrentSection(currentSection - 1);
  };

  // ============================================
  // SUBMISSION
  // ============================================
  const submitAssessment = async () => {
    if (!session) return;

    if (userRole === 'owner') {
      const incompleteSections = sections
        .filter(s => s.id !== 'review' && sectionFields[s.id])
        .filter(s => calculateSectionProgress(s.id) < 100);

      if (incompleteSections.length > 0) {
        error(`Cannot submit: The following sections are incomplete: ${incompleteSections.map(s => s.title).join(', ')}`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const finalData = {
        ...formData,
        submittedAt: new Date().toISOString(),
        submittedBy: session.user.email
      };

      const { error: submitError } = await supabase
        .from('assessments')
        .update({
          submission_data: finalData,
          last_modified: new Date().toISOString()
        })
        .eq('id', activeAssessmentId);

      if (submitError) throw submitError;

      if (userRole !== 'owner') {
        success('Section submitted! The District Officer has been notified.');
      } else {
        success('Assessment finalized and saved to database!');
      }

      setSaveStatus('saved');
      setLastSaved(new Date());
    } catch (err) {
      console.error("Submission Error", err);
      error(`Submission error: ${err.message ?? err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // BEFOREUNLOAD HANDLER (optional warning)
  // ============================================
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // If a save is in-flight, warn the user before leaving
      if (saveStatus === 'saving' || saveStatus === 'syncing') {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);

  // ============================================
  // PERIODIC CLOUD SYNC (every 30 seconds if changes exist)
  // ============================================
  useEffect(() => {
    if (!activeAssessmentId || !session) return;

    const interval = setInterval(() => {
      const timeSinceLastSync = Date.now() - lastCloudSyncRef.current;

      // Sync every 30 seconds if there are changes
      if (timeSinceLastSync > 30000 && (saveStatus === 'saved' || saveStatus === 'error')) {
        saveToCloud(formData, false);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeAssessmentId, session, formData, saveStatus]);

  // ============================================
  // LOADING STATE
  // ============================================
  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading your assessment...</p>
        </div>
      </div>
    );
  }

  if (!session) return <Auth />;

  if (isAdminMode) {
    if (!isSystemAdmin && !loadingSession) {
      exitAdminMode();
      return null;
    }
    return <AdminPanel session={session} onExit={exitAdminMode} />;
  }

  // ============================================
  // RENDER VIEW
  // ============================================
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
      case 'assessment': {
        if (userRole === 'unauthorized') {
          return (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-700">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Access restricted</h3>
              <p className="text-sm text-gray-600">
                You need a district invite (DPO) or a collaborator invite to access this assessment.
              </p>
            </div>
          );
        }
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
            {sectionId === 'intro' && (
              <IntroSection
                formData={formData}
                updateFormData={updateFormData}
                reportingInfo={reportingInfo}
                lockedDistrict={linkedDistrict}
              />
            )}
            {sectionId === 'crop' && <CropSection formData={formData} updateFormData={updateFormData} />}
            {sectionId === 'livestock' && <LivestockSection formData={formData} updateFormData={updateFormData} />}
            {sectionId === 'fisheries' && <FisheriesSection formData={formData} updateFormData={updateFormData} />}
            {sectionId === 'markets' && <MarketsSection formData={formData} updateFormData={updateFormData} />}
            {sectionId === 'review' && <ReviewSection formData={formData} sections={allSections} calculateProgress={calculateSectionProgress} />}
          </div>
        );
      }
      default:
    }
  };

  // ============================================
  // SAVE STATUS INDICATOR
  // ============================================
  const SaveStatusIndicator = () => {
    const getStatusConfig = () => {
      switch (saveStatus) {
        case 'syncing':
          return {
            icon: <Cloud className="w-4 h-4 animate-pulse" />,
            text: 'Saving and Syncing...',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
          };
        case 'saved':
          return {
            icon: <CheckCircle2 className="w-4 h-4" />,
            text: lastSaved
              ? `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'All changes saved',
            color: 'text-green-600',
            bgColor: 'bg-green-50'
          };
        case 'error':
          return {
            icon: <AlertCircle className="w-4 h-4" />,
            text: 'Save error',
            color: 'text-red-600',
            bgColor: 'bg-red-50'
          };
        default:
          return null;
      }
    };

    const config = getStatusConfig();
    if (!config) return null;

    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${config.color} ${config.bgColor}`}>
        {config.icon}
        <span>{config.text}</span>
      </div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================
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
              {/* Save Status Indicator */}
              <div className="hidden md:block">
                <SaveStatusIndicator />
              </div>

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
                    {isSystemAdmin && (
                      <button onClick={() => { enterAdminMode(); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors">
                        <Database className="w-4 h-4" /> Admin Dashboard
                      </button>
                    )}
                    <div className="h-px bg-gray-50 my-1"></div>
                    <button onClick={() => supabase.auth.signOut()} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Save Status */}
          <div className="md:hidden mt-3 flex justify-center">
            <SaveStatusIndicator />
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
                    saveFormDataNow();
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
                {isSystemAdmin && (
                  <button
                    onClick={() => { enterAdminMode(); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm transition-all ${currentView === 'admin' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Database className="w-5 h-5" /> Admin Dashboard
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

        {currentView === 'assessment' && sections.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-widest">
                <LayoutGrid className="w-4 h-4" />
                <span>
                  Section {currentSection + 1} of {sections.length}
                  {userRole !== 'owner' && assignedSection?.title ? ` • Assigned: ${assignedSection.title}` : ''}
                </span>
              </div>
              {(formData.district || linkedDistrict) && (
                <div className="text-xs md:text-sm font-bold text-gray-500">
                  District: <span className="text-gray-900">{formData.district || linkedDistrict}</span>
                </div>
              )}
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
                  onClick={() => {
                    saveFormDataNow();
                    setCurrentSection(idx);
                  }}
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