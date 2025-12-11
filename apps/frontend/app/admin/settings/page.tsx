'use client';

import { useState } from 'react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    siteName: 'ZeroDay Institute',
    siteDescription: 'Professional Cybersecurity Training Platform',
    allowNewRegistrations: true,
    requireEmailVerification: true,
    maintenanceMode: false,
    maxEnrollmentsPerUser: 10,
    defaultCoursePrice: 9900, // $99.00
    platformFeePercentage: 15,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      // API call to save settings
      console.log('Saving settings:', settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🔐' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white">Admin Settings</h1>
        <p className="mt-2 text-neutral-400">Configure platform settings and preferences</p>
      </div>

      {/* Settings Navigation */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm rounded-lg shadow-2xl shadow-red-950/20 p-2">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                  : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm rounded-lg shadow-2xl shadow-red-950/20 p-8">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">General Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Site Description
                </label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Maintenance Mode
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() =>
                      handleSettingChange('maintenanceMode', !settings.maintenanceMode)
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      settings.maintenanceMode ? 'bg-red-600' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-zinc-300">
                    {settings.maintenanceMode ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Allow New Registrations
                  </label>
                  <p className="text-xs text-zinc-500">Enable or disable new user signups</p>
                </div>
                <button
                  onClick={() =>
                    handleSettingChange('allowNewRegistrations', !settings.allowNewRegistrations)
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    settings.allowNewRegistrations ? 'bg-emerald-600' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.allowNewRegistrations ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Require Email Verification
                  </label>
                  <p className="text-xs text-zinc-500">Users must verify email before access</p>
                </div>
                <button
                  onClick={() =>
                    handleSettingChange(
                      'requireEmailVerification',
                      !settings.requireEmailVerification,
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    settings.requireEmailVerification ? 'bg-emerald-600' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.requireEmailVerification ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Pricing Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Default Course Price (cents)
                </label>
                <input
                  type="number"
                  value={settings.defaultCoursePrice}
                  onChange={(e) =>
                    handleSettingChange('defaultCoursePrice', parseInt(e.target.value))
                  }
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Platform Fee (%)
                </label>
                <input
                  type="number"
                  value={settings.platformFeePercentage}
                  onChange={(e) =>
                    handleSettingChange('platformFeePercentage', parseInt(e.target.value))
                  }
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Max Enrollments Per User
                </label>
                <input
                  type="number"
                  value={settings.maxEnrollmentsPerUser}
                  onChange={(e) =>
                    handleSettingChange('maxEnrollmentsPerUser', parseInt(e.target.value))
                  }
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Email Settings</h2>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📧</div>
              <p className="text-zinc-400">Email configuration coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Integrations</h2>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔗</div>
              <p className="text-zinc-400">Third-party integrations coming soon...</p>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t border-zinc-700">
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow-lg shadow-red-900/30"
          >
            💾 Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
