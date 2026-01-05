import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsAPI } from '../services/api';
import { Plus, DollarSign } from 'lucide-react';
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
          <h1 className="text-3xl font-bold">Deal Pipeline</h1>
          <p className="text-grey-400 mt-2">Track deals through your sales pipeline</p>
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
              <p className="text-grey-400 text-sm">{stage.label}</p>
              <p className="text-2xl font-bold mt-1">{summary.count}</p>
              <p className="text-primary-400 text-sm mt-1">
                ${(summary.value / 1000).toFixed(0)}K
              </p>
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="text-center py-12 text-grey-400">Loading pipeline...</div>
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
                <div className="bg-navy-800 rounded-lg border border-grey-700">
                  <div className={`p-4 border-b border-grey-700 bg-${stage.color}-500/10`}>
                    <h3 className="font-bold flex items-center justify-between">
                      <span>{stage.label}</span>
                      <span className="text-sm text-grey-400">
                        {pipeline?.[stage.key]?.length || 0}
                      </span>
                    </h3>
                  </div>

                  <div className="p-4 space-y-3 min-h-[500px]">
                    {pipeline?.[stage.key]?.map((deal) => (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal)}
                        className="bg-navy-700 p-4 rounded-lg border border-grey-600 hover:border-primary-500 cursor-move transition-colors"
                        onClick={() => {
                          setSelectedDeal(deal);
                          setIsModalOpen(true);
                        }}
                      >
                        <h4 className="font-medium mb-2">{deal.title}</h4>

                        {deal.value && (
                          <div className="flex items-center text-primary-400 text-sm mb-2">
                            <DollarSign size={14} />
                            <span>{(deal.value / 1000).toFixed(0)}K</span>
                          </div>
                        )}

                        {deal.probability !== undefined && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs text-grey-400 mb-1">
                              <span>Probability</span>
                              <span>{deal.probability}%</span>
                            </div>
                            <div className="w-full bg-navy-600 rounded-full h-1.5">
                              <div
                                className="bg-primary-500 h-1.5 rounded-full"
                                style={{ width: `${deal.probability}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {deal.expected_close_date && (
                          <p className="text-xs text-grey-400">
                            Close: {new Date(deal.expected_close_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}

                    {(!pipeline?.[stage.key] || pipeline[stage.key].length === 0) && (
                      <p className="text-grey-500 text-sm text-center py-8">
                        No deals in this stage
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
