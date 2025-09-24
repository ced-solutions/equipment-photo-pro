import React, { useState, useCallback, useEffect } from 'react';
import { Upload as UploadIcon, Download, Eye, Edit3, History, Clock, Image as ImageIcon } from 'lucide-react';
import ImageComparison from '../components/ImageComparison';
import { API_ENDPOINTS } from '../config/api';

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({});
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [selectedComparison, setSelectedComparison] = useState(null);
  const [currentComparisonIndex, setCurrentComparisonIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('upload');
  const [history, setHistory] = useState([]);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [promptSettings, setPromptSettings] = useState({
    skyType: 'subtle-clouds',
    pavementType: 'cement-lot',
    landscapeType: 'rolling-fields',
    equipmentType: 'tractor',
    customPrompt: ''
  });

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('equipmentPhotoHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading history from localStorage:', error);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('equipmentPhotoHistory', JSON.stringify(history));
  }, [history]);

  // Equipment facts for display during processing
  const equipmentFacts = [
    "The first John Deere tractor was built in 1918 and was called the 'Waterloo Boy'.",
    "Caterpillar Inc. was formed in 1925 through the merger of Holt Manufacturing Company and C.L. Best Tractor Company.",
    "The largest tractor ever built was the Big Bud 16V-747, weighing 95,000 pounds and producing 1,100 horsepower.",
    "Kubota was founded in 1890 in Osaka, Japan, originally as a foundry for cast iron pipes.",
    "The first commercially successful track-type tractor was built by Benjamin Holt in 1904.",
    "New Holland was established in 1895 and became part of CNH Industrial in 1999.",
    "The term 'skid steer' comes from the machine's ability to turn in place by skidding its wheels.",
    "Case IH was formed in 1985 through the merger of Case Corporation and International Harvester.",
    "The first hydraulic excavator was built by Poclain in 1951 in France.",
    "Massey Ferguson tractors are known for their distinctive red color, which was chosen for visibility in fields.",
    "The first diesel engine used in a tractor was introduced by John Deere in 1949.",
    "Kubota's first tractor was the L200, introduced in 1960 and weighing just 1,200 pounds.",
    "The largest combine harvester ever built was the New Holland CR10.90, with a 45-foot cutting width.",
    "Caterpillar's first track-type tractor was the Holt 40, built in 1904.",
    "The first four-wheel drive tractor was built by International Harvester in 1961."
  ];

  // Auto-scroll to results when processing completes
  useEffect(() => {
    if (showSuccessNotification) {
      const resultsElement = document.getElementById('enhanced-results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      // Hide notification after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessNotification]);

  // Cycle through facts during processing
  useEffect(() => {
    if (processing) {
      const interval = setInterval(() => {
        setCurrentFactIndex(prev => (prev + 1) % equipmentFacts.length);
      }, 10000); // Change fact every 10 seconds
      return () => clearInterval(interval);
    }
  }, [processing, equipmentFacts.length]);

  // Generate dynamic prompt based on settings
  const generatePrompt = () => {
    const pavementDescriptions = {
      'cement-lot': 'realistic, textured cement lot',
      'asphalt-lot': 'realistic, textured asphalt lot',
      'wet-asphalt': 'realistic, wet asphalt lot that appears to have recently rained, with natural reflections and darker tones',
      'gravel-lot': 'realistic, textured gravel lot',
      'concrete-lot': 'realistic, textured concrete lot'
    };

    const skyDescriptions = {
      'subtle-clouds': 'very subtle, diffused clouds or a light, natural haze',
      'clear-sky': 'clear, bright sky with minimal clouds',
      'dramatic-clouds': 'dramatic, well-defined clouds with natural variations',
      'sunset-sky': 'beautiful sunset sky with warm colors and natural cloud formations'
    };

    const landscapeDescriptions = {
      'rolling-fields': 'truly natural, subtly rolling landscape of green fields with authentic variations in foliage',
      'flat-fields': 'natural, flat landscape of green fields with authentic variations in foliage',
      'grass': 'natural grass landscape with authentic variations in texture and color',
      'hillside': 'natural hillside landscape with authentic variations in terrain and foliage',
      'forest-edge': 'natural forest edge landscape with authentic variations in trees and foliage'
    };

    return `Maintain the original perspective and zoom of the equipment. Place the main subject (e.g., 'a ${promptSettings.equipmentType}', 'a combine harvester', 'a green ATV') on a ${pavementDescriptions[promptSettings.pavementType]}. In the background, feature a ${landscapeDescriptions[promptSettings.landscapeType]}, blending seamlessly with an expansive sky displaying ${skyDescriptions[promptSettings.skyType]}. Ensure realistic, balanced lighting enhances the subject without looking artificial. Remove any unnecessary objects to maintain a clean, professional aesthetic.

CRITICAL: Do not alter the subject of the image at all. Keep the equipment exactly as it appears in the original - preserve all details, colors, text, numbers, logos, and physical characteristics. Only change the background, lighting, and environmental elements. The equipment itself must remain completely unchanged.${promptSettings.customPrompt ? ` Additional requirements: ${promptSettings.customPrompt}` : ''}`;
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/')
      );
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files).filter(file => 
        file.type.startsWith('image/')
      );
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processImages = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    setProcessedFiles([]);
    
    // Initialize progress for each file
    const initialProgress = {};
    files.forEach((file, index) => {
      initialProgress[file.name] = {
        status: 'uploading',
        progress: 0,
        message: 'Uploading image...'
      };
    });
    setProcessingProgress(initialProgress);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      formData.append('promptSettings', JSON.stringify(promptSettings));
      formData.append('dynamicPrompt', generatePrompt());

      // Process images one by one with realistic progress
      const processed = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Create a single-file form data for this image
        const singleFileFormData = new FormData();
        singleFileFormData.append('images', file);
        singleFileFormData.append('promptSettings', JSON.stringify(promptSettings));
        singleFileFormData.append('dynamicPrompt', generatePrompt());

        // Simulate realistic 60-second processing with detailed steps
        const processingSteps = [
          { progress: 5, message: 'Analyzing image structure...' },
          { progress: 12, message: 'Identifying equipment details...' },
          { progress: 20, message: 'Isolating main subject...' },
          { progress: 28, message: 'Removing unnecessary objects...' },
          { progress: 35, message: 'Setting optimal lighting angles...' },
          { progress: 45, message: 'Adding realistic sky background...' },
          { progress: 55, message: 'Analyzing landscape elements...' },
          { progress: 65, message: 'Enhancing surface textures...' },
          { progress: 75, message: 'Applying professional lighting...' },
          { progress: 85, message: 'Finalizing color adjustments...' },
          { progress: 95, message: 'Generating enhanced image...' }
        ];

        // Simulate processing steps
        for (const step of processingSteps) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds per step
          
          setProcessingProgress(prev => ({
            ...prev,
            [file.name]: {
              status: 'processing',
              progress: step.progress,
              message: step.message
            }
          }));
        }

        // Make the actual API call
        const response = await fetch(API_ENDPOINTS.upload, {
          method: 'POST',
          body: singleFileFormData,
        });

        const result = await response.json();
        console.log('Processing result:', result);

        if (result.success && result.files.length > 0) {
          const processedFile = {
            id: Date.now() + i,
            original: file,
            processed: result.files[0],
            prompt: result.prompt,
            aiModel: result.aiModel,
            aiConfigured: result.aiConfigured
          };
          processed.push(processedFile);
          
          // Update progress to completed
          setProcessingProgress(prev => ({
            ...prev,
            [file.name]: {
              status: 'completed',
              progress: 100,
              message: 'Enhancement complete!'
            }
          }));
        } else {
          throw new Error(result.error || 'Processing failed');
        }
      }

      // Set processed files
      setProcessedFiles(processed);

      // Add to history
      const historyEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        files: processed,
        promptSettings: { ...promptSettings },
        prompt: generatePrompt()
      };
      setHistory(prev => [historyEntry, ...prev]);

      // Show success notification and scroll to results
      setShowSuccessNotification(true);
    } catch (error) {
      console.error('Error processing images:', error);
      
      // Update progress to error
      files.forEach(file => {
        setProcessingProgress(prev => ({
          ...prev,
          [file.name]: {
            status: 'error',
            progress: 0,
            message: 'Processing failed'
          }
        }));
      });
      
      alert('Error processing images: ' + error.message);
    } finally {
      setProcessing(false);
      // Clear progress after a delay
      setTimeout(() => {
        setProcessingProgress({});
      }, 3000);
    }
  };

  const downloadImage = async (file) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.download}/${file.filename}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Error downloading image: ' + error.message);
    }
  };

  const openComparison = (item, index = 0) => {
    setSelectedComparison({
      original: URL.createObjectURL(item.original),
          enhanced: `${API_ENDPOINTS.download}/${item.processed.enhanced.filename}`,
      allImages: processedFiles
    });
    setCurrentComparisonIndex(index);
    setComparisonOpen(true);
  };

  const closeComparison = () => {
    setComparisonOpen(false);
    setSelectedComparison(null);
  };

  const nextComparison = () => {
    if (selectedComparison && selectedComparison.allImages) {
      const nextIndex = (currentComparisonIndex + 1) % selectedComparison.allImages.length;
      const nextItem = selectedComparison.allImages[nextIndex];
      setCurrentComparisonIndex(nextIndex);
      setSelectedComparison({
        ...selectedComparison,
        original: URL.createObjectURL(nextItem.original),
        enhanced: `${API_ENDPOINTS.download}/${nextItem.processed.enhanced.filename}`
      });
    }
  };

  const prevComparison = () => {
    if (selectedComparison && selectedComparison.allImages) {
      const prevIndex = currentComparisonIndex === 0 
        ? selectedComparison.allImages.length - 1 
        : currentComparisonIndex - 1;
      const prevItem = selectedComparison.allImages[prevIndex];
      setCurrentComparisonIndex(prevIndex);
      setSelectedComparison({
        ...selectedComparison,
        original: URL.createObjectURL(prevItem.original),
        enhanced: `${API_ENDPOINTS.download}/${prevItem.processed.enhanced.filename}`
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Upload & Process Equipment Photos
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
            Upload your equipment photos and let our AI enhance them for better sales presentations
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-4xl mx-auto">
            <p className="text-green-800 text-sm">
              <strong>AI Image Enhancement:</strong> Our advanced AI analyzes your equipment and generates professional images with customizable backgrounds, lighting, and settings to make your equipment photos stand out.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'upload'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UploadIcon className="h-5 w-5 inline mr-2" />
                Upload & Process
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <History className="h-5 w-5 inline mr-2" />
                History ({history.length})
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'upload' && (
          <div className="space-y-8">
            {/* Upload Area */}
            <div>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Photos</h2>
                
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg text-gray-600 mb-2">
                    Drag and drop your equipment photos here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or click to browse files
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 cursor-pointer"
                  >
                    Choose Files
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Files ({files.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {files.map((file, index) => {
                        const progress = processingProgress[file.name];
                        return (
                          <div key={index} className="border rounded-lg p-4">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-32 object-cover rounded mb-2"
                            />
                            <p className="text-sm text-gray-600 truncate">{file.name}</p>
                            
                            {/* Progress Bar */}
                            {progress && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-500">{progress.message}</span>
                                  <span className="text-xs text-gray-500">{progress.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      progress.status === 'completed' 
                                        ? 'bg-green-500' 
                                        : progress.status === 'error'
                                        ? 'bg-red-500'
                                        : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${progress.progress}%` }}
                                  ></div>
                                </div>
                                {progress.status === 'completed' && (
                                  <div className="flex items-center mt-1 text-green-600 text-xs">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Complete
                                  </div>
                                )}
                                {progress.status === 'error' && (
                                  <div className="flex items-center mt-1 text-red-600 text-xs">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Failed
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <button
                              onClick={() => removeFile(index)}
                              className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Prompt Editor Panel */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Edit3 className="h-5 w-5 mr-2" />
                Enhancement Settings
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sky Type</label>
                  <select
                    value={promptSettings.skyType}
                    onChange={(e) => setPromptSettings(prev => ({ ...prev, skyType: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="subtle-clouds">Subtle Clouds</option>
                    <option value="clear-sky">Clear Sky</option>
                    <option value="dramatic-clouds">Dramatic Clouds</option>
                    <option value="sunset-sky">Sunset Sky</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pavement Type</label>
                  <select
                    value={promptSettings.pavementType}
                    onChange={(e) => setPromptSettings(prev => ({ ...prev, pavementType: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cement-lot">Cement Lot</option>
                    <option value="asphalt-lot">Asphalt Lot</option>
                    <option value="wet-asphalt">Wet Asphalt</option>
                    <option value="gravel-lot">Gravel Lot</option>
                    <option value="concrete-lot">Concrete Lot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Landscape Type</label>
                  <select
                    value={promptSettings.landscapeType}
                    onChange={(e) => setPromptSettings(prev => ({ ...prev, landscapeType: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="rolling-fields">Rolling Fields</option>
                    <option value="flat-fields">Flat Fields</option>
                    <option value="grass">Grass</option>
                    <option value="hillside">Hillside</option>
                    <option value="forest-edge">Forest Edge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Type</label>
                  <input
                    type="text"
                    value={promptSettings.equipmentType}
                    onChange={(e) => setPromptSettings(prev => ({ ...prev, equipmentType: e.target.value }))}
                    placeholder="e.g., red tractor, combine harvester, green ATV"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Prompt (Optional)</label>
                <textarea
                  value={promptSettings.customPrompt}
                  onChange={(e) => setPromptSettings(prev => ({ ...prev, customPrompt: e.target.value }))}
                  placeholder="Add any specific requirements for the image enhancement..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>

            {/* Process Button */}
            <div className="text-center">
              <button
                onClick={processImages}
                disabled={files.length === 0 || processing}
                className={`px-8 py-3 rounded-lg font-medium text-lg transition-colors ${
                  files.length === 0 || processing
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {processing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Images...
                  </div>
                ) : (
                  'Process Images with AI'
                )}
              </button>
            </div>

            {/* Full Screen Loading Modal */}
            {processing && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                  <div className="p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Enhancing Your Equipment Photos</h2>
                      <p className="text-gray-600">
                        Processing {files.length} image{files.length > 1 ? 's' : ''} with AI...
                      </p>
                    </div>

                    {/* Equipment Facts Carousel - Mobile Responsive */}
                    <div 
                      className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 sm:p-6 mb-6 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setCurrentFactIndex(prev => (prev + 1) % equipmentFacts.length)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start">
                        <div className="flex-shrink-0 mb-3 sm:mb-0 sm:mr-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                            <span className="text-green-600 text-lg sm:text-xl font-bold">💡</span>
                          </div>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Did You Know?</h3>
                          <div className="min-h-[60px] sm:min-h-[80px] flex items-center">
                            <p className="text-gray-700 text-sm sm:text-base leading-relaxed px-2 sm:px-0">
                              {equipmentFacts[currentFactIndex]}
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 space-y-2 sm:space-y-0">
                            <p className="text-gray-500 text-xs sm:text-sm italic">
                              Tap to see more facts...
                            </p>
                            <div className="flex justify-center sm:justify-end space-x-1">
                              {equipmentFacts.map((_, index) => (
                                <div
                                  key={index}
                                  className={`w-2 h-2 rounded-full ${
                                    index === currentFactIndex ? 'bg-green-500' : 'bg-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Individual Progress Bars */}
                    <div className="space-y-4">
                      {files.map((file, index) => {
                        const progress = processingProgress[file.name];
                        return (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center mb-3">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-16 h-16 object-cover rounded mr-4"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                                <p className="text-sm text-gray-500">
                                  {progress ? progress.message : 'Preparing...'}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-lg font-semibold text-gray-900">
                                  {progress ? progress.progress : 0}%
                                </span>
                              </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className={`h-3 rounded-full transition-all duration-500 ${
                                  progress?.status === 'completed' 
                                    ? 'bg-green-500' 
                                    : progress?.status === 'error'
                                    ? 'bg-red-500'
                                    : 'bg-blue-500'
                                }`}
                                style={{ width: `${progress ? progress.progress : 0}%` }}
                              ></div>
                            </div>
                            
                            {/* Status Icons */}
                            {progress?.status === 'completed' && (
                              <div className="flex items-center mt-2 text-green-600 text-sm">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Enhancement complete!
                              </div>
                            )}
                            {progress?.status === 'error' && (
                              <div className="flex items-center mt-2 text-red-600 text-sm">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Processing failed
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Click to continue hint */}
                    <div className="text-center mt-6">
                      <p className="text-gray-500 text-sm">
                        Click anywhere to continue browsing facts
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success Notification */}
            {showSuccessNotification && (
              <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-pulse">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-800 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold">Images Enhanced Successfully!</p>
                    <p className="text-sm opacity-90">Scroll down to see your results</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSuccessNotification(false)}
                  className="ml-4 text-green-200 hover:text-white"
                >
                  ×
                </button>
              </div>
            )}


            {/* Results Section */}
            {processedFiles.length > 0 && (
              <div id="enhanced-results" className="mt-8 bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Enhanced Results</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {processedFiles.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Original</h4>
                          <img
                            src={URL.createObjectURL(item.original)}
                            alt="Original"
                            className="w-full h-32 object-cover rounded"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Enhanced</h4>
                          <img
                            src={`${API_ENDPOINTS.download}/${item.processed.enhanced.filename}`}
                            alt="Enhanced"
                            className="w-full h-32 object-cover rounded"
                            onError={(e) => {
                              console.error('Failed to load enhanced image:', item.processed.enhanced.filename);
                              console.error('Full URL:', `${API_ENDPOINTS.download}/${item.processed.enhanced.filename}`);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                            onLoad={() => {
                              console.log('Successfully loaded enhanced image:', item.processed.enhanced.filename);
                            }}
                          />
                          <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-sm" style={{display: 'none'}}>
                            <div className="text-center">
                              <p>Enhanced image not found</p>
                              <p className="text-xs mt-1">Filename: {item.processed.enhanced.filename}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <button
                          onClick={() => openComparison(item, index)}
                          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Compare Images
                        </button>
                        <button
                          onClick={() => downloadImage(item.processed.enhanced)}
                          className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Enhanced
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <History className="h-5 w-5 mr-2" />
                Processing History
              </h2>
              
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No processing history yet</h3>
                  <p className="text-gray-500">Upload and process some images to see them here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {history.map((entry) => (
                    <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            Processed on {entry.timestamp}
                          </h3>
                          <div className="mt-2 text-sm text-gray-600">
                            <p><strong>Sky:</strong> {entry.promptSettings.skyType}</p>
                            <p><strong>Pavement:</strong> {entry.promptSettings.pavementType}</p>
                            <p><strong>Landscape:</strong> {entry.promptSettings.landscapeType}</p>
                            <p><strong>Equipment:</strong> {entry.promptSettings.equipmentType}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {entry.files.map((item, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div>
                                <h4 className="text-xs font-medium text-gray-700 mb-1">Original</h4>
                                <img
                                  src={URL.createObjectURL(item.original)}
                                  alt="Original"
                                  className="w-full h-20 object-cover rounded"
                                />
                              </div>
                              <div>
                                <h4 className="text-xs font-medium text-gray-700 mb-1">Enhanced</h4>
                                <img
                                  src={`${API_ENDPOINTS.download}/${item.processed.enhanced.filename}`}
                                  alt="Enhanced"
                                  className="w-full h-20 object-cover rounded"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <button
                                onClick={() => openComparison(item, index)}
                                className="w-full bg-blue-600 text-white py-1 px-2 rounded text-xs hover:bg-blue-700 transition-colors flex items-center justify-center"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Compare
                              </button>
                              <button
                                onClick={() => downloadImage(item.processed.enhanced)}
                                className="w-full bg-green-600 text-white py-1 px-2 rounded text-xs hover:bg-green-700 transition-colors flex items-center justify-center"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Image Comparison Modal */}
        {selectedComparison && (
          <ImageComparison
            originalImage={selectedComparison.original}
            enhancedImage={selectedComparison.enhanced}
            isOpen={comparisonOpen}
            onClose={closeComparison}
            onNext={nextComparison}
            onPrev={prevComparison}
            currentIndex={currentComparisonIndex}
            totalImages={selectedComparison.allImages ? selectedComparison.allImages.length : 1}
          />
        )}
      </div>
    </div>
  );
};

export default Upload;