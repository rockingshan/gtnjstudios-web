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
