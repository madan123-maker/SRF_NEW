import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useApplicationStore } from '../../store/applicationStore';
import { DynamicField, FormFieldMeta } from '../DynamicRenderer/DynamicField';
import { useSubmitApplication } from '../../hooks/useApplication';

type AnswerType = {
  formFieldId: string;
  valueText?: unknown;
  valueNumeric?: unknown;
  valueBoolean?: unknown;
  valueDate?: unknown;
  valueJson?: unknown;
};

type QuestionType = {
  id: string;
  text?: string;
  helpText?: string;
  formFields?: FormFieldMeta[];
};

type ActionPointType = {
  id: string;
  title?: string;
  questions?: QuestionType[];
};

type ReformAreaType = {
  id: string;
  name?: string;
  actionPoints?: ActionPointType[];
};

interface ApplicationWorkspaceProps {
  application: {
    id: string;
    status: string;
    answers?: AnswerType[];
  };
  edition: {
    name?: string;
    reformAreas?: ReformAreaType[];
  };
  readOnly?: boolean;
}

export const ApplicationWorkspace: React.FC<ApplicationWorkspaceProps> = ({ application, edition, readOnly }) => {
  const [activeTab, setActiveTab] = useState(edition?.reformAreas?.[0]?.id || null);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  const triggerAutosave = useApplicationStore(state => state.triggerAutosave);
  const pendingAnswers = useApplicationStore(state => state.pendingAnswers);
  const saveStatus = useApplicationStore(state => state.saveStatus);
  const { mutate: submitApplication, isPending: isSubmitting } = useSubmitApplication();

  const methods = useForm({
    defaultValues: application.answers?.reduce((acc: Record<string, unknown>, ans: AnswerType) => {
      acc[ans.formFieldId] = ans.valueText ?? ans.valueNumeric ?? ans.valueBoolean ?? ans.valueDate ?? ans.valueJson;
      return acc;
    }, {}) || {}
  });

  // Debounced Autosave Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(pendingAnswers).length > 0) {
        triggerAutosave();
      }
    }, 3000); // 3 seconds debounce

    return () => clearTimeout(timer);
  }, [pendingAnswers, triggerAutosave]);

  const handleSubmit = async () => {
    // Force one final save before submission if anything is pending
    if (Object.keys(pendingAnswers).length > 0) {
      await triggerAutosave();
    }
    submitApplication(application.id);
  };

  const activeArea = edition?.reformAreas?.find((ra: ReformAreaType) => ra.id === activeTab);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Header & Status */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-xl font-semibold">{edition?.name}</h2>
          <p className="text-sm text-gray-500">Status: <span className="font-medium">{application.status}</span></p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            {saveStatus === 'SAVING' && <span className="text-yellow-600">Saving...</span>}
            {saveStatus === 'SAVED' && <span className="text-green-600">Saved</span>}
            {saveStatus === 'FAILED' && <span className="text-red-600">Save Failed</span>}
          </div>
          {!readOnly && application.status === 'DRAFT' && (
            <button
              onClick={methods.handleSubmit(handleSubmit)}
              disabled={isSubmitting || saveStatus === 'SAVING'}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto">
        {edition?.reformAreas?.map((ra: ReformAreaType) => (
          <button
            key={ra.id}
            onClick={() => setActiveTab(ra.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === ra.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {ra.name}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <FormProvider {...methods}>
          <form className="space-y-6 max-w-4xl mx-auto">
            {activeArea?.actionPoints?.map((ap: ActionPointType) => (
              <div key={ap.id} className="bg-white border rounded shadow-sm">
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === ap.id ? null : ap.id)}
                  className="w-full px-4 py-3 flex justify-between items-center text-left hover:bg-gray-50"
                >
                  <span className="font-semibold text-gray-800">{ap.title}</span>
                  <span>{activeAccordion === ap.id ? '▲' : '▼'}</span>
                </button>
                
                {activeAccordion === ap.id && (
                  <div className="p-4 border-t space-y-6">
                    {ap.questions?.map((q: QuestionType) => (
                      <div key={q.id} className="p-4 bg-gray-50 border rounded">
                        <h4 className="font-medium text-gray-900 mb-2">{q.text}</h4>
                        {q.helpText && <p className="text-sm text-gray-500 mb-4">{q.helpText}</p>}
                        
                        <div className="space-y-4">
                          {q.formFields?.map((ff: FormFieldMeta) => (
                            <DynamicField 
                              key={ff.id} 
                              fieldMeta={ff} 
                              questionId={q.id}
                              readOnly={readOnly || application.status !== 'DRAFT'} 
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </form>
        </FormProvider>
      </div>
    </div>
  );
};
