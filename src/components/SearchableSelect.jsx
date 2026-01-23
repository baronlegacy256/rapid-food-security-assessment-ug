import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

const SearchableSelect = ({ options, value, onChange, placeholder, disabled, className, freeText = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    // If freeText is true, we allow typing anything. If false, we restrict to options (but here we essentially allow typing to filter)
    // To support "custom" values, we simply call onChange with the input text.

    // However, if we want to enforce selection from list, we need to handle blur.
    // For this use case (Subcounties), we likely want freeText=true because our list is incomplete.

    const containerRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options ? options.filter(option =>
        option.toLowerCase().includes((value || '').toLowerCase())
    ) : [];

    const handleInputChange = (e) => {
        onChange(e.target.value);
        if (!isOpen) setIsOpen(true);
    };

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={value || ''}
                    onChange={handleInputChange}
                    onFocus={() => !disabled && setIsOpen(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${className}`}
                />
                <div className="absolute right-2 top-2.5 flex items-center gap-1">
                    {value && !disabled && (
                        <button
                            onClick={() => onChange('')}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform cursor-pointer ${isOpen ? 'rotate-180' : ''}`}
                        onClick={() => !disabled && setIsOpen(!isOpen)}
                    />
                </div>
            </div>

            {isOpen && !disabled && filteredOptions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredOptions.map((option) => (
                        <button
                            key={option}
                            onClick={() => handleSelect(option)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors
                                ${value === option ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}
                            `}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}

            {isOpen && !disabled && filteredOptions.length === 0 && value && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-sm text-gray-500">
                    No matching options. You can use "{value}" as a custom value.
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
