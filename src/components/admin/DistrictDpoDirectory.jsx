import React, { useEffect, useMemo, useState } from 'react';
import { Copy, Link as LinkIcon, Loader2, Save, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { DUMMY_DISTRICT_DPOS } from '../../utils/dummyDistrictDpos';
import { getCurrentReportingPeriod, REPORTING_CONFIG, formatReportingPeriod } from '../../utils/reportingPeriods';

const buildDistrictUrl = (token) => `${window.location.origin}/district-link?token=${encodeURIComponent(token)}`;

export default function DistrictDpoDirectory() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [dbBacked, setDbBacked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [savingDistrict, setSavingDistrict] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(null);
  const [inviteModal, setInviteModal] = useState(null); // { district, email, token, url }

  const [reportingInfo, setReportingInfo] = useState(() =>
    getCurrentReportingPeriod(REPORTING_CONFIG.defaultFrequency)
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      r.district.toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q)
    );
  }, [rows, search]);

  const load = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase
        .from('district_dpo_directory')
        .select('district, email, updated_at');

      if (error) throw error;

      // Always show the full district list, with DB emails overriding the dummy defaults.
      setDbBacked(true);
      const byDistrict = new Map(
        DUMMY_DISTRICT_DPOS.map(d => [d.district, { district: d.district, email: d.email, updatedAt: null }])
      );
      (data || []).forEach(r => {
        byDistrict.set(r.district, {
          district: r.district,
          email: r.email,
          updatedAt: r.updated_at
        });
      });

      // Fetch invite status (how many invites and last invite per district) for the current period
      const { data: inviteStatus } = await supabase
        .from('district_invite_status')
        .select('district, reporting_year, reporting_period, last_invited_at, invites_count')
        .eq('reporting_year', reportingInfo.year)
        .eq('reporting_period', reportingInfo.period);

      const statusByDistrict = new Map(
        (inviteStatus || []).map(s => [s.district, { lastInvitedAt: s.last_invited_at, invitesCount: s.invites_count }])
      );

      const merged = Array.from(byDistrict.values()).sort((a, b) => a.district.localeCompare(b.district));
      const withStatus = merged.map(r => ({
        ...r,
        lastInvitedAt: statusByDistrict.get(r.district)?.lastInvitedAt || null,
        invitesCount: statusByDistrict.get(r.district)?.invitesCount || 0
      }));

      setRows(withStatus);
    } catch (err) {
      // Most common: relation does not exist yet (migration not applied)
      setDbBacked(false);
      setRows([...DUMMY_DISTRICT_DPOS].sort((a, b) => a.district.localeCompare(b.district)));
      setErrorMsg(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateEmail = (district, email) => {
    setRows(prev => prev.map(r => (r.district === district ? { ...r, email } : r)));
  };

  const saveRow = async (district) => {
    const row = rows.find(r => r.district === district);
    if (!row) return;
    if (!row.email || !row.email.includes('@')) {
      alert('Please enter a valid email before saving.');
      return;
    }

    setSavingDistrict(district);
    try {
      const { error } = await supabase
        .from('district_dpo_directory')
        .upsert([{ district: row.district, email: row.email }], { onConflict: 'district' });

      if (error) throw error;
      await load();
    } catch (err) {
      alert(`Failed to save email for ${district}: ${err?.message || String(err)}`);
    } finally {
      setSavingDistrict(null);
    }
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard.');
    } catch {
      // Fallback: prompt
      window.prompt('Copy this text:', text);
    }
  };

  const createInvite = async (district) => {
    const row = rows.find(r => r.district === district);
    if (!row) return;
    if (!row.email || !row.email.includes('@')) {
      alert('Please set the DPO email first.');
      return;
    }

    setGenerating(district);
    try {
      const { data, error } = await supabase.rpc('ensure_district_link', {
        p_district_name: row.district,
        p_dpo_email: row.email,
        p_reporting_year: reportingInfo.year,
        p_reporting_period: reportingInfo.period,
        p_reporting_frequency: REPORTING_CONFIG.defaultFrequency
      });

      if (error) throw error;
      const token = data?.token || data?.[0]?.token || data;
      if (!token || typeof token !== 'string') throw new Error('No token returned from ensure_district_link');

      setInviteModal({
        district: row.district,
        email: row.email,
        token,
        url: buildDistrictUrl(token)
      });
    } catch (err) {
      alert(
        `Failed to create district link for ${district}: ${err?.message || String(err)}\n\n` +
        `If this is a new setup, make sure you ran the Supabase migration that creates ` +
        `the district directory + link functions.`
      );
    } finally {
      setGenerating(null);
    }
  };

  const sendEmail = async (district) => {
    const row = rows.find(r => r.district === district);
    if (!row) return;
    if (!row.email || !row.email.includes('@')) {
      alert('Please set a valid email first.');
      return;
    }

    setSendingEmail(district);
    try {
      const { data, error } = await supabase.rpc('queue_district_invite_email', {
        p_district_name: row.district,
        p_dpo_email: row.email,
        p_base_url: window.location.origin,
        p_reporting_year: reportingInfo.year,
        p_reporting_period: reportingInfo.period,
        p_reporting_frequency: REPORTING_CONFIG.defaultFrequency
      });

      if (error) throw error;
      const linkUrl = (Array.isArray(data) ? data[0]?.link_url : data?.link_url) || '';
      alert(
        'Email queued successfully.\n\n' +
        (linkUrl ? `Link: ${linkUrl}` : '')
      );
    } catch (err) {
      alert(`Failed to queue invite email for ${district}: ${err?.message || String(err)}`);
    } finally {
      setSendingEmail(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">District DPO Directory</h3>
            <p className="text-sm text-gray-600">
              Edit each district’s DPO email, then generate an invite link for the current reporting period ({formatReportingPeriod(reportingInfo)}).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {!dbBacked && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-bold">Using dummy emails (database table not found yet).</p>
              <p className="text-amber-800">
                Run the Supabase migration for district DPO invites, then come back here to save and generate links from the database.
              </p>
              {errorMsg && <p className="mt-2 text-xs text-amber-800">Details: {errorMsg}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search district or email…"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invites</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DPO Email</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRows.map((r) => (
                <tr key={r.district} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{r.district}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                    {r.invitesCount > 0 ? (
                      <>
                        <span className="font-semibold">{r.invitesCount}</span> sent<br />
                        <span className="text-[10px] text-gray-400">
                          Last: {new Date(r.lastInvitedAt).toLocaleDateString()}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400">No invites yet</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <input
                      value={r.email || ''}
                      onChange={(e) => updateEmail(r.district, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="dpo.district@testgov.ug"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => saveRow(r.district)}
                        disabled={!dbBacked || savingDistrict === r.district}
                        className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        title={dbBacked ? 'Save email to database' : 'Run migration first to save'}
                      >
                        {savingDistrict === r.district ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                      </button>

                      <button
                        onClick={() => createInvite(r.district)}
                        disabled={!dbBacked || generating === r.district}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        title="Generate a DPO invite link"
                      >
                        {generating === r.district ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                        Invite link
                      </button>

                      <button
                        onClick={() => sendEmail(r.district)}
                        disabled={!dbBacked || sendingEmail === r.district}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        title="Queue invite email via Supabase"
                      >
                        {sendingEmail === r.district ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                        Send email
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-sm text-gray-500">No matches.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {inviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Invite link created</h3>
                <p className="text-sm text-gray-600 mt-1">
                  District: <span className="font-bold">{inviteModal.district}</span> • Email: <span className="font-bold">{inviteModal.email}</span>
                </p>
              </div>
              <button
                onClick={() => setInviteModal(null)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
              >
                Close
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">District URL</label>
              <div className="flex gap-2">
                <input
                  value={inviteModal.url}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={() => copy(inviteModal.url)}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Send this link to the DPO (or team). Anyone authenticated with the link can edit this district&apos;s assessment for the selected reporting period.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

