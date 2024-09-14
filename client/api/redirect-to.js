import Router from 'next/router';

const redirectTo = (context, path) => {
  if (typeof window === 'undefined') {
    // Server-side redirect
    context.res.writeHead(302, { Location: path });
    context.res.end();
  } else {
    // Client-side redirect
    Router.push(path);
  }
}
  
export default redirectTo;