import { useState } from 'react';
import { Sparkles, Mail, Clock, TrendingUp } from 'lucide-react';
import axios from 'axios';

const AIInsights = ({ contact, deals = [], notes = [] }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');
  const [insights, setInsights] = useState(null);
  const [outreachEmail, setOutreachEmail] = useState('');
  const [dealScore, setDealScore] = useState(null);

  const API_BASE = 'http://localhost:8000/api';

  const getContactInsights = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/ai/contact-insights/${contact.id}`);
      setInsights(response.data);
    } catch (error) {
      console.error('Error getting insights:', error);
    }
    setLoading(false);
  };

  const generateOutreach = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/ai/generate-outreach`, {
        contact_id: contact.id,
        context: `Interested in discussing ${contact.contact_type} partnership opportunities`
      });
      setOutreachEmail(response.data.template);
    } catch (error) {
      console.error('Error generating outreach:', error);
    }
    setLoading(false);
  };

  const scoreDeal = async (dealId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/ai/score-deal/${dealId}`);
      setDealScore(response.data);
    } catch (error) {
      console.error('Error scoring deal:', error);
    }
    setLoading(false);
  };

  const summarizeNotes = async () => {
    if (!notes || notes.length === 0) {
      alert('No notes to summarize');
      return;
    }
    setLoading(true);
    try {
      const noteIds = notes.map(note => note.id);
      const response = await axios.post(`${API_BASE}/ai/summarize-notes`, {
        note_ids: noteIds
      });
      setInsights({ summary: response.data.summary });
      setActiveTab('insights');
    } catch (error) {
      console.error('Error summarizing notes:', error);
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'insights', label: 'Insights', icon: Sparkles },
    { id: 'outreach', label: 'Outreach', icon: Mail },
    { id: 'scoring', label: 'Deal Score', icon: TrendingUp },
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="text-primary-500" size={20} />
          <h2 className="text-xl font-bold text-text-primary">AI Assistant</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-4 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 font-medium'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="min-h-[200px]">
        {activeTab === 'insights' && (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <button
                onClick={getContactInsights}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Analyzing...' : 'Get Contact Insights'}
              </button>
              {notes?.length > 0 && (
                <button
                  onClick={summarizeNotes}
                  disabled={loading}
                  className="btn-secondary"
                >
                  Summarize Notes
                </button>
              )}
            </div>

            {insights && (
              <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
                <div className="flex items-start space-x-2">
                  <Clock className="text-primary-500 mt-1" size={18} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary mb-2">Best Contact Time</h3>
                    <p className="text-text-secondary text-sm">
                      {insights.best_contact_time || insights.summary}
                    </p>
                    {insights.timezone && (
                      <p className="text-text-muted text-xs mt-1">
                        Timezone: {insights.timezone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'outreach' && (
          <div className="space-y-4">
            <button
              onClick={generateOutreach}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Generating...' : 'Generate Outreach Email'}
            </button>

            {outreachEmail && (
              <div className="bg-background-100 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-text-primary">AI-Generated Email</h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(outreachEmail)}
                    className="text-sm text-primary-500 hover:text-primary-600"
                  >
                    Copy
                  </button>
                </div>
                <pre className="text-sm text-text-secondary whitespace-pre-wrap font-sans">
                  {outreachEmail}
                </pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'scoring' && (
          <div className="space-y-4">
            {deals && deals.length > 0 ? (
              <div className="space-y-3">
                <p className="text-text-secondary text-sm mb-3">
                  Select a deal to get AI scoring and recommendations
                </p>
                {deals.map((deal) => (
                  <button
                    key={deal.id}
                    onClick={() => scoreDeal(deal.id)}
                    disabled={loading}
                    className="w-full text-left p-3 bg-background-100 rounded-lg border border-gray-200 hover:border-primary-500 transition-colors"
                  >
                    <p className="font-medium text-text-primary">{deal.title}</p>
                    <p className="text-sm text-text-secondary capitalize">{deal.stage}</p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-text-muted text-center py-8">No deals to score</p>
            )}

            {dealScore && (
              <div className="bg-primary-50 p-4 rounded-lg border border-primary-200 mt-4">
                <h3 className="font-semibold text-text-primary mb-3">Deal Score</h3>
                <div className="flex items-center space-x-4 mb-3">
                  <div className="text-4xl font-bold text-primary-500">
                    {dealScore.score}
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all"
                        style={{ width: `${dealScore.score}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-text-secondary text-sm mb-3">{dealScore.recommendation}</p>
                {dealScore.factors && dealScore.factors.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-text-primary mb-2">Key Factors:</p>
                    <ul className="text-sm text-text-secondary space-y-1">
                      {dealScore.factors.map((factor, index) => (
                        <li key={index}>• {factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
