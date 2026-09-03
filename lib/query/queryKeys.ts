/**
 * Centralized query key factory.
 * Using typed tuple keys avoids typos and makes cache invalidation precise.
 * Pattern: queryKeys.feature.all | .list(orgId) | .detail(id)
 */
export const queryKeys = {
  workers: {
    all: ['workers'] as const,
    list: (orgId: string) => [...queryKeys.workers.all, 'list', orgId] as const,
    detail: (id: string) => [...queryKeys.workers.all, 'detail', id] as const,
    settlements: (orgId: string) => [...queryKeys.workers.all, 'settlements', orgId] as const,
  },

  production: {
    all: ['production'] as const,
    list: (orgId: string, date?: string) =>
      [...queryKeys.production.all, 'list', orgId, date] as const,
    detail: (id: string) => [...queryKeys.production.all, 'detail', id] as const,
    batches: (orgId: string) => [...queryKeys.production.all, 'batches', orgId] as const,
  },

  inventory: {
    all: ['inventory'] as const,
    list: (orgId: string) => [...queryKeys.inventory.all, 'list', orgId] as const,
    stock: (orgId: string) => [...queryKeys.inventory.all, 'stock', orgId] as const,
    transactions: (orgId: string) =>
      [...queryKeys.inventory.all, 'transactions', orgId] as const,
  },

  customers: {
    all: ['customers'] as const,
    list: (orgId: string) => [...queryKeys.customers.all, 'list', orgId] as const,
    detail: (id: string) => [...queryKeys.customers.all, 'detail', id] as const,
  },

  salesOrders: {
    all: ['sales-orders'] as const,
    list: (orgId: string) => [...queryKeys.salesOrders.all, 'list', orgId] as const,
    detail: (id: string) => [...queryKeys.salesOrders.all, 'detail', id] as const,
  },

  payments: {
    all: ['payments'] as const,
    list: (orgId: string) => [...queryKeys.payments.all, 'list', orgId] as const,
    detail: (id: string) => [...queryKeys.payments.all, 'detail', id] as const,
  },

  dashboard: {
    all: ['dashboard'] as const,
    summary: (orgId: string) => [...queryKeys.dashboard.all, 'summary', orgId] as const,
  },
} as const;
