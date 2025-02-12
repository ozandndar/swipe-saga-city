import { create } from 'zustand';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Dilemma } from '@/types/dilemma';

interface DilemmaState {
  dilemmas: Dilemma[];
  isLoading: boolean;
  error: string | null;
  fetchDilemmas: () => Promise<void>;
}

export const useDilemmaStore = create<DilemmaState>((set) => ({
  dilemmas: [],
  isLoading: false,
  error: null,
  fetchDilemmas: async () => {
    try {
      set({ isLoading: true });
      const querySnapshot = await getDocs(collection(db, 'dilemma'));
      console.log('Firestore response:', querySnapshot.docs.length, 'documents');
      console.log('First doc:', querySnapshot.docs[0]?.data());
      
      const dilemmas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Dilemma[];
      set({ dilemmas, isLoading: false });
    } catch (error) {
      console.error('Firestore error:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
})); 