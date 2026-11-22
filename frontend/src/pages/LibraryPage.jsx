import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import { deleteDocument, errorMessage, listDocuments, uploadDocument } from '../services/api';
import { Alert, EmptyState, PageHeader, Spinner } from '../components/common/ui';

const ACCEPT = '.pdf,.docx,.txt,.md,.csv';

const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const LibraryPage = () => {
  const [docs, setDocs] = useState(null);
  const [queue, setQueue] = useState([]); // [{name, progress, status, error}]
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const inputRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const { data } = await listDocuments();
      setDocs(data);
    } catch (e) {
      setError(errorMessage(e));
      setDocs([]);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateItem = (name, patch) =>
    setQueue((q) => q.map((item) => (item.name === name ? { ...item, ...patch } : item)));

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setError(null);
    setQueue(files.map((f) => ({ name: f.name, progress: 0, status: 'waiting' })));
    // Upload sequentially: indexing is CPU-heavy on the backend.
    for (const file of files) {
      updateItem(file.name, { status: 'uploading' });
      try {
        await uploadDocument(file, (p) => updateItem(file.name, { progress: p, status: p === 100 ? 'indexing' : 'uploading' }));
        updateItem(file.name, { status: 'done', progress: 100 });
      } catch (e) {
        updateItem(file.name, { status: 'error', error: errorMessage(e, 'Upload failed') });
      }
    }
    if (inputRef.current) inputRef.current.value = '';
    refresh();
  };

  const handleDelete = async (id) => {
    setConfirmId(null);
    try {
      await deleteDocument(id);
      setDocs((d) => d.filter((doc) => doc.id !== id));
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  return (
    <div className="max-w-4xl">
      <PageHeader title="Library" subtitle="Your study material. Chat and quizzes are grounded in these files." />

      <label
        htmlFor="file-upload"
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        className={`card p-8 flex flex-col items-center border-2 border-dashed cursor-pointer transition-colors ${
          dragging ? 'border-highlight bg-highlight/10' : 'border-accent hover:border-highlight'
        }`}
      >
        <FiUploadCloud className="text-5xl text-highlight mb-3" />
        <p className="font-medium">Drop files here or click to browse</p>
        <p className="text-sm text-text-secondary mt-1">PDF, DOCX, TXT, Markdown or CSV · up to 20 MB each</p>
        <input ref={inputRef} id="file-upload" type="file" accept={ACCEPT} multiple className="hidden"
          onChange={(e) => handleFiles(e.target.files)} />
      </label>

      {queue.length > 0 && (
        <ul className="mt-4 space-y-2">
          {queue.map((item) => (
            <li key={item.name} className="card p-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="truncate">{item.name}</span>
                <span className={item.status === 'error' ? 'text-red-300' : item.status === 'done' ? 'text-green-300' : 'text-text-secondary'}>
                  {item.status === 'indexing' ? 'Indexing…' : item.status === 'uploading' ? `${item.progress}%` : item.status === 'error' ? 'Failed' : item.status === 'done' ? 'Added' : 'Waiting'}
                </span>
              </div>
              {item.error && <p className="text-red-300 mt-1">{item.error}</p>}
              {['uploading', 'indexing'].includes(item.status) && (
                <div className="w-full bg-accent rounded-full h-1.5 mt-2">
                  <div className="bg-highlight h-1.5 rounded-full transition-all" style={{ width: `${item.progress}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {error && <div className="mt-4"><Alert onClose={() => setError(null)}>{error}</Alert></div>}

      <h2 className="text-lg font-semibold mt-8 mb-3">Documents {docs?.length ? `(${docs.length})` : ''}</h2>
      <div className="card">
        {docs === null ? (
          <Spinner label="Loading documents" className="p-6" />
        ) : docs.length === 0 ? (
          <EmptyState icon={FiFileText} title="No documents yet">
            Upload lecture notes or a textbook chapter to get started.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-accent">
            {docs.map((doc) => (
              <li key={doc.id} className="flex items-center gap-4 p-4">
                <FiFileText className="text-xl text-highlight shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{doc.filename}</p>
                  <p className="text-xs text-text-secondary">
                    {formatDate(doc.uploaded_at)} · {doc.chunk_count} {doc.chunk_count === 1 ? 'section' : 'sections'} · {(doc.char_count / 1000).toFixed(1)}k characters
                  </p>
                </div>
                <Link to={`/quiz?topic=${encodeURIComponent(doc.filename.replace(/\.[^.]+$/, ''))}`} className="text-sm text-highlight hover:underline hidden sm:block">
                  Quiz me
                </Link>
                {confirmId === doc.id ? (
                  <span className="flex gap-2">
                    <button onClick={() => handleDelete(doc.id)} className="text-sm text-red-300 hover:underline">Delete</button>
                    <button onClick={() => setConfirmId(null)} className="text-sm text-text-secondary hover:underline">Cancel</button>
                  </span>
                ) : (
                  <button onClick={() => setConfirmId(doc.id)} aria-label={`Delete ${doc.filename}`} className="text-text-secondary hover:text-red-300">
                    <FiTrash2 />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
