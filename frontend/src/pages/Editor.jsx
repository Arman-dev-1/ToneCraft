import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertBanner from '../components/AlertBanner';
import { adjustTone } from '../utils/api';
import './Editor.css';

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [toneLevel, setToneLevel] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adjusting, setAdjusting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', onConfirm: null });
  // Advanced tone control
  const [showToneSelector, setShowToneSelector] = useState(false);
  const [verbosityLevel, setVerbosityLevel] = useState('normal');
  // Text selection tracking
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [hasSelection, setHasSelection] = useState(false);
  
  // Revision history states
  const [history, setHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [maxHistoryLength, setMaxHistoryLength] = useState(50); // Maximum history entries

  // Load document from localStorage
  useEffect(() => {
    setLoading(true);
    try {
      // Get document by ID
      const documentData = localStorage.getItem(`document_${id}`);
      
      if (documentData) {
        const doc = JSON.parse(documentData);
        setDocument(doc);
        setTitle(doc.title);
        setContent(doc.content || '');
        setToneLevel(doc.toneLevel || 5);
        
        // Load revision history if it exists
        const historyData = localStorage.getItem(`history_${id}`);
        if (historyData) {
          const parsedHistory = JSON.parse(historyData);
          setHistory(parsedHistory.history || []);
          setCurrentHistoryIndex(parsedHistory.currentIndex || -1);
        } else {
          // Initialize history with the current content
          initializeHistory(doc.content || '');
        }
        
        setLoading(false);
      } else {
        // Document not found - create a new one if ID is valid
        if (id && /^\d+$/.test(id)) {
          createNewDoc();
        } else {
          setError('Document not found');
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Error loading document:', err);
      setError('Failed to load document');
      toast.error('Failed to load document');
      setLoading(false);
    }
  }, [id]);
  
  // Initialize history with current content
  const initializeHistory = (initialContent) => {
    const initialHistory = [{ content: initialContent, timestamp: new Date().toISOString() }];
    setHistory(initialHistory);
    setCurrentHistoryIndex(0);
    saveHistoryToLocalStorage(initialHistory, 0);
  };

  // Create a new document
  const createNewDoc = () => {
    const newDoc = {
      id: id,
      title: 'Untitled Document',
      content: '',
      toneLevel: 5,
      created: new Date().toISOString(),
      lastEdited: new Date().toISOString()
    };

    setDocument(newDoc);
    setTitle(newDoc.title);
    setContent(newDoc.content);
    setToneLevel(newDoc.toneLevel);
    
    // Initialize history
    initializeHistory(newDoc.content);

    // Save to localStorage - both the document and update the ID list
    try {
      // Save document by ID
      localStorage.setItem(`document_${id}`, JSON.stringify(newDoc));
      
      // Update document list
      const documentIds = JSON.parse(localStorage.getItem('documentIds') || '[]');
      if (!documentIds.includes(id)) {
        documentIds.unshift(id);
        localStorage.setItem('documentIds', JSON.stringify(documentIds));
      }
    } catch (err) {
      console.error('Error creating new document:', err);
      setError('Failed to create new document');
      toast.error('Failed to create new document');
    }

    setLoading(false);
  };
  
  // Save history to localStorage
  const saveHistoryToLocalStorage = (historyArray, currentIndex) => {
    try {
      localStorage.setItem(`history_${id}`, JSON.stringify({
        history: historyArray,
        currentIndex: currentIndex
      }));
    } catch (err) {
      console.error('Error saving history to localStorage:', err);
      toast.warn('Failed to save revision history');
    }
  };
  
  // Add to history
  const addToHistory = (newContent) => {
    // Trim history if we're not at the end (discarding alternate future)
    const newHistory = history.slice(0, currentHistoryIndex + 1);
    
    // Add new entry
    newHistory.push({
      content: newContent,
      timestamp: new Date().toISOString()
    });
    
    // Enforce maximum history length
    if (newHistory.length > maxHistoryLength) {
      newHistory.shift(); // Remove oldest entry
    }
    
    const newIndex = newHistory.length - 1;
    
    // Update state
    setHistory(newHistory);
    setCurrentHistoryIndex(newIndex);
    
    // Save to localStorage
    saveHistoryToLocalStorage(newHistory, newIndex);
  };
  
  // Undo action
  const undo = () => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      setContent(history[newIndex].content);
      
      // Update localStorage
      saveHistoryToLocalStorage(history, newIndex);
      toast.info('Undo: Reverted to previous version');
    }
  };
  
  // Redo action
  const redo = () => {
    if (currentHistoryIndex < history.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      setContent(history[newIndex].content);
      
      // Update localStorage
      saveHistoryToLocalStorage(history, newIndex);
      toast.info('Redo: Applied next version');
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // We need to debounce this to avoid adding every keystroke to history
    if (window.contentChangeTimeout) {
      clearTimeout(window.contentChangeTimeout);
    }
    
    window.contentChangeTimeout = setTimeout(() => {
      // Only add to history if content has changed significantly (more than 10 characters)
      if (history.length === 0 || 
          (Math.abs(newContent.length - history[currentHistoryIndex].content.length) > 10)) {
        addToHistory(newContent);
      }
    }, 1500); // 1.5 seconds debounce
  };

  // Track text selection
  const handleTextSelection = (e) => {
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    setSelectionStart(start);
    setSelectionEnd(end);
    setHasSelection(start !== end);
  };

  const handleToneLevelChange = (e) => {
    setToneLevel(parseInt(e.target.value));
  };

  const selectTonePreset = (preset) => {
    switch(preset) {
      case 'executive':
        setToneLevel(9);
        setVerbosityLevel('concise');
        break;
      case 'technical':
        setToneLevel(7);
        setVerbosityLevel('detailed');
        break;
      case 'casual':
        setToneLevel(2);
        setVerbosityLevel('normal');
        break;
      case 'educational':
        setToneLevel(6);
        setVerbosityLevel('detailed');
        break;
      case 'basic':
        setToneLevel(5);
        setVerbosityLevel('concise');
        break;
      default:
        break;
    }
    setShowToneSelector(false);
  };

  const handleVerbosityChange = (level) => {
    setVerbosityLevel(level);
  };

  const adjustToneHandler = async () => {
    if (!content.trim()) return;
    
    setAdjusting(true);
    setSaveMessage('');
    setError(null);
    
    try {
      // Save current state to history before adjustment
      addToHistory(content);
      
      let textToAdjust, selectedText;
      
      // Check if there's a selected text
      if (hasSelection && selectionStart !== selectionEnd) {
        selectedText = content.substring(selectionStart, selectionEnd);
        textToAdjust = selectedText;
      } else {
        // If no selection, adjust the entire text
        textToAdjust = content;
      }
      
      // Call API to adjust tone with verbosity control
      const result = await adjustTone(textToAdjust, toneLevel, verbosityLevel);
      
      let newContent;
      
      // If we had a selection, only replace that part
      if (hasSelection && selectionStart !== selectionEnd) {
        newContent = 
          content.substring(0, selectionStart) + 
          result.adjustedText + 
          content.substring(selectionEnd);
      } else {
        // Otherwise replace the entire content
        newContent = result.adjustedText;
      }
      
      // Set the new content
      setContent(newContent);
      
      // Add adjusted content to history as a separate entry for undo/redo
      addToHistory(newContent);
      
      toast.success('Text tone adjusted successfully!');
    } catch (err) {
      console.error('Error adjusting tone:', err);
      setError(`Failed to adjust tone: ${err.message}`);
    } finally {
      setAdjusting(false);
    }
  };

  const saveDocument = () => {
    setSaving(true);
    setSaveMessage('');
    setError(null);
    
    try {
      const updatedDoc = {
        ...document,
        title,
        content,
        toneLevel,
        lastEdited: new Date().toISOString()
      };
      
      // Save document by ID
      localStorage.setItem(`document_${id}`, JSON.stringify(updatedDoc));
      
      // Ensure document ID is in the list
      const documentIds = JSON.parse(localStorage.getItem('documentIds') || '[]');
      if (!documentIds.includes(id)) {
        documentIds.unshift(id);
        localStorage.setItem('documentIds', JSON.stringify(documentIds));
      }
      
      // Update local state
      setDocument(updatedDoc);
      setSaveMessage('Document saved successfully');
      toast.success('Document saved successfully!');
      
      // Hide message after 3 seconds
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error saving document:', err);
      setError('Failed to save document');
      toast.error('Failed to save document');
    } finally {
      setSaving(false);
    }
  };
  
  const clearHistory = () => {
    setConfirmDialog({
      show: true,
      message: 'Are you sure you want to clear the revision history?',
      onConfirm: () => {
        // Initialize history with current content
        initializeHistory(content);
        toast.info('Revision history has been cleared');
        setConfirmDialog({ show: false, message: '', onConfirm: null });
      }
    });
  };

  const deleteDocument = () => {
    setConfirmDialog({
      show: true,
      message: 'Are you sure you want to delete this document?',
      onConfirm: () => {
        try {
          // Remove from document list
          const documentIds = JSON.parse(localStorage.getItem('documentIds') || '[]');
          const updatedIds = documentIds.filter(docId => docId !== id);
          localStorage.setItem('documentIds', JSON.stringify(updatedIds));
          
          // Remove the document itself
          localStorage.removeItem(`document_${id}`);
          
          // Remove history
          localStorage.removeItem(`history_${id}`);
          
          // Show success message
          toast.success('Document deleted successfully');
          
          // Navigate back to document list
          navigate('/');
        } catch (err) {
          console.error('Error deleting document:', err);
          setError('Failed to delete document');
          toast.error('Failed to delete document');
        }
        setConfirmDialog({ show: false, message: '', onConfirm: null });
      }
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen={true} text="Loading document..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <AlertBanner message={error} type="error" />
        <Link to="/" className="back-btn">← Back to Documents</Link>
      </div>
    );
  }

  return (
    <div className="editor-container">
      {confirmDialog.show && (
        <div className="confirmation-dialog-overlay">
          <div className="confirmation-dialog">
            <h3>Confirm Action</h3>
            <p>{confirmDialog.message}</p>
            <div className="confirmation-actions">
              <button 
                className="confirm-button"
                onClick={() => confirmDialog.onConfirm()}
              >
                Yes, Proceed
              </button>
              <button 
                className="cancel-button"
                onClick={() => setConfirmDialog({ show: false, message: '', onConfirm: null })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    
      {showToneSelector && (
        <div className="tone-selector-overlay" onClick={() => setShowToneSelector(false)}>
          <div className="tone-selector-panel" onClick={(e) => e.stopPropagation()}>
            <div className="tone-selector-header">
              <h3>Adjust tone</h3>
              <div className="ai-badge">AI beta</div>
              <button className="close-button" onClick={() => setShowToneSelector(false)}>×</button>
            </div>
            
            <div className="tone-grid">
              {/* Row 1 - Top row */}
              <div 
                className={`tone-cell top-left ${toneLevel <= 3 && verbosityLevel === 'concise' ? 'active' : ''}`}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setToneLevel(2); 
                  setVerbosityLevel('concise'); 
                }}
              >
                {toneLevel <= 3 && verbosityLevel === 'concise' && <div className="cursor-dot"></div>}
              </div>
              <div 
                className={`tone-cell ${toneLevel >= 7 && verbosityLevel === 'concise' ? 'active' : ''}`}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setToneLevel(8); 
                  setVerbosityLevel('concise'); 
                }}
              >
                Professional
                {toneLevel >= 7 && verbosityLevel === 'concise' && <div className="cursor-dot"></div>}
              </div>
              <div 
                className={`tone-cell top-right ${toneLevel >= 7 && verbosityLevel === 'detailed' ? 'active' : ''}`}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setToneLevel(8); 
                  setVerbosityLevel('detailed'); 
                }}
              >
                {toneLevel >= 7 && verbosityLevel === 'detailed' && <div className="cursor-dot"></div>}
              </div>
              
              {/* Row 2 - Middle row */}
              <div 
                className={`tone-cell ${toneLevel === 5 && verbosityLevel === 'concise' ? 'active' : ''}`}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setVerbosityLevel('concise'); 
                  setToneLevel(5); 
                }}
              >
                <span className="vertical-text">Concise</span>
                {toneLevel === 5 && verbosityLevel === 'concise' && <div className="cursor-dot"></div>}
              </div>
              <div 
                className={`tone-cell center-cell ${toneLevel === 5 && verbosityLevel === 'normal' ? 'active' : ''}`}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setToneLevel(5); 
                  setVerbosityLevel('normal'); 
                }}
              >
                {toneLevel === 5 && verbosityLevel === 'normal' && <div className="cursor-dot"></div>}
              </div>
              <div 
                className={`tone-cell ${toneLevel === 5 && verbosityLevel === 'detailed' ? 'active' : ''}`}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setVerbosityLevel('detailed'); 
                  setToneLevel(5); 
                }}
              >
                <span className="vertical-text-right">Expanded</span>
                {toneLevel === 5 && verbosityLevel === 'detailed' && <div className="cursor-dot"></div>}
              </div>
              
              {/* Row 3 - Bottom row */}
              <div 
                className={`tone-cell bottom-left ${toneLevel <= 3 && verbosityLevel === 'detailed' ? 'active' : ''}`}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setToneLevel(2); 
                  setVerbosityLevel('detailed'); 
                }}
              >
                {toneLevel <= 3 && verbosityLevel === 'detailed' && <div className="cursor-dot"></div>}
              </div>
              <div 
                className={`tone-cell ${toneLevel <= 3 && verbosityLevel === 'normal' ? 'active' : ''}`}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setToneLevel(2); 
                  setVerbosityLevel('normal'); 
                }}
              >
                Casual
                {toneLevel <= 3 && verbosityLevel === 'normal' && <div className="cursor-dot"></div>}
              </div>
              <div 
                className={`tone-cell bottom-right ${toneLevel >= 7 && verbosityLevel === 'normal' ? 'active' : ''}`}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setToneLevel(8); 
                  setVerbosityLevel('normal'); 
                }}
              >
                {toneLevel >= 7 && verbosityLevel === 'normal' && <div className="cursor-dot"></div>}
              </div>
            </div>
            
            <div className="tone-section-divider">
              <span>Or pick a preset</span>
            </div>
            
            <div className="preset-buttons">
              <button className="preset-button" onClick={() => selectTonePreset('executive')}>Executive</button>
              <button className="preset-button" onClick={() => selectTonePreset('technical')}>Technical</button>
              <button className="preset-button" onClick={() => selectTonePreset('basic')}>Basic</button>
              <button className="preset-button" onClick={() => selectTonePreset('educational')}>Educational</button>
            </div>
            
            <div className="tone-footer">
              <div className="ai-disclaimer">AI outputs can be misleading or wrong</div>
              <button className="apply-tone-btn" onClick={() => { adjustToneHandler(); setShowToneSelector(false); }} disabled={adjusting || !content.trim()}>
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    
      <div className="editor-header">
        <div className="header-left">
          <Link to="/" className="tonecraft-logo">
            <span style={{ color: '#4366f8' }}>Tone</span>Craft
          </Link>
          <Link to="/" className="back-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Documents
          </Link>
        </div>
        <input
          type="text"
          className="document-title-input"
          value={title}
          onChange={handleTitleChange}
          placeholder="Document Title"
        />
        <div className="editor-actions">
          <button 
            className="delete-doc-btn"
            onClick={deleteDocument}
            title="Delete document"
          >
            Delete
          </button>
          <button 
            className="save-btn"
            onClick={saveDocument}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="button-spinner"></span>
                Saving...
              </>
            ) : 'Save'}
          </button>
        </div>
      </div>

      {saveMessage && <AlertBanner message={saveMessage} type="success" />}
      {error && <AlertBanner message={error} type="error" />}

      <div className="editor-main">
        <div className="editor-content">
          <div className="editor-toolbar">
            <button 
              className="history-btn undo-btn" 
              onClick={undo}
              disabled={currentHistoryIndex <= 0}
              title="Undo"
            >
              ↩ Undo
            </button>
            <button 
              className="history-btn redo-btn" 
              onClick={redo}
              disabled={currentHistoryIndex >= history.length - 1}
              title="Redo"
            >
              ↪ Redo
            </button>
            <button 
              className="history-btn clear-history-btn" 
              onClick={clearHistory}
              disabled={history.length <= 1}
              title="Clear History"
            >
              Clear History
            </button>
            <div className="history-status">
              {history.length > 0 ? `Revision ${currentHistoryIndex + 1} of ${history.length}` : 'No history'}
            </div>
          </div>
          <textarea
            value={content}
            onChange={handleContentChange}
            onSelect={handleTextSelection}
            placeholder="Start writing your document here..."
            className="content-textarea"
          />
        </div>
        
        <div className="editor-sidebar">
          <div className="tone-control">
            <h3>Tone Adjustment</h3>
            <div className="tone-settings-summary">
              <div>
                <span className="setting-label">Tone Level:</span> 
                <span className="setting-value">
                  {toneLevel}/10 
                  <span className="tone-indicator">
                    {toneLevel <= 3 ? '(Casual)' : toneLevel >= 8 ? '(Formal)' : '(Neutral)'}
                  </span>
                </span>
              </div>
              <div>
                <span className="setting-label">Verbosity:</span> 
                <span className="setting-value">
                  {verbosityLevel === 'concise' ? 'Concise' : verbosityLevel === 'detailed' ? 'Detailed' : 'Normal'}
                </span>
              </div>
            </div>
            <button
              className="adjust-tone-settings-btn"
              onClick={() => setShowToneSelector(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              Advanced Tone Settings
            </button>
            <div className="selection-hint">
              {hasSelection ? 
                <span className="has-selection">Selected text will be adjusted</span> : 
                <span>Select text to adjust only a portion</span>
              }
            </div>
            <button
              className="adjust-tone-btn"
              onClick={adjustToneHandler}
              disabled={adjusting || !content.trim()}
            >
              {adjusting ? (
                <>
                  <span className="button-spinner"></span>
                  Adjusting...
                </>
              ) : 'Adjust Tone'}
            </button>
          </div>
          
          <div className="document-info">
            <h3>Document Info</h3>
            <p><strong>Created:</strong> {document ? new Date(document.created).toLocaleString() : '-'}</p>
            <p><strong>Last Edited:</strong> {document ? new Date(document.lastEdited).toLocaleString() : '-'}</p>
            <p><strong>Document ID:</strong> {document?.id}</p>
            <p><strong>Revisions:</strong> {history.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor; 