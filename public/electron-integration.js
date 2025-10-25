// Electron API integration script
// This script handles the communication between Electron main process and React renderer

// Make Electron APIs available to React app
if (window.electronAPI) {
  window.isElectron = true;
  
  // Listen for menu events
  window.electronAPI.onMenuEvent((event, data) => {
    // Dispatch custom events that React can listen to
    window.dispatchEvent(new CustomEvent('electron-menu', { 
      detail: { 
        type: event.replace('menu-', ''), 
        data 
      } 
    }));
  });
} else {
  window.isElectron = false;
}
