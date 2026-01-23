import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const TagInput = ({ value = [], onChange, placeholder, className }) => {
    // Ensure value is always an array
    const tags = Array.isArray(value) ? value : [];
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const trimmed = inputValue.trim();
            // Add tag if not empty and not already exists (optional: allow duplicates? usually no)
            if (trimmed && !tags.includes(trimmed)) {
                onChange([...tags, trimmed]);
                setInputValue('');
            }
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            // Remove last tag on backspace if input is empty
            onChange(tags.slice(0, -1));
        }
    };

    const removeTag = (indexToRemove) => {
        onChange(tags.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className={`flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 bg-white ${className}`}>
            {tags.map((tag, index) => (
                <span key={index} className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full animate-in fade-in zoom-in duration-200">
                    {tag}
                    <button
                        onClick={() => removeTag(index)}
                        className="p-0.5 hover:bg-blue-200 rounded-full transition-colors focus:outline-none"
                        type="button"
                    >
                        <X size={14} />
                    </button>
                </span>
            ))}
            <input
                type="text"
                className="flex-1 min-w-[120px] outline-none border-none p-1 text-sm bg-transparent"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={tags.length === 0 ? placeholder : ''}
            />
        </div>
    );
};

export default TagInput;
