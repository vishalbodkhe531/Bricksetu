import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  currentTab: string;
  isSidebarCollapsed: boolean;
  isQuickEntryOpen: boolean;
  refreshKey: number;
}

const initialState: UIState = {
  currentTab: 'dashboard',
  isSidebarCollapsed: false,
  isQuickEntryOpen: false,
  refreshKey: 0,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrentTab: (state, action: PayloadAction<string>) => {
      state.currentTab = action.payload;
    },
    toggleSidebarCollapse: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    openQuickEntry: (state) => {
      state.isQuickEntryOpen = true;
    },
    closeQuickEntry: (state) => {
      state.isQuickEntryOpen = false;
    },
    triggerRefresh: (state) => {
      state.refreshKey += 1;
    },
  },
});

export const {
  setCurrentTab,
  toggleSidebarCollapse,
  setSidebarCollapsed,
  openQuickEntry,
  closeQuickEntry,
  triggerRefresh,
} = uiSlice.actions;

export default uiSlice.reducer;
