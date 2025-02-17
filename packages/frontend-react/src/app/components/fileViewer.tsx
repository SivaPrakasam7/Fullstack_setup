import { useState, useRef, useMemo, WheelEvent, MouseEvent } from 'react';

export const FileViewer = ({ url }: { url: string }) => {
    const isVideo = useMemo(() => url.match(/\.(mp4|webm|ogg)$/i), [url]);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const startPos = useRef({ x: 0, y: 0 });

    const handleWheel = (e: WheelEvent) => {
        if (!isVideo) {
            setScale((prev) =>
                Math.max(0.5, prev + (e.deltaY > 0 ? -0.1 : 0.1))
            );
        }
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

    return (
        <div
            className="flex items-center justify-center w-[95dvw] h-[90dvh] overflow-hidden"
            onWheel={handleWheel}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {isVideo ? (
                <video src={url} controls className="max-w-full max-h-full" />
            ) : (
                <img
                    src={url}
                    alt="File Viewer"
                    className="cursor-grab active:cursor-grabbing transition-transform"
                    onMouseDown={handleMouseDown}
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        userSelect: 'none',
                    }}
                    draggable={false}
                />
            )}
        </div>
    );
};
