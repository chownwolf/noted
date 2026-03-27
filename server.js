const express = require('express');                                                                                                                                    
  const fs = require('fs');
  const path = require('path');
  const { marked } = require('marked');

  const app = express();                                                                                                                                                 
  const NOTES_DIR = path.join(__dirname, 'notes');
                                                                                                                                                                         
  // Make sure the notes folder exists                                                                                                                                   
  if (!fs.existsSync(NOTES_DIR)) {
    fs.mkdirSync(NOTES_DIR);                                                                                                                                             
  }               

  // Serve your HTML/CSS/JS files                                                                                                                                        
  app.use(express.json());                                                                                                                                               
                  
  // GET /notes — return a list of all note filenames                                                                                                                    
  app.get('/notes', function(req, res) {
    const files = fs.readdirSync(NOTES_DIR).filter(f => f.endsWith('.md'));                                                                                              
    res.json(files);                                                                                                                                                     
  });
                                                                                                                                                                         
  // GET /notes/:filename — return the content of one note                                                                                                               
  app.get('/notes/:filename', function(req, res) {                                                                                                                       
    const filepath = path.join(NOTES_DIR, req.params.filename);                                                                                                          
    if (!fs.existsSync(filepath)) {                                                                                                                                      
      return res.status(404).json({ error: 'Note not found' });
    }                                                                                                                                                                    
    const content = fs.readFileSync(filepath, 'utf8');
    res.json({ content });
  }); 
  // POST /notes — save a new or updated note                                                                                                                            
  app.post('/notes', function(req, res) {
    const { title, content, tags } = req.body;
    const filename = title.trim().replace(/\s+/g, '-').toLowerCase() + '.md';
    const filepath = path.join(NOTES_DIR, filename);                                                                                                                     
    const safeTitle = typeof title === 'string' ? title.trim() : '';
    const normalizedTags = (Array.isArray(tags) ? tags : [])
      .filter(t => typeof t === 'string')
      .map(t => t.trim())
      .filter(t => t !== '');
    const date = new Date().toISOString().split('T')[0];
    const yamlTags = normalizedTags.map(t => JSON.stringify(t)).join(', ');
    const safeContent = typeof content === 'string' ? content : '';
    const fileContent =
      `---\n` +
      `title: ${JSON.stringify(safeTitle)}\n` +
      `date: ${date}\n` +
      `tags: [${yamlTags}]\n` +
      `---\n\n` +
      safeContent;

    fs.writeFileSync(filepath, fileContent, 'utf8');
    res.json({ filename });                                                                                                                                              
  });                                                                                                                                                                    
  
  app.delete('/notes/:filename', function(req, res) {                                                                                                                    
    const filepath = path.join(NOTES_DIR, req.params.filename);
    if (!fs.existsSync(filepath)) {                                                                                                                                      
      return res.status(404).json({ error: 'Note not found' });
    }                                                                                                                                                                    
    fs.unlinkSync(filepath);
    res.json({ success: true });
  });  

  app.post('/preview', function(req, res) {                                                                                                                              
    const { content } = req.body;
    const html = marked(content);
    res.json({ html });
  }); 
  // Static files served LAST so API routes take priority
  app.get('/favicon.ico', function(req, res) {
    res.status(204).end();
  });
  app.use(express.static(__dirname));
  
  app.listen(3000, function() {                                                                                                                                          
    console.log('Noted is running at http://localhost:3000');
  });