const newNoteBtn = document.getElementById('new-note-btn');
const saveBtn = document.getElementById('save-btn');
const noteTitleInput = document.getElementById('note-title');
const noteTagsInput = document.getElementById('note-tags');
const noteContentInput = document.getElementById('note-content');
const noteList = document.getElementById('note-list');
const searchInput = document.getElementById('search');
const divider = document.getElementById('divider');
const editorBody = document.getElementById('editor-body');
const legend = document.getElementById('legend');

let allNotes = [];

loadNotes();

function loadNotes() {
  fetch('/notes')
    .then(function(response) {
      return response.json();
    })
    .then(function(files) {
      allNotes = files;
      renderNoteList(files);
    });
}

function renderNoteList(files) {
  noteList.innerHTML = '';
  files.forEach(function(filename) {
    addNoteToSidebar(filename);
  });
}

function addNoteToSidebar(filename) {
  const li = document.createElement('li');
  li.style.display = 'flex';
  li.style.alignItems = 'center';
  li.style.justifyContent = 'space-between';
  li.style.padding = '6px 8px';
  li.style.borderRadius = '4px';
  li.style.cursor = 'pointer';

  const info = document.createElement('div');
  info.style.display = 'flex';
  info.style.flexDirection = 'column';
  info.style.flex = '1';

  const name = document.createElement('span');
  name.textContent = filename.replace('.md', '');

  const date = document.createElement('span');
  date.style.fontSize = '11px';
  date.style.color = '#666';

  fetch('/notes/' + filename)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      const match = data.content.match(/^---\n[\s\S]*?date:\s*(.+?)\n[\s\S]*?---/);
      if (match) {
        date.textContent = match[1].trim();
      }
    });

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '×';
  deleteBtn.style.background = 'transparent';
  deleteBtn.style.border = 'none';
  deleteBtn.style.color = '#888';
  deleteBtn.style.cursor = 'pointer';
  deleteBtn.style.fontSize = '16px';
  deleteBtn.style.padding = '0 4px';
  deleteBtn.style.display = 'none';

  li.addEventListener('mouseover', function() {
    li.style.background = '#2a2d2e';
    deleteBtn.style.display = 'inline';
  });

  li.addEventListener('mouseout', function() {
    li.style.background = 'transparent';
    deleteBtn.style.display = 'none';
  });

  name.addEventListener('click', function() {
    openNote(filename);
  });

  date.addEventListener('click', function() {
    openNote(filename);
  });

  deleteBtn.addEventListener('click', function(event) {
    event.stopPropagation();
    if (confirm('Delete ' + filename.replace('.md', '') + '?')) {
      deleteNote(filename);
    }
  });

  info.appendChild(name);
  info.appendChild(date);
  li.appendChild(info);
  li.appendChild(deleteBtn);
  noteList.appendChild(li);
}

function openNote(filename) {
  fetch('/notes/' + filename)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      const raw = data.content;
      const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n\n?/);

      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const body = raw.slice(frontmatterMatch[0].length);

        const tagsMatch = frontmatter.match(/tags:\s*\[(.*?)\]/);
        if (tagsMatch) {
          const tags = tagsMatch[1].replace(/"/g, '').split(',').map(t => t.trim()).filter(t => t !== '');
          noteTagsInput.value = tags.join(', ');
        } else {
          noteTagsInput.value = '';
        }

        noteTitleInput.value = filename.replace('.md', '');
        noteContentInput.value = body;
      } else {
        noteTitleInput.value = filename.replace('.md', '');
        noteContentInput.value = raw;
        noteTagsInput.value = '';
      }
    });
}

function saveNote() {
  const title = noteTitleInput.value.trim();
  const content = noteContentInput.value;
  const tags = noteTagsInput.value.split(',').map(t => t.trim()).filter(t => t !== '');

  if (title === '') return;

  fetch('/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, tags })
  })
    .then(function(response) {
      return response.json();
    })
    .then(function() {
      loadNotes();
    });
}

function deleteNote(filename) {
  fetch('/notes/' + filename, { method: 'DELETE' })
    .then(function(response) {
      return response.json();
    })
    .then(function() {
      noteTitleInput.value = '';
      noteContentInput.value = '';
      noteTagsInput.value = '';
      loadNotes();
    });
}

newNoteBtn.addEventListener('click', function() {
  noteTitleInput.value = '';
  noteContentInput.value = '';
  noteTagsInput.value = '';
  noteTitleInput.focus();
});

saveBtn.addEventListener('click', function() {
  const title = noteTitleInput.value.trim();
  if (title === '') {
    alert('Please add a title before saving.');
    return;
  }
  saveNote();
});

searchInput.addEventListener('input', function() {
  const query = searchInput.value.toLowerCase();
  const filtered = allNotes.filter(function(filename) {
    return filename.toLowerCase().includes(query);
  });
  renderNoteList(filtered);
});

document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault();
    const title = noteTitleInput.value.trim();
    if (title === '') {
      alert('Please add a title before saving.');
      return;
    }
    saveNote();
  }
});

let isDragging = false;

divider.addEventListener('mousedown', function() {
  isDragging = true;
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', function(event) {
  if (!isDragging) return;

  const rect = editorBody.getBoundingClientRect();
  const offset = event.clientX - rect.left;
  const total = rect.width;

  const editorPercent = (offset / total) * 100;
  const legendPercent = 100 - editorPercent;

  if (editorPercent < 20 || legendPercent < 10) return;

  noteContentInput.style.flex = 'none';
  noteContentInput.style.width = editorPercent + '%';
  legend.style.flex = 'none';
  legend.style.width = legendPercent + '%';
});

document.addEventListener('mouseup', function() {
  isDragging = false;
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
});
