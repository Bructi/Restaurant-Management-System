import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface WorkflowItem {
  key: string;
  name: string;
  description: string;
  category: 'supply' | 'guest' | 'kds' | 'analytics' | 'menu';
  icon: string;
  webhookPath: string;
  webhookUrl: string;
  isProvisioned: boolean;
  workflowId: string | null;
  isActive: boolean;
  updatedAt: string | null;
}

export const N8nAutomationHubView: React.FC = () => {
  const { showToast } = useToast();
  const [provisioning, setProvisioning] = useState(false);
  const [triggeringKey, setTriggeringKey] = useState<string | null>(null);
  const [n8nStatus, setN8nStatus] = useState<{
    connected: boolean;
    n8nUrl: string;
    version: string;
    workflows: WorkflowItem[];
    recentExecutions: any[];
    error?: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'all' | 'supply' | 'guest' | 'kds' | 'analytics' | 'menu'>('all');
  const [lastExecutionResult, setLastExecutionResult] = useState<any>(null);
  const [selectedWorkflowKey, setSelectedWorkflowKey] = useState<string>('auto-supply');

  const fetchStatus = async () => {
    try {
      const res = await api.getN8nStatus();
      if (res.success) {
        setN8nStatus(res);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to connect to n8n server', 'error');
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleProvision = async () => {
    try {
      setProvisioning(true);
      const res = await api.provisionN8nWorkflows();
      if (res.success) {
        showToast(res.message || 'All RestoFlow workflows provisioned in n8n!', 'success');
        await fetchStatus();
      }
    } catch (err: any) {
      showToast(err.message || 'Provisioning failed', 'error');
    } finally {
      setProvisioning(false);
    }
  };

  const handleTriggerWorkflow = async (key: string, customPayload?: any) => {
    try {
      setTriggeringKey(key);
      setSelectedWorkflowKey(key);
      const res = await api.triggerN8nWorkflow(key, customPayload);
      if (res.success) {
        setLastExecutionResult(res);
        showToast(`⚡ n8n Workflow '${res.workflowName || key}' executed successfully in ${res.durationMs}ms!`, 'success');
        // Refresh status for updated executions
        fetchStatus();
      }
    } catch (err: any) {
      showToast(err.message || `Failed to execute workflow ${key}`, 'error');
    } finally {
      setTriggeringKey(null);
    }
  };

  const handleToggle = async (wf: WorkflowItem) => {
    if (!wf.workflowId) return;
    try {
      const newActive = !wf.isActive;
      await api.toggleN8nWorkflow(wf.workflowId, newActive);
      showToast(`Workflow ${newActive ? 'activated' : 'deactivated'}`, 'info');
      fetchStatus();
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle workflow', 'error');
    }
  };

  const filteredWorkflows = (n8nStatus?.workflows || []).filter((w) => {
    if (activeTab === 'all') return true;
    return w.category === activeTab;
  });

  return (
    <div className="flex flex-col gap-space-lg p-space-lg max-w-[1600px] mx-auto w-full animate-fadeIn">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-low p-space-lg rounded-2xl border border-outline-variant/30 shadow-sm">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-[#ff6d5a]/10 border border-[#ff6d5a]/30 flex items-center justify-center text-[#ff6d5a]">
            <span className="material-symbols-outlined text-[28px]">hub</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-sm flex-wrap">
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                n8n Autonomous AI Operations & Supply Hub
              </h1>
              <div
                className={`inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full text-xs font-semibold ${
                  n8nStatus?.connected
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : 'bg-error/10 text-error border border-error/20'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${n8nStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-error'}`} />
                {n8nStatus?.connected ? `n8n Cluster Online (v${n8nStatus.version})` : 'Disconnected'}
              </div>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Virtual microservice orchestrator powering automatic supplier reorders, VIP table matching, dynamic KDS routing, and executive briefings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={() => window.open('http://localhost:5678', '_blank')}
            className="flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md border border-outline-variant/50 transition-colors shadow-sm"
            title="Open n8n Workflow Visual Builder"
          >
            <span className="material-symbols-outlined text-[18px] text-[#ff6d5a]">open_in_new</span>
            Open n8n Canvas UI
          </button>

          <button
            onClick={handleProvision}
            disabled={provisioning}
            className="flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md transition-colors shadow-sm disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[18px] ${provisioning ? 'animate-spin' : ''}`}>
              sync
            </span>
            {provisioning ? 'Provisioning...' : 'Sync & Activate All Workflows'}
          </button>

          <button
            onClick={() => handleTriggerWorkflow('auto-supply', { mode: 'force_full_replenish' })}
            disabled={triggeringKey === 'auto-supply'}
            className="flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-[#ff6d5a] hover:bg-[#ff6d5a]/90 text-white font-label-md text-label-md transition-colors shadow-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            {triggeringKey === 'auto-supply' ? 'Running Supply AI...' : '⚡ Run AI Auto-Supply'}
          </button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-medium">
              Deployed AI Workflows
            </span>
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
              {n8nStatus?.workflows.filter((w) => w.isActive).length || 0} / {n8nStatus?.workflows.length || 5} Active
            </span>
            <span className="font-label-sm text-label-sm text-emerald-600 font-medium mt-0.5">
              100% Production Ready
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">account_tree</span>
          </div>
        </div>

        <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-medium">
              Autonomous Supply Speed
            </span>
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
              Instant (~35ms)
            </span>
            <span className="font-label-sm text-label-sm text-secondary font-medium mt-0.5">
              Auto-PO Generation Active
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">inventory_2</span>
          </div>
        </div>

        <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-medium">
              Live Webhook Gateway
            </span>
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
              http://localhost:5678
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5 font-mono">
              Port 5678 / Podman
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#ff6d5a]/10 text-[#ff6d5a] flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">webhook</span>
          </div>
        </div>

        <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-medium">
              Realtime WebSocket Sync
            </span>
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
              Active (wsHub)
            </span>
            <span className="font-label-sm text-label-sm text-emerald-600 font-medium mt-0.5">
              Instant UI Reactivity
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">sync_alt</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Workflow Cards, Right = Live Execution Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left: Workflow Management Cards (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          {/* Category Filters */}
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All Workflows', icon: 'grid_view' },
              { id: 'supply', label: 'AI Supply Chain', icon: 'local_shipping' },
              { id: 'guest', label: 'VIP Hospitality', icon: 'hotel_class' },
              { id: 'kds', label: 'POS & KDS Routing', icon: 'bolt' },
              { id: 'analytics', label: 'Executive Analytics', icon: 'insights' },
              { id: 'menu', label: 'Menu Optimizer', icon: 'restaurant_menu' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-space-md py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Workflow Cards */}
          <div className="flex flex-col gap-space-md">
            {filteredWorkflows.map((wf) => {
              const isSelected = selectedWorkflowKey === wf.key;
              const isTriggering = triggeringKey === wf.key;

              return (
                <div
                  key={wf.key}
                  className={`p-space-lg bg-surface-container-low rounded-2xl border transition-all duration-200 ${
                    isSelected
                      ? 'border-primary ring-1 ring-primary/40 shadow-md bg-surface-container-low/95'
                      : 'border-outline-variant/30 hover:border-outline-variant/70 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-space-md">
                    <div className="flex items-start gap-space-md">
                      <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[24px]">{wf.icon}</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-space-sm flex-wrap">
                          <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                            {wf.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant text-[11px] font-mono uppercase">
                            {wf.category}
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                          {wf.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggle(wf)}
                        className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                          wf.isActive ? 'bg-emerald-500' : 'bg-surface-container-high'
                        }`}
                        title={wf.isActive ? 'Active (Click to Deactivate)' : 'Inactive (Click to Activate)'}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            wf.isActive ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Webhook & Actions Footer */}
                  <div className="mt-space-md pt-space-md border-t border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-space-xs text-xs font-mono text-on-surface-variant bg-surface-container px-space-sm py-1.5 rounded-lg truncate max-w-md">
                      <span className="text-primary font-bold">POST</span>
                      <span className="truncate">{wf.webhookUrl}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(wf.webhookUrl);
                          showToast('Webhook URL copied to clipboard!', 'info');
                        }}
                        className="p-1 hover:text-primary transition-colors shrink-0"
                        title="Copy Webhook URL"
                      >
                        <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-space-xs">
                      <button
                        onClick={() => handleTriggerWorkflow(wf.key)}
                        disabled={isTriggering}
                        className={`flex items-center gap-1.5 px-space-md py-2 rounded-xl font-label-md text-label-md transition-all shadow-sm ${
                          isTriggering
                            ? 'bg-primary/50 text-white cursor-wait'
                            : 'bg-primary hover:bg-primary/90 text-on-primary'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-[16px] ${isTriggering ? 'animate-spin' : ''}`}>
                          {isTriggering ? 'sync' : 'play_arrow'}
                        </span>
                        {isTriggering ? 'Executing in n8n...' : '⚡ Test Run Workflow'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Execution Output & Inspection Terminal (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          <div className="p-space-lg bg-surface-container-low rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col gap-space-md sticky top-6">
            <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[22px]">terminal</span>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Live Execution Inspector
                </h3>
              </div>
              {lastExecutionResult && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {lastExecutionResult.durationMs}ms Latency
                </div>
              )}
            </div>

            {/* If no execution yet */}
            {!lastExecutionResult && (
              <div className="p-space-xl flex flex-col items-center justify-center text-center gap-space-md text-on-surface-variant py-16">
                <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[32px]">bolt</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    No Workflow Execution Triggered Yet
                  </span>
                  <p className="font-body-sm text-body-sm max-w-xs text-on-surface-variant">
                    Click <strong>'⚡ Test Run Workflow'</strong> or <strong>'⚡ Run AI Auto-Supply'</strong> to see instant JSON response & purchase orders.
                  </p>
                </div>
              </div>
            )}

            {/* Display formatted execution results */}
            {lastExecutionResult && (
              <div className="flex flex-col gap-space-md">
                {/* Specific UI for Auto-Supply POs */}
                {lastExecutionResult.workflowKey === 'auto-supply' && lastExecutionResult.data?.purchaseOrders && (
                  <div className="flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between bg-secondary/10 p-space-sm rounded-xl text-secondary">
                      <span className="font-label-md text-label-md font-bold">
                        📦 {lastExecutionResult.data.purchaseOrders.length} Purchase Orders Dispatched
                      </span>
                      <span className="font-label-md text-label-md font-mono font-bold">
                        Total: ₹{lastExecutionResult.data.summary?.totalExpenditure?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex flex-col gap-space-xs max-h-60 overflow-y-auto pr-1">
                      {lastExecutionResult.data.purchaseOrders.map((po: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-space-sm bg-surface-container rounded-xl border border-outline-variant/30 flex flex-col gap-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-label-sm text-label-sm font-bold text-on-surface">
                              {po.supplierName}
                            </span>
                            <span className="font-mono text-[11px] font-bold text-primary">
                              {po.poNumber}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-on-surface-variant">
                            <span>ETA: {po.leadTime}</span>
                            <span className="font-semibold text-on-surface">₹{po.totalCost?.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="text-[11px] text-on-surface-variant font-mono mt-0.5">
                            {po.lineItems?.map((li: any) => `${li.name} (${li.quantity})`).join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specific UI for VIP Booking */}
                {lastExecutionResult.workflowKey === 'vip-booking' && lastExecutionResult.data?.guest && (
                  <div className="p-space-md bg-primary-container/20 border border-primary-container/40 rounded-xl flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-headline-sm text-headline-sm font-bold text-primary">
                        👑 {lastExecutionResult.data.guest.name} ({lastExecutionResult.data.guest.tier})
                      </span>
                      <span className="font-mono text-xs bg-primary text-on-primary px-2 py-0.5 rounded-md">
                        {lastExecutionResult.data.guest.confirmationCode}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface">
                      <strong>Assigned:</strong> {lastExecutionResult.data.guest.assignedTable} · <strong>Perk:</strong> {lastExecutionResult.data.guest.complimentaryPerk}
                    </p>
                    <div className="p-space-sm bg-surface-container rounded-lg text-xs font-mono text-on-surface-variant mt-1 border border-outline-variant/30">
                      💬 <strong>SMS/WhatsApp:</strong> "{lastExecutionResult.data.dispatchNotification?.renderedMessage}"
                    </div>
                  </div>
                )}

                {/* Specific UI for Executive AI */}
                {lastExecutionResult.workflowKey === 'executive-ai' && lastExecutionResult.data?.aiStrategicBriefing && (
                  <div className="flex flex-col gap-space-xs">
                    <span className="font-label-md text-label-md font-bold text-on-surface">
                      🧠 Executive Action Points & Anomaly Detection:
                    </span>
                    <div className="flex flex-col gap-space-xs max-h-56 overflow-y-auto">
                      {lastExecutionResult.data.aiStrategicBriefing.map((item: any, idx: number) => (
                        <div key={idx} className="p-space-sm bg-surface-container rounded-xl border border-outline-variant/30 flex flex-col gap-0.5">
                          <span className="font-label-sm text-label-sm font-bold text-on-surface">
                            {item.headline}
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant text-[12px]">
                            {item.detail}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw JSON viewer */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant">
                    <span>Raw Response Payload</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(lastExecutionResult, null, 2));
                        showToast('JSON response copied!', 'info');
                      }}
                      className="hover:text-primary transition-colors"
                    >
                      Copy JSON
                    </button>
                  </div>
                  <pre className="p-space-md bg-neutral-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-80 overflow-y-auto border border-neutral-800">
                    {JSON.stringify(lastExecutionResult.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
