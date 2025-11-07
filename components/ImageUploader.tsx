
import React, { useRef, useState, useCallback } from 'react';
import { ImageIcon } from './icons/ImageIcon';

interface ImageUploaderProps {
    onImageUpload: (file: File | null) => void;
    previewUrl: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, previewUrl }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        onImageUpload(file);
    };

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);
    
    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0] || null;
        if (file && file.type.startsWith('image/')) {
            onImageUpload(file);
        }
    }, [onImageUpload]);

    const uploaderClasses = `
        relative flex flex-col items-center justify-center w-full h-64 
        border-2 border-dashed rounded-lg cursor-pointer
        transition-colors duration-200 ease-in-out
        ${isDragging ? 'border-purple-400 bg-gray-700' : 'border-gray-600 bg-gray-800 hover:bg-gray-700'}
    `;

    return (
        <div 
            className={uploaderClasses}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
            />
            {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="object-contain w-full h-full rounded-lg" />
            ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
                    <ImageIcon className="w-10 h-10 mb-3" />
                    <p className="mb-2 text-sm"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs">PNG, JPG or WEBP</p>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
