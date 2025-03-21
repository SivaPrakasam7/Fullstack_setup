import { useState, useRef, useMemo, WheelEvent, MouseEvent } from 'react';
import SvgIcon from './svg';

export const FileViewer = ({ url }: { url: string }) => {
    const isVideo = useMemo(() => url.match(/\.(mp4|webm|ogg)$/i), [url]);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const startPos = useRef({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Enhanced wheel handling with smoother scaling
    const handleWheel = (e: WheelEvent) => {
        if (isVideo) return;
        e.preventDefault();
        const scaleChange = e.deltaY > 0 ? -0.1 : 0.1;
        setScale((prev) => Math.max(0.2, Math.min(5, prev + scaleChange)));
    };

    const handleMouseDown = (e: MouseEvent) => {
        if (isVideo) return;
        setIsDragging(true);
        startPos.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || isVideo) return;
        setPosition({
            x: e.clientX - startPos.current.x,
            y: e.clientY - startPos.current.y,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Zoom controls
    const zoomIn = () => {
        if (!isVideo) {
            setScale((prev) => Math.min(5, prev + 0.2));
        }
    };

    const zoomOut = () => {
        if (!isVideo) {
            setScale((prev) => Math.max(0.2, prev - 0.2));
        }
    };

    // Reset view to initial state
    const resetView = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    return (
        <div className="relative w-full h-full flex flex-col">
            <div
                ref={containerRef}
                className="flex-1 flex items-center justify-center w-full h-[80vh] overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-lg"
                onWheel={handleWheel}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {isVideo ? (
                    <video
                        src={url}
                        controls
                        className="max-w-full max-h-full rounded"
                        onContextMenu={(e) => e.preventDefault()}
                    />
                ) : (
                    <img
                        src={url}
                        alt="File Viewer"
                        className={`cursor-grab transition-transform duration-200 ease-out ${
                            isDragging ? 'active:cursor-grabbing' : ''
                        }`}
                        onMouseDown={handleMouseDown}
                        onError={(e) => {
                            e.currentTarget.src = '/icons/svg/file.svg';
                        }}
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            userSelect: 'none',
                            maxWidth: '100%',
                            maxHeight: '100%',
                        }}
                        draggable={false}
                    />
                )}
            </div>

            {!isVideo && (
                <div className="flex justify-center items-center gap-4 p-4">
                    <button
                        onClick={zoomOut}
                        disabled={scale <= 0.2}
                        className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Zoom Out"
                    >
                        <SvgIcon
                            path="/icons/svg/zoom-out.svg"
                            className="w-5 h-5"
                        />
                    </button>

                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        {Math.round(scale * 100)}%
                    </span>

                    <button
                        onClick={zoomIn}
                        disabled={scale >= 5}
                        className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Zoom In"
                    >
                        <SvgIcon
                            path="/icons/svg/zoom-in.svg"
                            className="w-5 h-5"
                        />
                    </button>

                    <button
                        onClick={resetView}
                        className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Reset View"
                    >
                        <SvgIcon
                            path="/icons/svg/reset.svg"
                            className="w-5 h-5"
                        />
                    </button>
                </div>
            )}
        </div>
    );
};
