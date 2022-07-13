
export function addSpaListener(listener){
  window.addEventListener('popstate', listener);
  window.addEventListener('stateupdate_evolv', listener);
}