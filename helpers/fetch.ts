export type GenericResponse = {
  ok: boolean;
  status: number;
  data?: any;
  error?: string;
};

export const apiFetch = async (
  url: string,
  options?: RequestInit,
): Promise<GenericResponse> => {
  return fetch(url, options)
    .then(async (res) => {
      const json = await res.json();
      const response: GenericResponse = {
        ok: res.ok,
        status: res.status,
      };
      if (res.ok) {
        response.data = json;
      } else {
        response.error =
          json._message || 'Something went wrong. Please try again later.';
      }
      return response;
    })
    .catch(async (err) => {
      return {
        ok: false,
        status: err.status || 500,
        error: err.message || 'Something went wrong. Please try again later.',
      };
    });
};

// #000000
// #250029
// #36023A
// #420E45
// #4E1B51
// #5B275D
// #683269
// #753E76
// #824A83
// #9D629D
// #B97BB8
// #D696D4
// #F4B0F1
// #FFD6FA
// #FFEBF9
// #FFF7FA
// #FFFBFF
// #FFFFFF
