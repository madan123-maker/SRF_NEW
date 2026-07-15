import { create } from 'zustand';
import { ApplicationAPI } from '../services/application.api';

type SaveStatus = 'IDLE' | 'SAVING' | 'SAVED' | 'FAILED';

interface AnswerPayload {
  questionId: string;
  formFieldId: string;
  valueText?: string | null;
  valueNumeric?: number | null;
  valueBoolean?: boolean | null;
  valueDate?: string | null;
  valueJson?: unknown | null;
}

interface ApplicationState {
  activeApplicationId: string | null;
  saveStatus: SaveStatus;
  pendingAnswers: Record<string, AnswerPayload>; // Key is formFieldId
  setActiveApplicationId: (id: string) => void;
  queueAnswer: (answer: AnswerPayload) => void;
  triggerAutosave: () => Promise<void>;
}

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  activeApplicationId: null,
  saveStatus: 'IDLE',
  pendingAnswers: {},

  setActiveApplicationId: (id) => set({ activeApplicationId: id }),

  queueAnswer: (answer) => {
    set((state) => ({
      pendingAnswers: {
        ...state.pendingAnswers,
        [answer.formFieldId]: answer
      },
      saveStatus: 'SAVING'
    }));
  },

  triggerAutosave: async () => {
    const { activeApplicationId, pendingAnswers } = get();
    const answersArray = Object.values(pendingAnswers);

    if (!activeApplicationId || answersArray.length === 0) {
      return;
    }

    try {
      set({ saveStatus: 'SAVING' });
      // We clear the pending immediately to capture any changes that happen DURING the request
      set({ pendingAnswers: {} });

      await ApplicationAPI.updateAnswers(activeApplicationId, answersArray);
      
      set({ saveStatus: 'SAVED' });
      // Revert to IDLE after a short delay
      setTimeout(() => set((state) => state.saveStatus === 'SAVED' ? { saveStatus: 'IDLE' } : state), 3000);
    } catch (error) {
      console.error('Autosave failed:', error);
      // Restore failed answers back to queue if they haven't been overwritten
      set((state) => {
        const newPending = { ...state.pendingAnswers };
        answersArray.forEach(ans => {
          if (!newPending[ans.formFieldId]) {
            newPending[ans.formFieldId] = ans;
          }
        });
        return { pendingAnswers: newPending, saveStatus: 'FAILED' };
      });
    }
  }
}));
