import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useApplicationStore } from '../../store/applicationStore';

export interface FormFieldMeta {
  id: string;
  fieldType: string;
  label?: string;
  description?: string;
  isRequired?: boolean;
  isReadOnly?: boolean;
  placeholder?: string;
  options?: { choices?: { value: string; label: string }[] };
}

interface DynamicFieldProps {
  fieldMeta: FormFieldMeta;
  questionId: string;
  readOnly?: boolean;
}

export const DynamicField: React.FC<DynamicFieldProps> = ({ fieldMeta, questionId, readOnly }) => {
  const { control } = useFormContext();
  const queueAnswer = useApplicationStore((state) => state.queueAnswer);

  const handleChange = (val: unknown) => {
    // Queue for autosave
    const payload = {
      questionId,
      formFieldId: fieldMeta.id,
      valueText: ['TEXT', 'TEXTAREA', 'EMAIL', 'PHONE', 'URL'].includes(fieldMeta.fieldType) ? String(val) : null,
      valueNumeric: ['NUMBER', 'DECIMAL'].includes(fieldMeta.fieldType) ? Number(val) : null,
      valueBoolean: ['BOOLEAN', 'CHECKBOX'].includes(fieldMeta.fieldType) ? Boolean(val) : null,
      valueDate: ['DATE', 'TIME', 'DATETIME'].includes(fieldMeta.fieldType) ? String(val) : null,
      valueJson: ['SELECT', 'MULTISELECT', 'RADIO', 'FILE', 'IMAGE', 'TABLE', 'REPEATABLE_GROUP'].includes(fieldMeta.fieldType) ? val : null,
    };
    queueAnswer(payload);
  };

  const renderInput = (fieldProps: { name: string; value: unknown; onChange: (val: unknown) => void; onBlur: () => void }) => {
    const { value, onChange, onBlur, name } = fieldProps;
    
    const baseInputProps = {
      id: fieldMeta.id,
      name,
      value: (value as string | number | readonly string[] | undefined) || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        onChange(val);
        handleChange(val);
      },
      onBlur,
      placeholder: fieldMeta.placeholder,
      disabled: Boolean(readOnly || fieldMeta.isReadOnly),
      className: "w-full border rounded p-2 text-sm",
    };

    switch (fieldMeta.fieldType) {
      case 'TEXT':
      case 'EMAIL':
      case 'PHONE':
      case 'URL':
        return <input type="text" {...baseInputProps} />;
      
      case 'TEXTAREA':
      case 'RICH_TEXT':
        return <textarea {...baseInputProps} rows={4} />;
      
      case 'NUMBER':
      case 'DECIMAL':
        return <input type="number" {...baseInputProps} />;
      
      case 'BOOLEAN':
      case 'CHECKBOX':
        return (
          <input 
            type="checkbox" 
            id={fieldMeta.id}
            name={name}
            checked={Boolean(value)}
            onChange={(e) => {
              onChange(e.target.checked);
              handleChange(e.target.checked);
            }}
            disabled={Boolean(readOnly || fieldMeta.isReadOnly)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300"
          />
        );
      
      case 'RADIO':
      case 'SELECT': {
        const options = fieldMeta.options?.choices || [];
        return (
          <select {...baseInputProps}>
            <option value="">Select an option</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      }

      case 'DATE':
      case 'TIME':
      case 'DATETIME':
        return <input type={fieldMeta.fieldType.toLowerCase()} {...baseInputProps} />;

      // Fallback for complex types
      case 'FILE':
      case 'IMAGE':
      case 'MULTISELECT':
      case 'TABLE':
      case 'REPEATABLE_GROUP':
        return (
          <div className="p-4 border border-dashed rounded bg-gray-50 text-xs text-gray-500">
            {fieldMeta.fieldType} renderer not fully implemented in standard input view.
          </div>
        );

      default:
        return <input type="text" {...baseInputProps} />;
    }
  };

  return (
    <div className="mb-4">
      <label htmlFor={fieldMeta.id} className="block text-sm font-medium text-gray-700 mb-1">
        {fieldMeta.label}
        {fieldMeta.isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      {fieldMeta.description && (
        <p className="text-xs text-gray-500 mb-2">{fieldMeta.description}</p>
      )}
      <Controller
        name={fieldMeta.id}
        control={control}
        rules={{ required: fieldMeta.isRequired ? 'This field is required' : false }}
        render={({ field, fieldState }) => (
          <div>
            {renderInput(field)}
            {fieldState.error && (
              <p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
            )}
          </div>
        )}
      />
    </div>
  );
};
