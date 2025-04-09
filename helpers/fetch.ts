export type GenericResponse = {
  ok: boolean;
  status: number;
  data?: any;
  error?: string;
};

export const apiFetch = async (
  url: string,
  options?: RequestInit,
): Promise<any> => {
  return fetch(url, options)
    .then(async (res) => {
      const json = await res.json();
      const response: GenericResponse = {
        ok: res.ok,
        status: res.status,
      };
      if (res.ok) {
        response.data = json;
        return response;
      } else {
        response.error =
          json._message || 'Something went wrong. Please try again later.';
      }
    })
    .catch(async (err) => {
      return {
        ok: false,
        status: err.status || 500,
        error: err.message || 'Something went wrong. Please try again later.',
      };
    });
};
