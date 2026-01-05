import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsAPI } from '../services/api';
import { Plus } from 'lucide-react';
import DealModal from '../components/DealModal';

const Pipeline = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const queryClient = useQueryClient();

  const { data: pipeline, isLoading } = useQuery({
    queryKey: ['pipeline'],
    queryFn: async () => {
      const response = await dealsAPI.getPipeline();
      return response.data;
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }) => dealsAPI.updateStage(id, stage),
    onSuccess: () => {
      queryClient.invalidateQueries(['pipeline']);
    },
  });

  const stages = [
    { key: 'prospect', label: 'Prospect', color: 'grey' },
    { key: 'interested', label: 'Interested', color: 'blue' },
    { key: 'proposal', label: 'Proposal', color: 'yellow' },
    { key: 'negotiation', label: 'Negotiation', color: 'orange' },
    { key: 'won', label: 'Won', color: 'green' },
    { key: 'lost', label: 'Lost', color: 'red' },
  ];

  const handleDragStart = (e, deal) => {
    e.dataTransfer.setData('dealId', deal.id.toString());
    e.dataTransfer.setData('dealData', JSON.stringify(deal));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStage) => {
    e.preventDefault();
    const dealId = parseInt(e.dataTransfer.getData('dealId'));
    updateStageMutation.mutate({ id: dealId, stage: newStage });
  };

  const getStageSummary = (deals) => {
    if (!deals) return { count: 0, value: 0 };
    return {
      count: deals.length,
      value: deals.reduce((sum, deal) => sum + (deal.value || 0), 0),
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Deal Pipeline</h1>
          <p className="text-text-secondary mt-2">Track deals through your sales pipeline</p>
        </div>
        <button
          onClick={() => {
            setSelectedDeal(null);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Deal</span>
        </button>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stages.map((stage) => {
          const summary = getStageSummary(pipeline?.[stage.key]);
          return (
            <div key={stage.key} className="card">
              <p className="text-text-secondary text-sm">{stage.label}</p>
              <p className="text-3xl font-bold mt-2 text-text-primary">{summary.count}</p>
              <p className="text-primary-500 text-xs mt-1">deals</p>
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="text-center py-12 text-text-secondary">Loading pipeline...</div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-4 min-w-max">
            {stages.map((stage) => (
              <div
                key={stage.key}
                className="flex-shrink-0 w-80"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.key)}
              >
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold flex items-center justify-between text-text-primary">
                      <span>{stage.label}</span>
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded-full text-text-secondary">
                        {pipeline?.[stage.key]?.length || 0}
                      </span>
                    </h3>
                  </div>

                  <div className="p-3 space-y-2 min-h-[500px] bg-background-100">
                    {pipeline?.[stage.key]?.map((deal) => (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal)}
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:shadow-md cursor-move transition-all"
                        onClick={() => {
                          setSelectedDeal(deal);
                          setIsModalOpen(true);
                        }}
                      >
                        <h4 className="font-medium text-text-primary mb-3">{deal.title}</h4>

                        {deal.probability !== undefined && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs text-text-secondary mb-1.5">
                              <span>Confidence</span>
                              <span className="font-medium">{deal.probability}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div
                                className="bg-primary-500 h-2 rounded-full transition-all"
                                style={{ width: `${deal.probability}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {deal.expected_close_date && (
                          <p className="text-xs text-text-muted mt-2">
                            Expected close: {new Date(deal.expected_close_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}

                    {(!pipeline?.[stage.key] || pipeline[stage.key].length === 0) && (
                      <p className="text-text-muted text-sm text-center py-8">
                        No deals yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deal Modal */}
      {isModalOpen && (
        <DealModal
          deal={selectedDeal}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDeal(null);
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            setSelectedDeal(null);
            queryClient.invalidateQueries(['pipeline']);
          }}
        />
      )}
    </div>
  );
};

export default Pipeline;
