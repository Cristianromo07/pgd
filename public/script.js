/* public/script.js */

document.addEventListener('DOMContentLoaded', () => {
  // Add animation to cards on load (handled by CSS, but we can enhance here if needed)
  console.log('Coldeporte script loaded! 🏃‍♂️');

  // Form Validation enhancement
  const inputs = document.querySelectorAll('input');
  
  inputs.forEach(input => {
    input.addEventListener('blur', (e) => {
      validateInput(e.target);
    });

    input.addEventListener('input', (e) => {
      // Clear error style on input
      if (e.target.validity.valid) {
        e.target.style.borderColor = '#ddd';
      }
    });
  });

  function validateInput(input) {
    if (!input.checkValidity()) {
      input.style.borderColor = '#dc3545'; // Error color
    } else {
      input.style.borderColor = '#28a745'; // Success color
    }
  }

  // Optional: Toggle Password Visibility
  // We'd need to add a toggle button in HTML for this to work, 
  // keeping it simple for now as per plan, but ready for expansion.
});
