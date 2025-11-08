
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import GeneratedImageDisplay from './components/GeneratedImageDisplay';
import { fileToImageData, fileToDataUrl } from './utils/fileUtils';
import { editImage } from './services/geminiService';
import { SparklesIcon } from './components/icons/SparklesIcon';
import HistoryPanel from './components/HistoryPanel';
import { HistoryItem } from './types';

const HISTORY_STORAGE_KEY = 'generation-history';

const aspectRatioOptions = [
    { id: 'original', label: 'Original', value: 'original' },
    { id: 'square', label: 'Square (1:1)', value: '1:1' },
    { id: 'portrait', label: 'Portrait (3:4)', value: '3:4' },
    { id: 'landscape', label: 'Landscape (16:9)', value: '16:9' },
];

const promptSuggestions = [
    "Place the character in a futuristic city at night",
    "Change the background to a dense, magical forest",
    "Give the character a superhero costume",
    "Turn the art style into anime",
    "Add a friendly robot companion next to them",
];


const App: React.FC = () => {
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [aspectRatio, setAspectRatio] = useState<string>('original');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isCurrentGenerationSaved, setIsCurrentGenerationSaved] = useState<boolean>(false);

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (e) {
            console.error("Failed to load history from localStorage", e);
            localStorage.removeItem(HISTORY_STORAGE_KEY);
        }
    }, []);

    const handleImageUpload = async (file: File | null) => {
        setGeneratedImage(null); // Clear previous result
        setError(null);
        setIsCurrentGenerationSaved(false);

        if (file) {
            setOriginalFile(file);
            try {
                const dataUrl = await fileToDataUrl(file);
                setOriginalImageUrl(dataUrl);
            } catch (e) {
                setError("Could not read image file.");
                setOriginalImageUrl(null);
                setOriginalFile(null);
            }
        } else {
            setOriginalFile(null);
            setOriginalImageUrl(null);
        }
    };

    const handleGenerate = async () => {
        if (!originalFile || !prompt) {
            setError("Please upload an image and provide a prompt.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        setIsCurrentGenerationSaved(false);

        try {
            let finalPrompt = prompt;
            if (aspectRatio !== 'original') {
                const selectedOption = aspectRatioOptions.find(opt => opt.value === aspectRatio);
                if (selectedOption) {
                    finalPrompt = `${prompt}\n\nImportant: The output image must have a ${selectedOption.label.toLowerCase()} aspect ratio.`;
                }
            }
            
            const imageData = await fileToImageData(originalFile);
            const generatedBase64 = await editImage(imageData, finalPrompt);
            const generatedImageUrl = `data:image/png;base64,${generatedBase64}`;
            setGeneratedImage(generatedImageUrl);

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSuggestionClick = (suggestion: string) => {
        setPrompt(suggestion);
        setIsCurrentGenerationSaved(false);
    };

    const handleSaveToHistory = () => {
        if (!originalImageUrl || !generatedImage || isCurrentGenerationSaved) return;

        const newHistoryItem: HistoryItem = {
            id: `${Date.now()}-${Math.random()}`,
            originalImage: originalImageUrl,
            prompt: prompt,
            generatedImage: generatedImage,
            timestamp: Date.now(),
            aspectRatio: aspectRatio,
        };
        const updatedHistory = [newHistoryItem, ...history];
        setHistory(updatedHistory);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
        setIsCurrentGenerationSaved(true);
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
    
    const handleHistorySelect = (item: HistoryItem) => {
        setOriginalImageUrl(item.originalImage);
        setPrompt(item.prompt);
        setGeneratedImage(item.generatedImage);
        setAspectRatio(item.aspectRatio || 'original');
        setOriginalFile(null);
        setError(null);
        setIsCurrentGenerationSaved(true); // This item is already in history
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const handleHistoryDelete = (id: string) => {
        const updatedHistory = history.filter(item => item.id !== id);
        setHistory(updatedHistory);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    };
    
    const handleClearHistory = () => {
        setHistory([]);
        localStorage.removeItem(HISTORY_STORAGE_KEY);
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
                        <ImageUploader onImageUpload={handleImageUpload} previewUrl={originalImageUrl} />
                    </div>

                    <div>
                        <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-300 mb-2">2. Describe Your Edit</label>
                        <textarea
                            id="prompt-input"
                            value={prompt}
                            onChange={(e) => {
                                setPrompt(e.target.value);
                                setIsCurrentGenerationSaved(false);
                            }}
                            placeholder="e.g., Make the man stand on a beach with a sunset background"
                            className="w-full h-32 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                            disabled={isLoading}
                        />
                         <div className="mt-2">
                            <p className="text-xs text-gray-400 mb-2">Need inspiration? Try these:</p>
                            <div className="flex flex-wrap gap-2">
                                {promptSuggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs hover:bg-purple-600 hover:text-white transition-colors duration-200"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            3. Select Aspect Ratio
                        </label>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                            {aspectRatioOptions.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => {
                                        setAspectRatio(option.value);
                                        setIsCurrentGenerationSaved(false);
                                    }}
                                    className={`p-2 rounded-lg text-center text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 ${
                                        aspectRatio === option.value
                                            ? 'bg-purple-600 text-white font-semibold'
                                            : 'bg-gray-700 hover:bg-gray-600'
                                    }`}
                                    aria-pressed={aspectRatio === option.value}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
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

                    <HistoryPanel
                        history={history}
                        onSelect={handleHistorySelect}
                        onDelete={handleHistoryDelete}
                        onClear={handleClearHistory}
                    />
                </div>

                {/* Right panel for results */}
                <div className="lg:col-span-2 w-full">
                    <GeneratedImageDisplay
                        originalImageUrl={originalImageUrl}
                        generatedImageUrl={generatedImage}
                        isLoading={isLoading}
                        onDownload={handleDownload}
                        onSave={handleSaveToHistory}
                        isSaved={isCurrentGenerationSaved}
                    />
                </div>
            </main>
        </div>
    );
};

export default App;
