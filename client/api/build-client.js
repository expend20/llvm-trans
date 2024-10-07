import axios from 'axios';

const buildClient = ({ req }) => {
  if (typeof window === 'undefined') {
    // We are on the server
    const baseURL = process.env.NODE_ENV === 'development'
      ? 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local'
      : 'https://shifting.codes';
    
    return axios.create({
      baseURL,
      headers: req.headers,
    });
  } else {
    // We are on the browser
    return axios.create({
      baseURL: '/',
    });
  }
}

export default buildClient;
