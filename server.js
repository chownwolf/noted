const express = require('express');                                                                                                                                    
  const fs = require('fs');
  const path = require('path');

  const app = express();                                                                                                                                                 
  const NOTES_DIR = path.join(__dirname, 'notes');
  const { marked } = require('marked');
                                                                                                                                                                         
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
    console.log('Requesting file:', filepath);  // add this line
    if (!fs.existsSync(filepath)) {                                                                                                                                      
      return res.status(404).json({ error: 'Note not found' });
    }                                                                                                                                                                    
    const content = fs.readFileSync(filepath, 'utf8');
    res.json({ content });
  }); 
  // POST /notes — save a new or updated note                                                                                                                            
  app.post('/notes', function(req, res) {
    const { title, content } = req.body;                                                                                                                                 
    const filename = title.trim().replace(/\s+/g, '-').toLowerCase() + '.md';
    const filepath = path.join(NOTES_DIR, filename);                                                                                                                     
    fs.writeFileSync(filepath, content, 'utf8');
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

  app.post('/notes', function(req, res) {
    const { title, content, tags } = req.body;                                                                                                                           
    const filename = title.trim().replace(/\s+/g, '-').toLowerCase() + '.md';
    const filepath = path.join(NOTES_DIR, filename);                                                                                                                     
                  
    const date = new Date().toISOString().split('T')[0];                                                                                                                 
    const tagList = tags && tags.length > 0 ? '[' + tags.map(t => '"' + t + '"').join(', ') + ']' : '[]';
                                                                                                                                                                         
    const fileContent = `---\ntitle: ${title}\ndate: ${date}\ntags: ${tagList}\n---\n\n${content}`;                                                                      
                                                                                                                                                                         
    fs.writeFileSync(filepath, fileContent, 'utf8');                                                                                                                     
    res.json({ filename });
  });

  app.post('/preview', function(req, res) {                                                                                                                              
    const { content } = req.body;
    const html = marked(content);
    res.json({ html });
  }); 
  // Static files served LAST so API routes take priority
  app.use(express.static(__dirname));
  
  app.listen(3000, function() {                                                                                                                                          
    console.log('Noted is running at http://localhost:3000');
  });