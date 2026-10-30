import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

import axios, { isAxiosError, isCancel } from 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    /**
     * `localStorage` key that answers this request when no server does: no host responds,
     * the route answers 404 or 405, or a success body is a string (axios leaves a body it
     * cannot parse as JSON a string, e.g. a static host's HTML fallback page).
     *
     * A `GET` then resolves the stored JSON, or `null` when none is stored. Any other
     * method stores its JSON request body and resolves that body. Other failures and
     * cancellations still reject, as do an unparsable stored value and a full storage.
     * Local data is never sent to a server that appears later.
     *
     * @example
     * const { data } = await request.get('/api/draft', { localKey: '/api/draft' })
     */
    localKey?: string;
  }
}

const isServerAbsent = (error: AxiosError): boolean =>
  error.response === undefined ||
  error.response.status === 404 ||
  error.response.status === 405;

function answerFromLocal(
  config: InternalAxiosRequestConfig,
  key: string,
): AxiosResponse {
  let data: unknown;
  if (config.method === 'get') {
    const raw = localStorage.getItem(key);
    data = raw === null ? null : JSON.parse(raw);
  } else {
    // axios has already serialized an object body to JSON text by now.
    if (typeof config.data !== 'string') {
      throw new TypeError(
        `A ${config.method} request with "localKey" needs a JSON body.`,
      );
    }
    localStorage.setItem(key, config.data);
    data = JSON.parse(config.data);
  }
  return { config, data, headers: {}, status: 200, statusText: 'OK' };
}

/** The one axios instance for `src/api`. Shared defaults and interceptors belong here. */
export const request = axios.create();

request.interceptors.response.use(
  (response) => {
    const { localKey } = response.config;
    if (localKey === undefined || typeof response.data !== 'string') {
      return response;
    }
    return answerFromLocal(response.config, localKey);
  },
  (error: unknown) => {
    if (!isAxiosError(error) || isCancel(error)) throw error;
    const { config } = error;
    if (config?.localKey === undefined || !isServerAbsent(error)) throw error;
    return answerFromLocal(config, config.localKey);
  },
);
