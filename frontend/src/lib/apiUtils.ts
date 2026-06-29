export const safeArray = <T>(response: any, context: string, addToast?: (msg: string, type?: string) => void): T[] => {
  // Axios responses have data under `response.data`
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) {
    return payload as T[];
  }
  // Support paginated object with `results` array
  if (payload && Array.isArray(payload.results)) {
    return payload.results as T[];
  }
  console.error(`Unexpected ${context} array`, response);
  if (addToast) addToast(`Unexpected ${context} data`, 'error');
  return [];
};

export const safeObject = <T>(response: any, context: string, addToast?: (msg: string, type?: string) => void): T => {
  const payload = response?.data ?? response;
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    return payload as T;
  }
  console.error(`Unexpected ${context} object`, response);
  if (addToast) addToast(`Unexpected ${context} data`, 'error');
  return {} as T;
};

// Utility to safely fetch list endpoints with error handling
export const fetchList = async <T>(apiCall: Promise<any>, context: string, addToast?: (msg: string, type?: string) => void): Promise<T[]> => {
  try {
    const { results } = await fetchPaginated<T>(apiCall, context, addToast);
    return results ?? [];
  } catch (err) {
    console.error(`Error fetching ${context}`, err);
    if (!err?.response) {
      if (addToast) addToast('Network error – please check your connection', 'error');
    } else if (err?.response?.status === 401) {
      if (addToast) addToast('Unauthorized – please log in', 'error');
    } else if (err?.response?.status >= 500) {
      if (addToast) addToast('Server error – please try again later', 'error');
    } else if (addToast) {
      addToast(`Failed to fetch ${context}`, 'error');
    }
    return [];
  }
};

export const fetchPaginated = async <T>(apiCall: Promise<any>, context: string, addToast?: (msg: string, type?: string) => void): Promise<{ results: T[]; count?: number; next?: string; previous?: string }> => {
  try {
    const res = await apiCall;
    const raw = res?.data ?? res ?? {};
    let results: T[] = [];
    if (Array.isArray(raw)) {
      results = raw;
    } else if (raw && Array.isArray(raw.results)) {
      results = raw.results;
    } else {
      if (addToast) addToast(`Invalid ${context} response format`, 'error');
      console.error(`Invalid ${context} response format`, res);
    }
    return {
      results,
      count: typeof raw?.count === 'number' ? raw.count : undefined,
      next: typeof raw?.next === 'string' ? raw.next : undefined,
      previous: typeof raw?.previous === 'string' ? raw.previous : undefined,
    };
    } catch (err) {
      console.error(`Error fetching ${context}`, err);
      if (!err?.response) {
        if (addToast) addToast('Network error – please check your connection', 'error');
      } else if (err?.response?.status === 401) {
        if (addToast) addToast('Unauthorized – please log in', 'error');
      } else if (err?.response?.status >= 500) {
        if (addToast) addToast('Server error – please try again later', 'error');
      } else if (addToast) {
        addToast(`Failed to fetch ${context}`, 'error');
      }
      return { results: [] };
    }
};
