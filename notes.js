/* ----------------------------------------------------
   1. SESSION AUTHENTICATION & SECURITY GUARD
   ---------------------------------------------------- */
const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
const isAuthenticated = localStorage.getItem('authenticated') === 'true';

if (!isAuthenticated || !currentUser.email) {
  localStorage.removeItem('authenticated');
  localStorage.removeItem('currentUser');
  window.location.replace('index.html');
}

document.addEventListener('DOMContentLoaded', () => {
  // Navigation elements
  const userGreeting = document.getElementById('userGreeting');
  const logoutBtn = document.getElementById('logoutBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  
  // Workspace Note Form elements
  const noteForm = document.getElementById('noteForm');
  const editNoteId = document.getElementById('editNoteId');
  const noteTitle = document.getElementById('noteTitle');
  const noteContent = document.getElementById('noteContent');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const noteSubmitBtn = document.getElementById('noteSubmitBtn');
  const formHeading = document.getElementById('formHeading');
  
  // Search & Filtering elements
  const noteSearch = document.getElementById('noteSearch');
  const categoryPills = document.getElementById('categoryPills');
  const noteSort = document.getElementById('noteSort');
  
  // Notes Board Display elements
  const notesGrid = document.getElementById('notesGrid');
  const notesCount = document.getElementById('notesCount');
  const boardEmptyState = document.getElementById('boardEmptyState');
  const toastContainer = document.getElementById('toastContainer');

  // Initialize workspace view states
  userGreeting.textContent = `Welcome back, ${currentUser.name}`;
  lucide.createIcons();

  // Storage Key specific to logged in user for sandbox isolation
  const storageKey = `notes_${currentUser.email.toLowerCase()}`;
  let notesDatabase = JSON.parse(localStorage.getItem(storageKey) || '[]');
  
  // Active Filter state tracker
  let activeFilters = {
    searchQuery: '',
    category: 'all',
    sortBy: 'newest'
  };

  /* ----------------------------------------------------
     2. THEME SYNCHRONIZATION
     ---------------------------------------------------- */
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const initialTheme = savedTheme || (systemPrefersLight ? 'light' : 'dark');
  document.documentElement.setAttribute('data-theme', initialTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    showToast({
      title: `${newTheme === 'dark' ? 'Dark Mode' : 'Light Mode'} Enabled`,
      desc: `Visual workspace theme set to ${newTheme} mode.`,
      type: 'info'
    });
  });

  /* ----------------------------------------------------
     3. LOGOUT SESSION TERMINATE
     ---------------------------------------------------- */
  logoutBtn.addEventListener('click', () => {
    showToast({
      title: 'Signing Out',
      desc: 'Terminating security session... Goodbye!',
      type: 'info'
    });
    
    setTimeout(() => {
      localStorage.removeItem('authenticated');
      localStorage.removeItem('currentUser');
      window.location.replace('index.html');
    }, 1200);
  });

  /* ----------------------------------------------------
     4. TOAST NOTIFICATION CREATION SYSTEM
     ---------------------------------------------------- */
  function showToast({ title, desc, type = 'info' }) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-triangle';
    
    toast.innerHTML = `
      <i data-lucide="${iconName}" class="toast-icon"></i>
      <div class="toast-content">
        <h4 class="toast-title">${title}</h4>
        <p class="toast-desc">${desc}</p>
      </div>
      <button class="toast-close" type="button" aria-label="Close notification">
        <i data-lucide="x"></i>
      </button>
    `;
    
    toastContainer.appendChild(toast);
    lucide.createIcons();

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));

    const timeoutId = setTimeout(() => {
      removeToast(toast);
    }, 4500);

    toast.dataset.timeoutId = timeoutId;
  }

  function removeToast(toast) {
    if (toast.classList.contains('removing')) return;
    toast.classList.add('removing');
    
    if (toast.dataset.timeoutId) {
      clearTimeout(parseInt(toast.dataset.timeoutId, 10));
    }
    
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }

  /* ----------------------------------------------------
     5. DYNAMIC NOTES RENDERING & DOM UPDATES
     ---------------------------------------------------- */
  function renderNotes() {
    // 1. Filter notes by category and search queries
    let filteredNotes = notesDatabase.filter(note => {
      const matchesCategory = activeFilters.category === 'all' || note.category === activeFilters.category;
      
      const query = activeFilters.searchQuery.toLowerCase();
      const matchesSearch = note.title.toLowerCase().includes(query) || 
                            note.content.toLowerCase().includes(query);
                            
      return matchesCategory && matchesSearch;
    });

    // 2. Sort filtered results
    if (activeFilters.sortBy === 'newest') {
      filteredNotes.sort((a, b) => b.timestamp - a.timestamp);
    } else if (activeFilters.sortBy === 'oldest') {
      filteredNotes.sort((a, b) => a.timestamp - b.timestamp);
    } else if (activeFilters.sortBy === 'alphabetical') {
      filteredNotes.sort((a, b) => a.title.localeCompare(b.title));
    }

    // 3. Clear container
    notesGrid.innerHTML = '';
    
    // 4. Update count indicators
    notesCount.textContent = `${filteredNotes.length} note${filteredNotes.length === 1 ? '' : 's'} found`;

    // 5. Check Empty States
    if (filteredNotes.length === 0) {
      boardEmptyState.classList.remove('hidden');
      notesGrid.classList.add('hidden');
      return;
    } else {
      boardEmptyState.classList.add('hidden');
      notesGrid.classList.remove('hidden');
    }

    // 6. Generate Note DOM Cards
    filteredNotes.forEach(note => {
      const card = document.createElement('article');
      card.className = `note-card cat-${note.category}`;
      card.dataset.id = note.id;
      
      const formattedDate = formatDate(note.timestamp);
      
      card.innerHTML = `
        <div class="note-card-header">
          <div class="note-card-meta">
            <span class="note-badge badge-${note.category}">${note.category}</span>
            <span class="note-date">${formattedDate}</span>
          </div>
          <h3 class="note-card-title">${escapeHTML(note.title)}</h3>
        </div>
        <p class="note-card-content">${escapeHTML(note.content)}</p>
        <div class="note-card-footer">
          <button class="card-action-btn edit-btn" title="Edit Note" aria-label="Edit note">
            <i data-lucide="edit-2"></i>
          </button>
          <button class="card-action-btn delete-btn" title="Delete Note" aria-label="Delete note">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      `;
      
      // Wire Card Action Buttons
      const editBtn = card.querySelector('.edit-btn');
      const deleteBtn = card.querySelector('.delete-btn');
      
      editBtn.addEventListener('click', () => initiateEditNote(note));
      deleteBtn.addEventListener('click', () => deleteNote(note.id, card));
      
      notesGrid.appendChild(card);
    });

    // Re-render Lucide dynamic vectors
    lucide.createIcons();
  }

  // Common UI formatting and sanitizing helper functions
  function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ----------------------------------------------------
     6. CRUD OPERATIONS & DATABASE SYNCHRONIZATION
     ---------------------------------------------------- */
  
  // Note inputs validations
  function validateForm() {
    let isValid = true;
    
    // Title validator
    if (noteTitle.value.trim() === '') {
      const group = noteTitle.closest('.input-group');
      group.classList.add('invalid');
      document.getElementById('noteTitleError').textContent = 'Please enter a note title.';
      isValid = false;
    } else {
      const group = noteTitle.closest('.input-group');
      group.classList.remove('invalid');
      document.getElementById('noteTitleError').textContent = '';
    }
    
    // Content validator
    if (noteContent.value.trim() === '') {
      const group = noteContent.closest('.input-group');
      group.classList.add('invalid');
      document.getElementById('noteContentError').textContent = 'Note content cannot be empty.';
      isValid = false;
    } else {
      const group = noteContent.closest('.input-group');
      group.classList.remove('invalid');
      document.getElementById('noteContentError').textContent = '';
    }
    
    return isValid;
  }

  // Clear live input errors on key in
  [noteTitle, noteContent].forEach(input => {
    input.addEventListener('input', () => {
      const group = input.closest('.input-group');
      if (group.classList.contains('invalid')) {
        group.classList.remove('invalid');
        const err = group.querySelector('.error-msg');
        if (err) err.textContent = '';
      }
    });
  });

  // Note creation / Edit update submit
  noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const titleVal = noteTitle.value.trim();
    const contentVal = noteContent.value.trim();
    const categoryVal = document.querySelector('input[name="noteCategory"]:checked').value;
    const noteIdVal = editNoteId.value;
    
    if (noteIdVal) {
      // 1. UPDATE EXISTING NOTE
      const noteIndex = notesDatabase.findIndex(n => n.id === noteIdVal);
      if (noteIndex !== -1) {
        notesDatabase[noteIndex].title = titleVal;
        notesDatabase[noteIndex].content = contentVal;
        notesDatabase[noteIndex].category = categoryVal;
        notesDatabase[noteIndex].timestamp = Date.now(); // Updates modification stamp
        
        showToast({
          title: 'Note Updated',
          desc: 'Workspace changes successfully saved.',
          type: 'success'
        });
      }
    } else {
      // 2. CREATE NEW NOTE
      const newNote = {
        id: Date.now().toString(),
        title: titleVal,
        content: contentVal,
        category: categoryVal,
        timestamp: Date.now()
      };
      
      notesDatabase.unshift(newNote);
      
      showToast({
        title: 'Note Created',
        desc: 'New thoughts recorded in workspace.',
        type: 'success'
      });
    }

    // Save and re-render board
    localStorage.setItem(storageKey, JSON.stringify(notesDatabase));
    renderNotes();
    resetFormState();
  });

  // Load selected Note details into editor
  function initiateEditNote(note) {
    editNoteId.value = note.id;
    noteTitle.value = note.title;
    noteContent.value = note.content;
    
    // Check radio option
    const radioBtn = document.querySelector(`input[name="noteCategory"][value="${note.category}"]`);
    if (radioBtn) radioBtn.checked = true;
    
    // Focus adjustments (moves labels)
    noteTitle.dispatchEvent(new Event('input'));
    noteContent.dispatchEvent(new Event('input'));

    // Toggle Form styling layout to Edit Mode
    formHeading.textContent = 'Edit Note';
    cancelEditBtn.classList.remove('hidden');
    noteSubmitBtn.querySelector('.btn-text').textContent = 'Update Note';
    
    const icon = document.getElementById('submitBtnIcon');
    icon.setAttribute('data-lucide', 'check-circle-2');
    lucide.createIcons();
    
    // Scroll sidebar form into viewport on mobile
    if (window.innerWidth <= 1024) {
      document.getElementById('noteFormCard').scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Delete note from database with smooth animation
  function deleteNote(id, cardElement) {
    if (confirm('Are you sure you want to delete this note from your workspace?')) {
      cardElement.classList.add('removing');
      
      cardElement.addEventListener('animationend', () => {
        notesDatabase = notesDatabase.filter(n => n.id !== id);
        localStorage.setItem(storageKey, JSON.stringify(notesDatabase));
        renderNotes();
        
        showToast({
          title: 'Note Deleted',
          desc: 'Selected item removed from database.',
          type: 'success'
        });
        
        // If the note being edited was deleted, reset the editor form
        if (editNoteId.value === id) {
          resetFormState();
        }
      });
    }
  }

  // Cancel edit buttons trigger
  cancelEditBtn.addEventListener('click', resetFormState);

  // Restore Note editor state
  function resetFormState() {
    noteForm.reset();
    editNoteId.value = '';
    
    // Remove custom styling borders
    document.querySelectorAll('.input-group').forEach(group => group.classList.remove('invalid'));
    document.querySelectorAll('.error-msg').forEach(msg => msg.textContent = '');
    
    // Restore default texts
    formHeading.textContent = 'New Note';
    cancelEditBtn.classList.add('hidden');
    noteSubmitBtn.querySelector('.btn-text').textContent = 'Save Note';
    
    const icon = document.getElementById('submitBtnIcon');
    icon.setAttribute('data-lucide', 'plus-circle');
    
    // Reset checked category pill
    document.querySelector('input[name="noteCategory"][value="personal"]').checked = true;
    
    lucide.createIcons();
  }

  /* ----------------------------------------------------
     7. LIVE FILTERING & SEARCH ACTIONS
     ---------------------------------------------------- */
  
  // Real-time search query key inputs
  noteSearch.addEventListener('input', (e) => {
    activeFilters.searchQuery = e.target.value.trim();
    renderNotes();
  });

  // Pills selector categories filter clicks
  categoryPills.addEventListener('click', (e) => {
    const pill = e.target.closest('.pill-btn');
    if (!pill) return;
    
    // Remove active style from pills and add to targeted pill
    categoryPills.querySelectorAll('.pill-btn').forEach(btn => btn.classList.remove('active'));
    pill.classList.add('active');
    
    activeFilters.category = pill.dataset.category;
    renderNotes();
  });

  // Sorting selects
  noteSort.addEventListener('change', (e) => {
    activeFilters.sortBy = e.target.value;
    renderNotes();
  });

  /* ----------------------------------------------------
     8. INITIAL DATA LOAD RUN
     ---------------------------------------------------- */
  renderNotes();
});
