import { useState, useCallback } from "react";
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
import { useChecklist } from "./hooks/useChecklist";
import { useAuth } from "./hooks/useAuth";
import { ChecklistView } from "./views/ChecklistView";
import { AuthScreen } from "./components/auth/AuthScreen";

export default function App() {
  const { user, loading, error: authError, login, register, logout, resetPassword } = useAuth();

  const [activeTab, setActiveTab] = useState("company");
  const [activeGroup, setActiveGroup] = useState(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [showAddSearch, setShowAddSearch] = useState(false);

  const userId = user?.uid;
  const { companies, addCompany, updateCompany, deleteCompany, reorderCompanies } = useCompanies(userId);
  const { groups, addGroup, deleteGroup } = useGroups(userId);
  const quotes = useQuotes(companies.map((c) => c.ticker).filter(Boolean));
  const { items: checklistItems, addItem, toggleItem, updateItem, deleteItem } = useChecklist(userId);

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
      <TopBar onLogout={logout} />
      <GroupTabs
        groups={groups}
        activeGroup={activeGroup}
        onSelect={setActiveGroup}
        onAddGroup={addGroup}
        onDeleteGroup={handleDeleteGroup}
        onSearch={handleAdd}
      />
      <div style={{ paddingTop: 100, paddingBottom: 70 }}>
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
          />
        )}
        {activeTab === "checklist" && (
          <ChecklistView
            items={checklistItems}
            onAdd={addItem}
            onToggle={toggleItem}
            onUpdate={updateItem}
            onDelete={deleteItem}
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
