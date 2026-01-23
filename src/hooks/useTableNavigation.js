import { useRef, useEffect } from 'react';

/**
 * Hook to enable keyboard navigation (arrow keys) within a table or grid of inputs.
 * 
 * Usage:
 * 1. Attach the returned ref to the container element (e.g., <table> or <tbody>).
 * 2. Ensure all navigable inputs have `data-row` and `data-col` attributes (numbers).
 *    e.g. <input data-row={rowIndex} data-col={colIndex} ... />
 * 
 * @returns {Object} ref - React ref object to attach to the container.
 */
const useTableNavigation = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleKeyDown = (e) => {
            const allowedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
            if (!allowedKeys.includes(e.key)) return;

            const activeElement = document.activeElement;
            if (!container.contains(activeElement)) return;

            // Get current coordinates
            const currentRow = parseInt(activeElement.getAttribute('data-row'), 10);
            const currentCol = parseInt(activeElement.getAttribute('data-col'), 10);

            if (isNaN(currentRow) || isNaN(currentCol)) return;

            e.preventDefault(); // Prevent scrolling

            let targetRow = currentRow;
            let targetCol = currentCol;

            switch (e.key) {
                case 'ArrowUp':
                    targetRow = currentRow - 1;
                    break;
                case 'ArrowDown':
                    targetRow = currentRow + 1;
                    break;
                case 'ArrowLeft':
                    targetCol = currentCol - 1;
                    break;
                case 'ArrowRight':
                    targetCol = currentCol + 1;
                    break;
                default:
                    break;
            }

            // Find target element
            // We use simple query selector. Note: This assumes unique row/col pairs within the container.
            // If the table is irregular, this simply searches for the exact coordinate.
            const target = container.querySelector(`[data-row="${targetRow}"][data-col="${targetCol}"]`);

            if (target) {
                target.focus();
                // Select text if it's a text input
                if (target.select) {
                    target.select();
                }
            }
        };

        container.addEventListener('keydown', handleKeyDown);

        return () => {
            container.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return containerRef;
};

export default useTableNavigation;
