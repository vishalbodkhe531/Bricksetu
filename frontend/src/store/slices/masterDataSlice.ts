import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/shared/api/client';

interface MasterDataState {
  batches: any[];
  workers: any[];
  suppliers: any[];
  materials: any[];
  customers: any[];
  brickTypes: any[];
  brickGrades: any[];
  paymentMethods: any[];
  expenseCategories: any[];
  vehicles: any[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: MasterDataState = {
  batches: [],
  workers: [],
  suppliers: [],
  materials: [],
  customers: [],
  brickTypes: [],
  brickGrades: [],
  paymentMethods: [],
  expenseCategories: [],
  vehicles: [],
  loading: false,
  error: null,
  lastFetched: null,
};

export const fetchMasterData = createAsyncThunk(
  'masterData/fetchMasterData',
  async (_, { rejectWithValue }) => {
    try {
      const [b, w, s, m, c, master, v] = await Promise.all([
        apiRequest('/batches'),
        apiRequest('/workers'),
        apiRequest('/suppliers'),
        apiRequest('/materials'),
        apiRequest('/customers'),
        apiRequest('/settings/master-data'),
        apiRequest('/transport/vehicles'),
      ]);

      return {
        batches: Array.isArray(b) ? b.filter((item: any) => item.stage === 'MOULDING' && item.status === 'IN_PROGRESS') : [],
        workers: Array.isArray(w) ? w.filter((item: any) => item.is_active) : [],
        suppliers: Array.isArray(s) ? s.filter((item: any) => item.is_active) : [],
        materials: Array.isArray(m) ? m.filter((item: any) => item.is_active) : [],
        customers: Array.isArray(c) ? c.filter((item: any) => item.is_active) : [],
        brickTypes: master?.brick_types || [],
        brickGrades: master?.brick_grades || [],
        paymentMethods: master?.payment_methods || [],
        expenseCategories: master?.expense_categories || [],
        vehicles: Array.isArray(v) ? v : [],
      };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch master data');
    }
  }
);

export const masterDataSlice = createSlice({
  name: 'masterData',
  initialState,
  reducers: {
    invalidateMasterData: (state) => {
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMasterData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMasterData.fulfilled, (state, action) => {
        state.batches = action.payload.batches;
        state.workers = action.payload.workers;
        state.suppliers = action.payload.suppliers;
        state.materials = action.payload.materials;
        state.customers = action.payload.customers;
        state.brickTypes = action.payload.brickTypes;
        state.brickGrades = action.payload.brickGrades;
        state.paymentMethods = action.payload.paymentMethods;
        state.expenseCategories = action.payload.expenseCategories;
        state.vehicles = action.payload.vehicles;
        state.loading = false;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(fetchMasterData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { invalidateMasterData } = masterDataSlice.actions;
export default masterDataSlice.reducer;
