  const newNoteBtn = document.getElementById('new-note-btn');                                                                                                            
  const saveBtn = document.getElementById('save-btn');
  const noteTitleInput = document.getElementById('note-title');
  const noteTagsInput = document.getElementById('note-tags');
  const noteContentInput = document.getElementById('note-content');                                                                                                      
  const noteList = document.getElementById('note-list');
  const preview = document.getElementById('preview');
  
                                                                                                                                                                         
  // Load the list of notes when the page opens                                                                                                                          
  loadNotes();
                                                                                                                                                                         
  function loadNotes() {
    fetch('/notes')
      .then(function(response) {
        return response.json();
      })
      .then(function(files) {
        noteList.innerHTML = '';                                                                                                                                         
        files.forEach(function(filename) {
          addNoteToSidebar(filename);                                                                                                                                    
        });                                                                                                                                                              
      });
  }                                                                                                                                                                      
                  
  function addNoteToSidebar(filename) {
    const li = document.createElement('li');
    li.textContent = filename.replace('.md', '');
    li.style.cursor = 'pointer';                                                                                                                                         
    li.style.padding = '6px 8px';
    li.style.borderRadius = '4px';                                                                                                                                       
                                                                                                                                                                         
    li.addEventListener('click', function() {
      openNote(filename);                                                                                                                                                
    });           

    li.addEventListener('mouseover', function() {                                                                                                                        
      li.style.background = '#2a2d2e';
    });                                                                                                                                                                  
                  
    li.addEventListener('mouseout', function() {                                                                                                                         
      li.style.background = 'transparent';
    });

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
                                                                                                                                                                         
        updatePreview();
      });
  }                                                                                                                                                                      
                  
  newNoteBtn.addEventListener('click', function() {                                                                                                                      
    noteTitleInput.value = '';                                                                                                                                           
    noteContentInput.value = '';
    noteTagsInput.value = '';                                                                                                                                            
    noteTitleInput.focus();
  });
 

  function updatePreview() {                                                                                                                                             
    const content = noteContentInput.value;
    fetch('/preview', {                                                                                                                                                  
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    })                                                                                                                                                                   
      .then(function(response) {
        return response.json();                                                                                                                                          
      })          
      .then(function(data) {
        preview.innerHTML = data.html;
      });
  }

  noteContentInput.addEventListener('input', updatePreview);

  saveBtn.addEventListener('click', function() {
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value;
    const tags = noteTagsInput.value.split(',').map(t => t.trim()).filter(t => t !== '');
                                                                                                                                                                         
    if (title === '') {
      alert('Please add a title before saving.');                                                                                                                        
      return;     
    }

    fetch('/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, tags })                                                                                                                           
    })
      .then(function(response) {                                                                                                                                         
        return response.json();
      })
      .then(function(data) {
        loadNotes();
      });                                                                                                                                                                
  });
