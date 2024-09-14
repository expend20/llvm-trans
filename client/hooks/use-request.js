import axios from 'axios';

export default function useRequest({url, method, body, onSuccess, toastRef}) {
  const bodyRequest = body || {};

  const doRequest = async (bodyParam) => {
    try {
      const body = {...bodyRequest, ...bodyParam};
      console.log(`doRequest() url: ${url}, method: ${method}, body: ${body}`);
      const response = await axios[method](url, body);
      console.log(`doRequest() ok, response: ${response}`);
      if (toastRef?.current) {
        toastRef.current.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Operation completed successfully',
          life: 2000,
        });
      }
      if (onSuccess) {
        onSuccess(response.data);
      }
    }
    catch (err) {
      console.log(`doRequest() error: ${err}`);
      if (toastRef?.current) {
        err.response.data.errors.forEach((error) => {
          toastRef.current.show({
            severity: 'error',
            summary: error.field,
            detail: error.message,
            life: 5000,
          });
        });
      }
    }
  };

  return {
    doRequest,
  };
}

