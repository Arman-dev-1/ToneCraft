import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertBanner from '../components/AlertBanner';
import './DocumentList.css';

const DocumentListPage = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', onConfirm: null });

  // Load document list from localStorage on component mount
  useEffect(() => {
    setLoading(true);
    try {
      // Get the list of document IDs
      const documentIds = JSON.parse(localStorage.getItem('documentIds') || '[]');
      
      // Fetch each document by ID
      const loadedDocuments = documentIds.map(id => {
        const docData = localStorage.getItem(`document_${id}`);
        return docData ? JSON.parse(docData) : null;
      }).filter(doc => doc !== null); // Remove any null documents
      
      // Sort by last edited date (newest first)
      loadedDocuments.sort((a, b) => new Date(b.lastEdited) - new Date(a.lastEdited));
      
      setDocuments(loadedDocuments);
    } catch (err) {
      console.error('Error loading documents from localStorage:', err);
      setError('Failed to load documents. Please try again.');
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTitleChange = (e) => {
    setNewDocTitle(e.target.value);
  };

  const createNewDocument = (e) => {
    e.preventDefault();
    
    if (!newDocTitle.trim()) {
      setError('Please enter a document title');
      toast.error('Please enter a document title');
      return;
    }

    try {
      // Generate a unique ID
      const newId = Date.now().toString();
      
      const newDoc = {
        id: newId,
        title: newDocTitle.trim(),
        content: '',
        created: new Date().toISOString(),
        lastEdited: new Date().toISOString()
      };
      
      // Update document list
      const documentIds = JSON.parse(localStorage.getItem('documentIds') || '[]');
      documentIds.unshift(newId);
      localStorage.setItem('documentIds', JSON.stringify(documentIds));
      
      // Store the document separately
      localStorage.setItem(`document_${newId}`, JSON.stringify(newDoc));
      
      // Reset form and state
      setNewDocTitle('');
      setError(null);
      
      // Show success message
      toast.success('Document created successfully!');
      
      // Navigate to the new document
      navigate(`/doc/${newId}`);
    } catch (err) {
      console.error('Error creating new document:', err);
      setError('Failed to create document. Please try again.');
      toast.error('Failed to create document');
    }
  };

  const deleteDocument = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    
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
          
          // Update state
          const updatedDocs = documents.filter(doc => doc.id !== id);
          setDocuments(updatedDocs);
          
          // Show success message
          toast.success('Document deleted successfully');
        } catch (err) {
          console.error('Error deleting document:', err);
          setError('Failed to delete document. Please try again.');
          toast.error('Failed to delete document');
        }
        setConfirmDialog({ show: false, message: '', onConfirm: null });
      }
    });
  };

  return (
    <div className="document-list-container">
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

      <div className="document-list-header">
        <h1>My Documents</h1>
      </div>

      <form className="new-document-form" onSubmit={createNewDocument}>
        <input
          type="text"
          placeholder="Enter document title"
          value={newDocTitle}
          onChange={handleTitleChange}
          className="document-title-input"
        />
        <button 
          type="submit" 
          className="new-document-btn"
        >
          Create Document
        </button>
      </form>

      {error && <AlertBanner message={error} type="error" onClose={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner text="Loading documents..." />
      ) : documents.length === 0 ? (
        <div className="no-documents">
          <p>You don't have any documents yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="document-grid">
          {documents.map(doc => (
            <div key={doc.id} className="document-card-wrapper">
              <Link 
                to={`/doc/${doc.id}`} 
                className="document-card"
              >
                <div className="document-title">{doc.title}</div>
                <div className="document-meta">
                  <span>Created: {new Date(doc.created).toLocaleDateString()}</span>
                  <span>Last edited: {new Date(doc.lastEdited).toLocaleDateString()}</span>
                </div>
              </Link>
              <button 
                className="delete-document-btn" 
                onClick={(e) => deleteDocument(doc.id, e)}
                title="Delete document"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentListPage; 