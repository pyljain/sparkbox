import { useState, useEffect } from 'react';
import { Upload, FileText, Download, RefreshCw, X, Check } from 'lucide-react';

const FileUploadApp = () => {
  const [workflows, setWorkflows] = useState([
    { id: '1', name: 'Accounting' },
    { id: '2', name: 'Human Resources' },
    { id: '3', name: 'Marketing' },
    { id: '4', name: 'Engineering' }
  ]);
  
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  
  // Handle workflow selection
  const handleWorkflowSelect = (workflowId) => {
    setSelectedWorkflow(workflowId);
    fetchFiles(workflowId);
  };
  
  // Fetch files for selected workflow
  const fetchFiles = (workflowId) => {
    setLoading(true);
    
    // Commented out actual API call that would be used in production
    fetch(`/api/v1/workflows/${workflowId}/files`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch files');
        return response.json();
      })
      .then(data => {
        console.log(data);
        setFiles(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching files:', error);
        setLoading(false);
      });
    
    // Mock API response
    // setTimeout(() => {
    //   const mockFiles = [
    //     { 
    //       name: 'report.pdf', 
    //       size: 1024 * 1024 * 2.7, // 2.7 MB
    //       uploadDate: '2025-04-28T14:23:45Z'
    //     },
    //     { 
    //       name: 'data.xlsx', 
    //       size: 1024 * 512, // 512 KB
    //       uploadDate: '2025-05-01T09:15:22Z'
    //     },
    //     { 
    //       name: 'image.png', 
    //       size: 1024 * 1024 * 1.5, // 1.5 MB
    //       uploadDate: '2025-05-02T16:45:12Z'
    //     }
    //   ];
      
    //   if (workflowId === '1') {
    //     mockFiles.push({ 
    //       name: 'financial_report_q1.pdf', 
    //       size: 1024 * 1024 * 4.2, // 4.2 MB
    //       uploadDate: '2025-04-15T11:32:18Z'
    //     });
    //   } else if (workflowId === '2') {
    //     mockFiles.push({ 
    //       name: 'new_hire_forms.docx', 
    //       size: 1024 * 768, // 768 KB
    //       uploadDate: '2025-04-27T08:12:44Z'
    //     });
    //   }
      
    //   setFiles(mockFiles);
    //   setLoading(false);
    // }, 800);
  };
  
  // Upload file
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file || !selectedWorkflow) return;
    
    setUploadStatus('uploading');
    
    // Convert file to base64
    const reader = new FileReader();

    reader.onload = () => {
      const base64Content = reader.result.split(',')[1]; // Remove data:mime/type;base64, prefix

      const payload = {
        filename: file.name,
        content: base64Content,
      };
    
      fetch(`/api/v1/workflows/${selectedWorkflow}/files/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
        .then(response => {
          if (!response.ok) throw new Error('Failed to upload file');
          setUploadStatus('success');
          fetchFiles(selectedWorkflow); // Refresh file list
          setTimeout(() => setUploadStatus(null), 3000);
        })
        .catch(error => {
          console.error('Error uploading file:', error);
          setUploadStatus('error');
          setTimeout(() => setUploadStatus(null), 3000);
        });
    };
    
    reader.onerror = () => {
      console.error('File reading error:', reader.error);
      setUploadStatus('error');
    };
  
    reader.readAsDataURL(file);
  };
  
  // Download file
  const handleDownload = (filename) => {
    if (!selectedWorkflow) return;
    
    // Commented out actual API call that would be used in production
    fetch(`/api/v1/workflows/${selectedWorkflow}/files/${filename}`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to download file');
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Error downloading file:', error);
      });
    
    // Mock download (in a real app, this would trigger the actual download)
    // console.log(`Downloading file: ${filename} from workflow: ${selectedWorkflow}`);
    // For demo purposes - create a simulated download alert
    // alert(`Downloading ${filename}...`);
  };
  
  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="bg-black text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">File Manager</h1>
      </header>
      
      {/* Main content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar for workflow selection */}
        <div className="w-64 bg-muted p-4 border-r border-border">
          <h2 className="text-lg font-semibold mb-4">Workflows</h2>
          <ul className="space-y-1">
            {workflows.map(workflow => (
              <li key={workflow.id}>
                <button
                  className={`w-full text-left px-3 py-2 rounded-md ${
                    selectedWorkflow === workflow.id
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'hover:bg-muted-foreground/10'
                  }`}
                  onClick={() => handleWorkflowSelect(workflow.id)}
                >
                  {workflow.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Main area */}
        <div className="flex-1 p-6 overflow-auto">
          {selectedWorkflow ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  Files for {workflows.find(w => w.id === selectedWorkflow)?.name}
                </h2>
                
                <div className="flex items-center space-x-4">
                  {/* Upload button */}
                  <div className="relative">
                    <input
                      type="file"
                      id="file-upload"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-primary/90 cursor-pointer"
                    >
                      <Upload size={18} className="mr-2" />
                      Upload File
                    </label>
                  </div>
                  
                  {/* Refresh button */}
                  <button
                    className="p-2 rounded-md hover:bg-muted transition-colors"
                    onClick={() => fetchFiles(selectedWorkflow)}
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
              </div>
              
              {/* Upload status notification */}
              {uploadStatus && (
                <div className={`mb-4 p-3 rounded-md ${
                  uploadStatus === 'uploading' ? 'bg-blue-100/20 border border-blue-200/30' :
                  uploadStatus === 'success' ? 'bg-green-100/20 border border-green-200/30' :
                  'bg-destructive/10 border border-destructive/20'
                }`}>
                  <div className="flex items-center">
                    {uploadStatus === 'uploading' && <RefreshCw size={18} className="mr-2 animate-spin text-blue-500" />}
                    {uploadStatus === 'success' && <Check size={18} className="mr-2 text-green-500" />}
                    {uploadStatus === 'error' && <X size={18} className="mr-2 text-destructive" />}
                    
                    <span className={`${
                      uploadStatus === 'uploading' ? 'text-blue-700' :
                      uploadStatus === 'success' ? 'text-green-700' :
                      'text-destructive'
                    }`}>
                      {uploadStatus === 'uploading' && 'Uploading file...'}
                      {uploadStatus === 'success' && 'File uploaded successfully!'}
                      {uploadStatus === 'error' && 'Failed to upload file. Please try again.'}
                    </span>
                  </div>
                </div>
              )}
              
              {/* File list */}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <RefreshCw size={24} className="animate-spin text-muted-foreground" />
                </div>
              ) : files.length > 0 ? (
                <div className="bg-card rounded-lg shadow overflow-hidden border border-border">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">File Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Uploaded</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {files.map((file, index) => (
                        <tr key={index} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FileText size={18} className="mr-2 text-muted-foreground" />
                              <span>{file.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {formatFileSize(file.size)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {formatDate(file.uploadDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="text-primary hover:text-primary/80 flex items-center ml-auto"
                              onClick={() => handleDownload(file.name)}
                            >
                              <Download size={18} className="mr-1" />
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-card rounded-lg shadow p-6 text-center text-muted-foreground border border-border">
                  No files available for this workflow. Upload a file to get started.
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <FileText size={48} className="mb-4 text-muted" />
              <p className="text-lg">Select a workflow to view and manage files</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FileUploadApp;