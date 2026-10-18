import { QueryClient } from '@tanstack/react-query'

/** The app's single React Query client — module-level so session cleanup can reach it outside React. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})
