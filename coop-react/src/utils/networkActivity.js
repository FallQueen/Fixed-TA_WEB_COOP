let pendingRequests = 0;
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => listener(pendingRequests));
};

const updatePendingRequests = (delta) => {
  pendingRequests = Math.max(0, pendingRequests + delta);
  notifyListeners();
};

const registerInterceptor = (axiosInstance) => {
  if (!axiosInstance || axiosInstance.__coopLoadingInterceptorInstalled) {
    return;
  }

  axiosInstance.__coopLoadingInterceptorInstalled = true;

  axiosInstance.interceptors.request.use(
    (config) => {
      updatePendingRequests(1);
      return config;
    },
    (error) => {
      updatePendingRequests(-1);
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      updatePendingRequests(-1);
      return response;
    },
    (error) => {
      updatePendingRequests(-1);
      return Promise.reject(error);
    }
  );
};

export const setupGlobalNetworkActivity = (axiosInstances = []) => {
  axiosInstances.forEach(registerInterceptor);
};

export const subscribeToNetworkActivity = (listener) => {
  listeners.add(listener);
  listener(pendingRequests);

  return () => {
    listeners.delete(listener);
  };
};
