import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { COLORS } from "./theme/colors";
import { FONT_BODY } from "./theme/fonts";
import { TopBar } from "./components/layout/TopBar";
import { BottomNav } from "./components/layout/BottomNav";
import { GroupTabs } from "./components/layout/GroupTabs";
import { CompanyView } from "./views/CompanyView";
import { AddCompany } from "./components/company/AddCompany";
import { useCompanies } from "./hooks/useCompanies";
import { useGroups } from "./hooks/useGroups";
import { useQuotes } from "./hooks/useQuotes";
import { useCriteria } from "./hooks/useCriteria";
import { useStrategies } from "./hooks/useStrategies";
import { useSignalRules } from "./hooks/useSignalRules";
import { useMetricSettings } from "./hooks/useMetricSettings";
import { useWatchHistory } from "./hooks/useWatchHistory";
import { useAuth } from "./hooks/useAuth";
import { ChecklistView } from "./views/ChecklistView";
import { ScreenerView } from "./views/ScreenerView";
import { SignalsView } from "./views/SignalsView";
import { SettingsView } from "./views/SettingsView";
import { AuthScreen } from "./components/auth/AuthScreen";
import { computeSignals } from "./utils/signals";

export default function App() {
  const { user, loading, error: authError, login, register, logout, resetPassword } = useAuth();

  const [activeTab, setActiveTab] = useState("company");
  const [activeGroup, setActiveGroup] = useState(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [showAddSearch, setShowAddSearch] = useState(false);

  const userId = user?.uid;
  const { companies, addCompany, updateCompany, deleteCompany, reorderCompanies } = useCompanies(userId);
  const { groups, addGroup, deleteGroup } = useGroups(userId);
  const watchTickers = companies.map((c) => c.ticker).filter(Boolean);
  const quotes = useQuotes(watchTickers);
  const { criteria, addCriterion, updateCriterion, deleteCriterion } = useCriteria(userId);
  const { strategies, createStrategy, updateStrategy, deleteStrategy } = useStrategies(userId);
  const { rules: signalRules, addRule: addSignalRule, updateRule: updateSignalRule, deleteRule: deleteSignalRule } = useSignalRules(userId);
  const { settings: metricSettings, addMetric, removeMetric } = useMetricSettings(userId);

  // One-time migration: criteria with both an expr and a signal field move to signalRules.
  const migratedRef = useRef(new Set());
  useEffect(() => {
    if (!userId) return;
    for (const c of criteria) {
      if (!c.expr || !c.signal) continue;
      if (migratedRef.current.has(c.id)) continue;
      migratedRef.current.add(c.id);
      addSignalRule({
        id: c.id,
        name: c.text || "Migrated rule",
        expr: c.expr,
        signal: c.signal,
        category: c.category || "General",
      });
      updateCriterion(c.id, { signal: null });
    }
  }, [userId, criteria, addSignalRule, updateCriterion]);

  const hasSignalRules = signalRules.length > 0;
  const histories = useWatchHistory(hasSignalRules ? watchTickers : []);
  const signals = useMemo(() => {
    if (!hasSignalRules) return {};
    const out = {};
    for (const c of companies) {
      if (!c.ticker) continue;
      const h = histories[c.ticker];
      if (!h) continue;
      out[c.id] = computeSignals(signalRules, h);
    }
    return out;
  }, [companies, signalRules, histories, hasSignalRules]);

  const handleAdd = useCallback(() => {
    setShowAddSearch(true);
  }, []);

  const handleAddFromSearch = useCallback(
    (ticker, name) => {
      addCompany({ ticker, name });
    },
    [addCompany]
  );

  const handleSelect = useCallback((id) => {
    setSelectedCompanyId(id);
  }, []);

  const handleSave = useCallback(
    (form) => {
      if (form.id) {
        updateCompany(form.id, form);
      } else {
        addCompany(form);
      }
    },
    [addCompany, updateCompany]
  );

  const handleDelete = useCallback(
    (id) => {
      deleteCompany(id);
      setSelectedCompanyId(null);
    },
    [deleteCompany]
  );

  const handleClose = useCallback(() => {
    setSelectedCompanyId(null);
  }, []);

  const handleDeleteGroup = useCallback(
    (groupId) => {
      deleteGroup(groupId);
      companies.forEach((c) => {
        if (c.groupIds?.includes(groupId)) {
          updateCompany(c.id, {
            groupIds: c.groupIds.filter((id) => id !== groupId),
          });
        }
      });
      if (activeGroup === groupId) setActiveGroup(null);
    },
    [deleteGroup, companies, updateCompany, activeGroup]
  );

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.bg, color: COLORS.textMuted }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={login} onRegister={register} onResetPassword={resetPassword} error={authError} />;
  }

  return (
    <div
      style={{
        fontFamily: FONT_BODY,
        background: COLORS.bg,
        color: COLORS.text,
        minHeight: "100vh",
      }}
    >
      {activeTab === "company" && (
        <>
          <TopBar onLogout={logout} />
          <GroupTabs
            groups={groups}
            activeGroup={activeGroup}
            onSelect={setActiveGroup}
            onAddGroup={addGroup}
            onDeleteGroup={handleDeleteGroup}
            onSearch={handleAdd}
          />
        </>
      )}
      <div style={{ paddingTop: activeTab === "company" ? 100 : 16, paddingBottom: 70 }}>
        {activeTab === "company" && (
          <CompanyView
            companies={companies}
            activeGroup={activeGroup}
            selectedId={selectedCompanyId}
            onSelect={handleSelect}
            onSave={handleSave}
            onDelete={handleDelete}
            onClose={handleClose}
            allGroups={groups}
            quotes={quotes}
            onReorder={reorderCompanies}
            criteria={criteria}
            signals={signals}
          />
        )}
        {activeTab === "checklist" && (
          <ChecklistView
            criteria={criteria}
            onAdd={addCriterion}
            onUpdate={updateCriterion}
            onDelete={deleteCriterion}
          />
        )}
        {activeTab === "screener" && (
          <ScreenerView
            strategies={strategies}
            createStrategy={createStrategy}
            updateStrategy={updateStrategy}
            deleteStrategy={deleteStrategy}
            existingTickers={companies.map((c) => c.ticker).filter(Boolean)}
            onAddToWatch={(ticker) => addCompany({ ticker, name: ticker })}
          />
        )}
        {activeTab === "signals" && (
          <SignalsView
            rules={signalRules}
            onAdd={addSignalRule}
            onUpdate={updateSignalRule}
            onDelete={deleteSignalRule}
          />
        )}
        {activeTab === "settings" && (
          <SettingsView
            metricSettings={metricSettings}
            addMetric={addMetric}
            removeMetric={removeMetric}
          />
        )}
      </div>
      <BottomNav active={activeTab} onSelect={setActiveTab} />
      {showAddSearch && (
        <AddCompany
          onAdd={handleAddFromSearch}
          onClose={() => setShowAddSearch(false)}
          existingTickers={companies.map((c) => c.ticker)}
        />
      )}
    </div>
  );
}
