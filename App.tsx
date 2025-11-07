
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import GeneratedImageDisplay from './components/GeneratedImageDisplay';
import { fileToImageData } from './utils/fileUtils';
import { editImage } from './services/geminiService';
import { SparklesIcon } from './components/icons/SparklesIcon';

const App: React.FC = () => {
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const originalImagePreview = useMemo(() => {
        if (originalFile) {
            return URL.createObjectURL(originalFile);
        }
        return null;
    }, [originalFile]);
    
    // Clean up the object URL when the component unmounts or the file changes
    useEffect(() => {
        return () => {
            if (originalImagePreview) {
                URL.revokeObjectURL(originalImagePreview);
            }
        };
    }, [originalImagePreview]);


    const handleImageUpload = (file: File | null) => {
        setOriginalFile(file);
        setGeneratedImage(null); // Clear previous result
        setError(null);
    };

    const handleGenerate = async () => {
        if (!originalFile || !prompt) {
            setError("Please upload an image and provide a prompt.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const imageData = await fileToImageData(originalFile);
            const generatedBase64 = await editImage(imageData, prompt);
            setGeneratedImage(`data:image/png;base64,${generatedBase64}`);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = 'generated-image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const isGenerateDisabled = isLoading || !originalFile || !prompt.trim();

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
            <Header />
            <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Left panel for controls */}
                <div className="lg:col-span-1 w-full flex flex-col gap-6 bg-gray-800/50 p-6 rounded-xl border border-gray-700 h-fit">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">1. Upload Reference Image</label>
                      <ImageUploader onImageUpload={handleImageUpload} previewUrl={originalImagePreview} />
                    </div>
                    
                    <div>
                      <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-300 mb-2">2. Describe Your Edit</label>
                      <textarea
                          id="prompt-input"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="e.g., Make the man stand on a beach with a sunset background"
                          className="w-full h-32 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                          disabled={isLoading}
                      />
                    </div>
                    
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerateDisabled}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        {isLoading ? 'Generating...' : 'Generate Image'}
                    </button>
                    
                    {error && <div className="text-red-400 bg-red-900/50 border border-red-700 p-3 rounded-lg text-sm">{error}</div>}
                </div>

                {/* Right panel for results */}
                <div className="lg:col-span-2 w-full">
                    <GeneratedImageDisplay 
                        originalImageUrl={originalImagePreview} 
                        generatedImageUrl={generatedImage} 
                        isLoading={isLoading} 
                        onDownload={handleDownload}
                    />
                </div>
            </main>
        </div>
    );
};

export default App;
