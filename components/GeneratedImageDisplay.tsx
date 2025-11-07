
import React from 'react';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { ImageIcon } from './icons/ImageIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface GeneratedImageDisplayProps {
    originalImageUrl: string | null;
    generatedImageUrl: string | null;
    isLoading: boolean;
    onDownload: () => void;
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

const GeneratedImageDisplay: React.FC<GeneratedImageDisplayProps> = ({ originalImageUrl, generatedImageUrl, isLoading, onDownload }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <ImagePanel imageUrl={originalImageUrl} title="Original" />
            <div className="flex flex-col">
                <ImagePanel imageUrl={generatedImageUrl} title="Generated">
                    {isLoading && <LoadingSpinner />}
                </ImagePanel>
                 {generatedImageUrl && !isLoading && (
                    <button
                        onClick={onDownload}
                        className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Download Image
                    </button>
                )}
            </div>
        </div>
    );
};

export default GeneratedImageDisplay;
