// Clear browser storage script
// Run this in your browser console to clear all authentication tokens

// Clear all cookies
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

// Clear localStorage
localStorage.clear();

// Clear sessionStorage
sessionStorage.clear();

// Clear IndexedDB (if any)
if ('indexedDB' in window) {
  indexedDB.databases().then(databases => {
    databases.forEach(db => {
      if (db.name) {
        indexedDB.deleteDatabase(db.name);
      }
    });
  });
}

console.log('✅ All browser storage cleared. Please refresh the page.');
