interface TextFieldProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  multiline?: boolean;
}

export default function TextField({ label, value, onChange, multiline }: TextFieldProps) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {multiline ? (
        <textarea rows={3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="field-input" />
      ) : (
        <input type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="field-input" />
      )}
    </div>
  );
}
