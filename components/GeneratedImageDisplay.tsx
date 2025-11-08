
import React from 'react';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { ImageIcon } from './icons/ImageIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';

interface GeneratedImageDisplayProps {
    originalImageUrl: string | null;
    generatedImageUrl: string | null;
    isLoading: boolean;
    onDownload: () => void;
    onSave: () => void;
    isSaved: boolean;
}

const ImagePanel: React.FC<{ imageUrl: string | null; title: string; children?: React.ReactNode }> = ({ imageUrl, title, children }) => (
    <div className="w-full">
        <h3 className="text-lg font-semibold text-gray-400 mb-2 text-center">{title}</h3>
        <div className="aspect-square w-full bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden border border-gray-700">
            {imageUrl ? (
                <img src={imageUrl} alt={title} className="object-contain w-full h-full" />
            ) : (
                children || <ImageIcon className="w-16 h-16 text-gray-600" />
            )}
        </div>
    </div>
);

const GeneratedImageDisplay: React.FC<GeneratedImageDisplayProps> = ({ originalImageUrl, generatedImageUrl, isLoading, onDownload, onSave, isSaved }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <ImagePanel imageUrl={originalImageUrl} title="Original" />
            <div className="flex flex-col">
                <ImagePanel imageUrl={generatedImageUrl} title="Generated">
                    {isLoading && <LoadingSpinner />}
                </ImagePanel>
                 {generatedImageUrl && !isLoading && (
                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={onSave}
                            disabled={isSaved}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            <BookmarkIcon className="w-5 h-5" />
                            {isSaved ? 'Saved' : 'Save to History'}
                        </button>
                        <button
                            onClick={onDownload}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            Download
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GeneratedImageDisplay;
