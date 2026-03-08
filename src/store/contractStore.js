import { create } from 'zustand';
import { contractService } from '../services';

const useContractStore = create((set) => ({
  contracts: [],
  isLoading: false,
  error: null,

  fetchContracts: async () => {
    set({ isLoading: true, error: null });
    try {
      const contracts = await contractService.getAll();
      set({ contracts, isLoading: false });
      return contracts;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createContract: async (contractData) => {
    set({ isLoading: true, error: null });
    try {
      const newContract = await contractService.create(contractData);
      set(state => ({
        contracts: [newContract, ...state.contracts],
        isLoading: false
      }));
      return newContract;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  renewContract: async (id, startDate, endDate) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await contractService.renew(id, startDate, endDate);
      set(state => ({
        contracts: state.contracts.map(c => c.id === id ? updated : c),
        isLoading: false
      }));
      return updated;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  cancelContract: async (id, userId) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await contractService.cancel(id, userId);
      set(state => ({
        contracts: state.contracts.map(c => c.id === id ? updated : c),
        isLoading: false
      }));
      return updated;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));

export default useContractStore;
