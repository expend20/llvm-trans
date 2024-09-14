import redirectTo from './redirect-to';

const ensureSignedInWithRedirect = (context, currentUser) => {
  if (!currentUser) {
    redirectTo(context, '/auth/signin');
    return false;
  }
  return true;
}
  
export default ensureSignedInWithRedirect;