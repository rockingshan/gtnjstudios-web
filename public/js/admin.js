// Admin Dashboard JavaScript
// Handles authentication and deletion request management

// UI Elements
const loginCard = document.getElementById('loginCard');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutButton = document.getElementById('logoutButton');
const requestsTableBody = document.getElementById('requestsTableBody');
const loadingSpinner = document.getElementById('loadingSpinner');
const requestsContainer = document.getElementById('requestsContainer');
const noRequestsMessage = document.getElementById('noRequestsMessage');

// Show error message on login page
function showLoginError(message) {
  loginError.textContent = message;
  loginError.style.display = 'block';

  setTimeout(() => {
    loginError.style.display = 'none';
  }, 5000);
}

// Handle login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;
  const loginButton = document.getElementById('loginButton');

  // Validate that the email matches the allowed admin email
  if (email !== 'gtnjstudios@gmail.com') {
    showLoginError('Access denied. Invalid credentials.');
    return;
  }

  // Disable login button
  loginButton.disabled = true;
  loginButton.innerHTML = '<span class="loading"></span> Logging in...';

  try {
    // Sign in with email and password
    await auth.signInWithEmailAndPassword(email, password);
    // User will be redirected by auth state observer
  } catch (error) {
    console.error('Login error:', error);

    let errorMessage = 'Failed to login. Please check your credentials.';

    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled.';
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        errorMessage = 'Invalid email or password.';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Invalid credentials. Please try again.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed login attempts. Please try again later.';
        break;
      default:
        errorMessage = `Login failed: ${error.message}`;
    }

    showLoginError(errorMessage);

    // Re-enable login button
    loginButton.disabled = false;
    loginButton.textContent = 'Login';
  }
});

// Handle logout
logoutButton.addEventListener('click', async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
    alert('Failed to logout. Please try again.');
  }
});

// Format timestamp for display
function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A';

  const date = timestamp.toDate();
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Mark request as done
async function markAsDone(docId, button) {
  try {
    button.disabled = true;
    button.innerHTML = '<span class="loading"></span>';

    await db.collection('deletion_requests').doc(docId).update({
      status: 'done'
    });

    // The UI will update automatically via the real-time listener
  } catch (error) {
    console.error('Error marking as done:', error);
    alert('Failed to update status. Please try again.');
    button.disabled = false;
    button.textContent = 'Mark as Done';
  }
}

// Render deletion requests table
function renderRequests(requests) {
  requestsTableBody.innerHTML = '';

  if (requests.length === 0) {
    loadingSpinner.style.display = 'none';
    requestsContainer.style.display = 'block';
    noRequestsMessage.style.display = 'block';
    document.getElementById('requestsTable').style.display = 'none';
    return;
  }

  noRequestsMessage.style.display = 'none';
  document.getElementById('requestsTable').style.display = 'table';

  requests.forEach((request) => {
    const row = document.createElement('tr');
    row.className = request.status === 'done' ? 'done' : '';

    // Email cell
    const emailCell = document.createElement('td');
    emailCell.textContent = request.email;
    row.appendChild(emailCell);

    // Timestamp cell
    const timestampCell = document.createElement('td');
    timestampCell.textContent = formatTimestamp(request.timestamp);
    row.appendChild(timestampCell);

    // Status cell
    const statusCell = document.createElement('td');
    const statusBadge = document.createElement('span');
    statusBadge.className = `status-badge ${request.status}`;
    statusBadge.textContent = request.status.toUpperCase();
    statusCell.appendChild(statusBadge);
    row.appendChild(statusCell);

    // Action cell
    const actionCell = document.createElement('td');
    if (request.status === 'pending') {
      const actionButton = document.createElement('button');
      actionButton.className = 'action-button';
      actionButton.textContent = 'Mark as Done';
      actionButton.onclick = () => markAsDone(request.id, actionButton);
      actionCell.appendChild(actionButton);
    } else {
      actionCell.textContent = 'Completed';
      actionCell.style.color = '#c62828';
      actionCell.style.fontWeight = '600';
    }
    row.appendChild(actionCell);

    requestsTableBody.appendChild(row);
  });

  loadingSpinner.style.display = 'none';
  requestsContainer.style.display = 'block';
}

// Load deletion requests with real-time updates
function loadDeletionRequests() {
  loadingSpinner.style.display = 'block';
  requestsContainer.style.display = 'none';

  // Set up real-time listener
  db.collection('deletion_requests')
    .orderBy('timestamp', 'desc')
    .onSnapshot(
      (snapshot) => {
        const requests = [];
        snapshot.forEach((doc) => {
          requests.push({
            id: doc.id,
            ...doc.data()
          });
        });

        renderRequests(requests);
      },
      (error) => {
        console.error('Error loading requests:', error);
        loadingSpinner.style.display = 'none';
        requestsContainer.style.display = 'block';
        noRequestsMessage.innerHTML = '<p style="color: #c62828;">Failed to load requests. Please refresh the page.</p>';
        noRequestsMessage.style.display = 'block';
      }
    );
}

// Monitor authentication state
auth.onAuthStateChanged((user) => {
  if (user && user.email === 'gtnjstudios@gmail.com') {
    // User is authenticated and is the admin
    loginCard.style.display = 'none';
    adminDashboard.style.display = 'block';

    // Load deletion requests
    loadDeletionRequests();
  } else {
    // User is not authenticated or not the admin
    if (user) {
      // If logged in but not admin, sign them out
      auth.signOut();
    }

    loginCard.style.display = 'block';
    adminDashboard.style.display = 'none';
  }
});

// ==================== LINK MANAGEMENT SYSTEM ====================

// Initialize Link Management System after DOM is fully loaded
function initializeLinkManagement() {
  // UI Elements for Link Manager
  const navTabs = document.querySelectorAll('.nav-tab');
  const deletionRequestsTab = document.getElementById('deletion-requests-tab');
  const linkManagerTab = document.getElementById('link-manager-tab');
  const createLinkButton = document.getElementById('createLinkButton');
  const linksTableBody = document.getElementById('linksTableBody');
  const noLinksMessage = document.getElementById('noLinksMessage');

  // Modal Elements
  const linkModal = document.getElementById('linkModal');
  const closeModal = document.getElementById('closeModal');
  const cancelButton = document.getElementById('cancelButton');
  const linkForm = document.getElementById('linkForm');
  const modalTitle = document.getElementById('modalTitle');
  const saveLinkButton = document.getElementById('saveLinkButton');
  const analyticsModal = document.getElementById('analyticsModal');
  const closeAnalyticsModal = document.getElementById('closeAnalyticsModal');

  if (!linkModal || !linkForm || !createLinkButton) {
    console.error('Critical elements missing! Cannot initialize link management.');
    return;
  }

  // Tab Navigation
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;

      // Update active tab
      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Show/hide content
      if (targetTab === 'deletion-requests') {
        deletionRequestsTab.style.display = 'block';
        linkManagerTab.style.display = 'none';
      } else if (targetTab === 'link-manager') {
        deletionRequestsTab.style.display = 'none';
        linkManagerTab.style.display = 'block';
        loadLinks();
      }
    });
  });

  // Load Links from Firestore
  let linksUnsubscribe = null;

  function loadLinks() {
    if (linksUnsubscribe) {
      linksUnsubscribe();
    }

    linksTableBody.innerHTML = '';
    noLinksMessage.style.display = 'none';

    linksUnsubscribe = db.collection('redirect_links')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (snapshot) => {
          const links = [];
          snapshot.forEach((doc) => {
            links.push({
              id: doc.id,
              ...doc.data()
            });
          });

          renderLinks(links);
        },
        (error) => {
          console.error('Error loading links:', error);
          noLinksMessage.innerHTML = '<p style="color: #c62828;">Failed to load links. Please refresh the page.</p>';
          noLinksMessage.style.display = 'block';
        }
      );
  }

  // HTML escape function to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Render Links Table
  function renderLinks(links) {
    linksTableBody.innerHTML = '';

    if (links.length === 0) {
      noLinksMessage.style.display = 'block';
      document.getElementById('linksTable').style.display = 'none';
      return;
    }

    noLinksMessage.style.display = 'none';
    document.getElementById('linksTable').style.display = 'table';

    links.forEach((link) => {
      const row = document.createElement('tr');

      // Tag cell - use textContent to prevent XSS
      const tagCell = document.createElement('td');
      const tagStrong = document.createElement('strong');
      tagStrong.textContent = link.tag;
      tagCell.appendChild(tagStrong);
      row.appendChild(tagCell);

      // Total Clicks cell
      const clicksCell = document.createElement('td');
      clicksCell.innerHTML = `<span style="font-size: 1.2rem; font-weight: 600; color: var(--primary-color);">${link.totalClicks || 0}</span>`;
      row.appendChild(clicksCell);

      // Platform Stats cell
      const statsCell = document.createElement('td');
      const activePlatforms = [];
      if (link.androidUrl) activePlatforms.push('Android');
      if (link.iosUrl) activePlatforms.push('iOS');
      if (link.windowsUrl) activePlatforms.push('Windows');
      if (link.macUrl) activePlatforms.push('Mac');
      if (link.linuxUrl) activePlatforms.push('Linux');

      let statsHTML = `<div class="platform-badges">`;
      if (activePlatforms.length > 0) {
        activePlatforms.forEach(platform => {
          statsHTML += `<span class="platform-badge active">${platform}</span>`;
        });
      } else {
        statsHTML += `<span class="platform-badge">Default only</span>`;
      }
      statsHTML += `</div>`;
      statsCell.innerHTML = statsHTML;
      row.appendChild(statsCell);

      // Short URL cell - escape tag to prevent XSS
      const urlCell = document.createElement('td');
      const shortUrl = `${window.location.origin}/link/${encodeURIComponent(link.tag)}`;
      const codeElement = document.createElement('code');
      codeElement.style.background = '#f5f5f5';
      codeElement.style.padding = '0.25rem 0.5rem';
      codeElement.style.borderRadius = '4px';
      codeElement.style.fontSize = '0.85rem';
      codeElement.textContent = shortUrl;
      urlCell.appendChild(codeElement);
      row.appendChild(urlCell);

      // Actions cell - escape IDs to prevent XSS
      const actionCell = document.createElement('td');
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'action-buttons';

      const copyBtn = document.createElement('button');
      copyBtn.className = 'table-action-btn copy-btn';
      copyBtn.textContent = '📋 Copy';
      copyBtn.onclick = () => copyLink(shortUrl);

      const analyticsBtn = document.createElement('button');
      analyticsBtn.className = 'table-action-btn analytics-btn';
      analyticsBtn.textContent = '📊 Analytics';
      analyticsBtn.onclick = () => showAnalytics(link.id);

      const editBtn = document.createElement('button');
      editBtn.className = 'table-action-btn edit-btn';
      editBtn.textContent = '✏️ Edit';
      editBtn.onclick = () => editLink(link.id);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'table-action-btn delete-btn';
      deleteBtn.textContent = '🗑️ Delete';
      deleteBtn.onclick = () => deleteLink(link.id);

      actionsDiv.appendChild(copyBtn);
      actionsDiv.appendChild(analyticsBtn);
      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);
      actionCell.appendChild(actionsDiv);
      row.appendChild(actionCell);

      linksTableBody.appendChild(row);
    });
  }

  // Open Create Link Modal
  if (createLinkButton) {
    createLinkButton.addEventListener('click', () => {
      try {
        modalTitle.textContent = 'Create New Redirect Link';
        linkForm.reset();
        document.getElementById('linkId').value = '';
        saveLinkButton.textContent = 'Create Link';
        linkModal.style.display = 'block';
      } catch (error) {
        console.error('Error opening modal:', error);
        alert('Error opening modal: ' + error.message);
      }
    });
  } else {
    console.error('Create Link button not found!');
  }

  // Close Modal
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      linkModal.style.display = 'none';
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      linkModal.style.display = 'none';
    });
  }

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === linkModal) {
      linkModal.style.display = 'none';
    }
    if (e.target === analyticsModal) {
      analyticsModal.style.display = 'none';
    }
  });

  // Validate URL to prevent XSS
  function isValidUrl(url) {
    if (!url) return true; // Empty URLs are allowed for optional fields
    try {
      const urlObj = new URL(url);
      // Only allow http and https protocols
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (e) {
      return false;
    }
  }

  // Validate tag format
  function isValidTag(tag) {
    // Only allow alphanumeric, hyphens, and underscores
    return /^[a-zA-Z0-9_\-]+$/.test(tag);
  }

  // Save Link (Create or Update)
  linkForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const linkId = document.getElementById('linkId').value;
    const tag = document.getElementById('tag').value.trim();
    const defaultUrl = document.getElementById('defaultUrl').value.trim();
    const androidUrl = document.getElementById('androidUrl').value.trim();
    const iosUrl = document.getElementById('iosUrl').value.trim();
    const windowsUrl = document.getElementById('windowsUrl').value.trim();
    const macUrl = document.getElementById('macUrl').value.trim();
    const linuxUrl = document.getElementById('linuxUrl').value.trim();

    saveLinkButton.disabled = true;
    saveLinkButton.innerHTML = '<span class="loading"></span> Saving...';

    try {
      // Validate tag format
      if (!isValidTag(tag)) {
        throw new Error('Tag can only contain letters, numbers, hyphens, and underscores.');
      }

      // Validate URLs
      const urls = [
        { name: 'Default URL', value: defaultUrl },
        { name: 'Android URL', value: androidUrl },
        { name: 'iOS URL', value: iosUrl },
        { name: 'Windows URL', value: windowsUrl },
        { name: 'Mac URL', value: macUrl },
        { name: 'Linux URL', value: linuxUrl }
      ];

      for (const url of urls) {
        if (url.value && !isValidUrl(url.value)) {
          throw new Error(`${url.name} must be a valid HTTP or HTTPS URL.`);
        }
      }

      // Ensure default URL is provided
      if (!defaultUrl) {
        throw new Error('Default URL is required.');
      }
      if (linkId) {
        // Update existing link
        const linkRef = db.collection('redirect_links').doc(linkId);

        // Check if tag is unique (excluding current link)
        const tagExists = await db.collection('redirect_links')
          .where('tag', '==', tag)
          .get();

        if (!tagExists.empty && tagExists.docs[0].id !== linkId) {
          throw new Error('This tag is already in use. Please choose a different tag.');
        }

        await linkRef.update({
          tag,
          defaultUrl,
          androidUrl: androidUrl || firebase.firestore.FieldValue.delete(),
          iosUrl: iosUrl || firebase.firestore.FieldValue.delete(),
          windowsUrl: windowsUrl || firebase.firestore.FieldValue.delete(),
          macUrl: macUrl || firebase.firestore.FieldValue.delete(),
          linuxUrl: linuxUrl || firebase.firestore.FieldValue.delete(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } else {
        // Check if tag is unique
        const tagExists = await db.collection('redirect_links')
          .where('tag', '==', tag)
          .get();

        if (!tagExists.empty) {
          throw new Error('This tag is already in use. Please choose a different tag.');
        }

        // Create new link
        await db.collection('redirect_links').add({
          tag,
          defaultUrl,
          androidUrl: androidUrl || null,
          iosUrl: iosUrl || null,
          windowsUrl: windowsUrl || null,
          macUrl: macUrl || null,
          linuxUrl: linuxUrl || null,
          totalClicks: 0,
          androidClicks: 0,
          iosClicks: 0,
          windowsClicks: 0,
          macClicks: 0,
          linuxClicks: 0,
          defaultClicks: 0,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }

      linkModal.style.display = 'none';
    } catch (error) {
      console.error('Error saving link:', error);
      alert(`Error: ${error.message}`);
    } finally {
      saveLinkButton.disabled = false;
      saveLinkButton.textContent = linkId ? 'Update Link' : 'Create Link';
    }
  });

  // Make functions global so they can be called from onclick handlers
  window.editLink = editLink;
  window.deleteLink = deleteLink;
  window.copyLink = copyLink;
  window.showAnalytics = showAnalytics;

  // Edit Link
  async function editLink(linkId) {
    try {
      const doc = await db.collection('redirect_links').doc(linkId).get();

      if (!doc.exists) {
        alert('Link not found');
        return;
      }

      const link = doc.data();

      modalTitle.textContent = 'Edit Redirect Link';
      document.getElementById('linkId').value = linkId;
      document.getElementById('tag').value = link.tag;
      document.getElementById('defaultUrl').value = link.defaultUrl;
      document.getElementById('androidUrl').value = link.androidUrl || '';
      document.getElementById('iosUrl').value = link.iosUrl || '';
      document.getElementById('windowsUrl').value = link.windowsUrl || '';
      document.getElementById('macUrl').value = link.macUrl || '';
      document.getElementById('linuxUrl').value = link.linuxUrl || '';

      saveLinkButton.textContent = 'Update Link';
      linkModal.style.display = 'block';
    } catch (error) {
      console.error('Error loading link:', error);
      alert('Failed to load link details');
    }
  }

  // Delete Link
  async function deleteLink(linkId) {
    if (!confirm('Are you sure you want to delete this redirect link? This action cannot be undone.')) {
      return;
    }

    try {
      await db.collection('redirect_links').doc(linkId).delete();
    } catch (error) {
      console.error('Error deleting link:', error);
      alert('Failed to delete link');
    }
  }

  // Copy Link to Clipboard
  function copyLink(shortUrl) {
    navigator.clipboard.writeText(shortUrl).then(() => {
      showNotification('Link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy link. Please copy manually.');
    });
  }

  // Show Notification
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Show Analytics
  async function showAnalytics(linkId) {
    try {
      const doc = await db.collection('redirect_links').doc(linkId).get();

      if (!doc.exists) {
        alert('Link not found');
        return;
      }

      const link = doc.data();
      const shortUrl = `${window.location.origin}/link/${link.tag}`;

      // Update analytics modal
      document.getElementById('analyticsShortUrl').textContent = shortUrl;
      document.getElementById('totalClicks').textContent = link.totalClicks || 0;
      document.getElementById('androidClicks').textContent = link.androidClicks || 0;
      document.getElementById('iosClicks').textContent = link.iosClicks || 0;
      document.getElementById('windowsClicks').textContent = link.windowsClicks || 0;
      document.getElementById('macClicks').textContent = link.macClicks || 0;
      document.getElementById('linuxClicks').textContent = link.linuxClicks || 0;
      document.getElementById('defaultClicks').textContent = link.defaultClicks || 0;

      analyticsModal.style.display = 'block';
    } catch (error) {
      console.error('Error loading analytics:', error);
      alert('Failed to load analytics');
    }
  }

  // Close Analytics Modal
  if (closeAnalyticsModal) {
    closeAnalyticsModal.addEventListener('click', () => {
      analyticsModal.style.display = 'none';
    });
  }
}

// Call initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLinkManagement);
} else {
  // DOM is already ready
  initializeLinkManagement();
}
