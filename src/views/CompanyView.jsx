import { CompanyList } from "../components/company/CompanyList";
import { CompanyDetail } from "../components/company/CompanyDetail";

export function CompanyView({
  companies,
  activeGroup,
  selectedId,
  onSelect,
  onSave,
  onDelete,
  onClose,
  allGroups,
  quotes,
  onReorder,
}) {
  const company = selectedId ? companies.find((c) => c.id === selectedId) : null;

  return (
    <>
      <CompanyList
        companies={companies}
        activeGroup={activeGroup}
        onSelect={onSelect}
        quotes={quotes}
        onReorder={onReorder}
      />
      {company && (
        <CompanyDetail
          company={company}
          quote={quotes[company.ticker]}
          onSave={onSave}
          onDelete={onDelete}
          onClose={onClose}
          allGroups={allGroups}
        />
      )}
    </>
  );
}
