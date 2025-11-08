
import React from 'react';
import { HistoryItem } from '../types';
import { HistoryIcon } from './icons/HistoryIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EyeIcon } from './icons/EyeIcon';

interface HistoryPanelProps {
    history: HistoryItem[];
    onSelect: (item: HistoryItem) => void;
    onDelete: (id: string) => void;
    onClear: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, onDelete, onClear }) => {
    if (history.length === 0) {
        return null; // Don't render anything if history is empty
    }

    return (
        <div className="mt-6 border-t border-gray-700 pt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-300 flex items-center gap-2">
                    <HistoryIcon className="w-5 h-5" />
                    History
                </h3>
                <button
                    onClick={onClear}
                    className="text-sm text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1"
                    aria-label="Clear all history"
                >
                    <TrashIcon className="w-4 h-4" />
                    Clear All
                </button>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {history.map(item => (
                    <div key={item.id} className="group relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700/50 shadow-md">
                        <img src={item.generatedImage} alt={item.prompt} className="aspect-video w-full object-cover" />
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                            <p className="text-xs text-gray-200 line-clamp-3" title={item.prompt}>
                                {item.prompt}
                            </p>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => onSelect(item)}
                                    className="p-2 bg-blue-600/80 hover:bg-blue-600 rounded-full text-white transition-colors"
                                    aria-label="View this item"
                                    title="View"
                                >
                                    <EyeIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onDelete(item.id)}
                                    className="p-2 bg-red-600/80 hover:bg-red-600 rounded-full text-white transition-colors"
                                    aria-label="Delete this item"
                                    title="Delete"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #4a5568;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #718096;
                }
            `}</style>
        </div>
    );
};

export default HistoryPanel;
