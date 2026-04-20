import { Field } from "../shared/Field";

export function NotesTab({ form, setField }) {
  return (
    <div>
      <Field
        label="Key Risks"
        value={form.risks}
        onChange={(v) => setField("risks", v)}
        placeholder="Key risks and concerns..."
        textarea
      />
      <Field
        label="General Research Notes"
        value={form.generalNotes}
        onChange={(v) => setField("generalNotes", v)}
        placeholder="Research notes, insights, observations..."
        textarea
      />
    </div>
  );
}
