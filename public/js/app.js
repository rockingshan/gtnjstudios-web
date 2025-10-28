// Account Deletion Request Handler
// This script manages the deletion request form with CAPTCHA validation

// CAPTCHA variables
let captchaNum1 = 0;
let captchaNum2 = 0;
let captchaAnswer = 0;

// Generate a new CAPTCHA question
function generateCaptcha() {
  captchaNum1 = Math.floor(Math.random() * 20) + 1;
  captchaNum2 = Math.floor(Math.random() * 20) + 1;
  captchaAnswer = captchaNum1 + captchaNum2;

  const captchaQuestion = document.getElementById('captchaQuestion');
  captchaQuestion.textContent = `What is ${captchaNum1} + ${captchaNum2}?`;
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Show error message
function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';

  // Hide after 5 seconds
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

// Show success message
function showSuccess() {
  const successDiv = document.getElementById('successMessage');
  successDiv.style.display = 'block';

  // Hide the form
  document.getElementById('deletionForm').style.display = 'none';
}

// Submit deletion request to Firestore
async function submitDeletionRequest(email) {
  try {
    // Add document to deletion_requests collection
    await db.collection('deletion_requests').add({
      email: email,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'pending'
    });

    return true;
  } catch (error) {
    console.error('Error submitting deletion request:', error);
    throw error;
  }
}

// Handle form submission
document.getElementById('deletionForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Get form values
  const email = document.getElementById('email').value.trim();
  const userCaptchaAnswer = parseInt(document.getElementById('captchaAnswer').value);
  const submitButton = document.getElementById('submitButton');

  // Validate email
  if (!isValidEmail(email)) {
    showError('Please enter a valid email address.');
    return;
  }

  // Validate CAPTCHA
  if (isNaN(userCaptchaAnswer) || userCaptchaAnswer !== captchaAnswer) {
    showError('Incorrect CAPTCHA answer. Please try again.');
    generateCaptcha(); // Generate new CAPTCHA
    document.getElementById('captchaAnswer').value = '';
    return;
  }

  // Disable submit button and show loading state
  submitButton.disabled = true;
  submitButton.innerHTML = '<span class="loading"></span> Submitting...';

  try {
    // Submit to Firestore
    await submitDeletionRequest(email);

    // Show success message
    showSuccess();

    // Reset form
    document.getElementById('deletionForm').reset();
  } catch (error) {
    // Show error message
    showError('Failed to submit deletion request. Please try again later.');

    // Re-enable submit button
    submitButton.disabled = false;
    submitButton.textContent = 'Submit Deletion Request';

    // Generate new CAPTCHA
    generateCaptcha();
    document.getElementById('captchaAnswer').value = '';
  }
});

// Initialize CAPTCHA when page loads
document.addEventListener('DOMContentLoaded', () => {
  generateCaptcha();
});
