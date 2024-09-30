import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { ContextMenu } from 'primereact/contextmenu';

export default function MultiWindowCppEditors() {
    const [windows, setWindows] = useState([
        { id: 1, title: 'Window 1', x: 10, y: 10, width: 300, height: 200, minimized: false, maximized: false },
        { id: 2, title: 'Window 2', x: 320, y: 10, width: 300, height: 200, minimized: false, maximized: false },
        { id: 3, title: 'Window 3', x: 10, y: 220, width: 300, height: 200, minimized: false, maximized: false },
    ]);

    const containerRef = useRef(null);
    const dragRef = useRef(null);
    const resizeRef = useRef(null);
    const contextMenuRef = useRef(null);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
    const [activeWindowId, setActiveWindowId] = useState(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (dragRef.current) {
                const { id, startX, startY, initialX, initialY } = dragRef.current;
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                updateWindowPosition(id, initialX + deltaX, initialY + deltaY);
            }
            if (resizeRef.current) {
                const { id, startX, startY, initialWidth, initialHeight } = resizeRef.current;
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                handleResize(id, initialWidth + deltaX, initialHeight + deltaY);
            }
        };

        const handleMouseUp = () => {
            dragRef.current = null;
            resizeRef.current = null;
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const updateWindowPosition = (id, x, y) => {
        setWindows(prevWindows =>
            prevWindows.map(window =>
                window.id === id ? { ...window, x, y } : window
            )
        );
    };

    const updateWindowSize = (id, width, height) => {
        setWindows(prevWindows =>
            prevWindows.map(window =>
                window.id === id ? { ...window, width, height } : window
            )
        );
    };

    const handleResize = (id, width, height) => {
        setWindows(prevWindows => prevWindows.map(window => {
            if (window.id === id) {
                return { ...window, width: Math.max(width, 200), height: Math.max(height, 100) };
            }
            
            // Check if this window is adjacent to the resizing window
            const resizingWindow = prevWindows.find(w => w.id === id);
            if (resizingWindow && isAdjacent(resizingWindow, window)) {
                const newSize = getNewSize(resizingWindow, window, { width, height });
                return { ...window, ...newSize };
            }
            
            // If not adjacent, keep the window's current size
            return window;
        }));
    };

    const isAdjacent = (window1, window2) => {
        const horizontalOverlap = (window1.y < window2.y + window2.height) && (window1.y + window1.height > window2.y);
        const verticalOverlap = (window1.x < window2.x + window2.width) && (window1.x + window1.width > window2.x);
        return horizontalOverlap || verticalOverlap;
    };

    const getNewSize = (resizingWindow, adjacentWindow, newSize) => {
        let width = adjacentWindow.width;
        let height = adjacentWindow.height;

        if (resizingWindow.x + resizingWindow.width === adjacentWindow.x) {
            width = Math.max(adjacentWindow.x + adjacentWindow.width - (resizingWindow.x + newSize.width), 200);
        } else if (resizingWindow.x === adjacentWindow.x + adjacentWindow.width) {
            width = Math.max(resizingWindow.x - adjacentWindow.x, 200);
        }

        if (resizingWindow.y + resizingWindow.height === adjacentWindow.y) {
            height = Math.max(adjacentWindow.y + adjacentWindow.height - (resizingWindow.y + newSize.height), 100);
        } else if (resizingWindow.y === adjacentWindow.y + adjacentWindow.height) {
            height = Math.max(resizingWindow.y - adjacentWindow.y, 100);
        }

        return { width, height };
    };

    const startDrag = (e, id) => {
        const window = windows.find(w => w.id === id);
        if (window) {
            dragRef.current = { id, startX: e.clientX, startY: e.clientY, initialX: window.x, initialY: window.y };
        }
    };

    const startResize = (e, id) => {
        e.stopPropagation();
        const window = windows.find(w => w.id === id);
        if (window) {
            resizeRef.current = { id, startX: e.clientX, startY: e.clientY, initialWidth: window.width, initialHeight: window.height };
        }
    };

    const toggleMinimize = (id) => {
        setWindows(prevWindows => prevWindows.map(window => 
            window.id === id ? { ...window, minimized: !window.minimized } : window
        ));
    };

    const toggleMaximize = (id) => {
        setWindows(prevWindows => prevWindows.map(window => 
            window.id === id ? { ...window, maximized: !window.maximized } : window
        ));
    };

    const handleContextMenu = (e, id) => {
        e.preventDefault();
        setContextMenuPosition({ x: e.clientX, y: e.clientY });
        setActiveWindowId(id);
        contextMenuRef.current.show(e);
    };

    const bringToFront = (id) => {
        setWindows(prevWindows => {
            const window = prevWindows.find(w => w.id === id);
            const otherWindows = prevWindows.filter(w => w.id !== id);
            return [...otherWindows, window];
        });
    };

    const sendToBack = (id) => {
        setWindows(prevWindows => {
            const window = prevWindows.find(w => w.id === id);
            const otherWindows = prevWindows.filter(w => w.id !== id);
            return [window, ...otherWindows];
        });
    };

    const contextMenuItems = [
        { label: 'Bring to Front', icon: 'pi pi-chevron-up', command: () => bringToFront(activeWindowId) },
        { label: 'Send to Back', icon: 'pi pi-chevron-down', command: () => sendToBack(activeWindowId) }
    ];

    return (
        <>
            <div className="sticky top-0 z-5 py-1 px-2 flex gap-3">
                {windows.map((window) => (
                    <span 
                        key={window.id}
                        className={`cursor-pointer text-sm ${window.minimized ? 'text-300' : 'text-primary'}`}
                        onClick={() => toggleMinimize(window.id)}
                    >
                        {window.title}
                    </span>
                ))}
            </div>
            <div ref={containerRef} style={{ position: 'relative', width: '100%', height: 'calc(100vh - 50px)' }}>
                {windows.map((window) => (
                    <div
                        key={window.id}
                        className="absolute shadow-6 overflow-hidden border-round"
                        style={{
                            width: window.maximized ? '100%' : `${window.width}px`,
                            height: window.maximized ? '100%' : `${window.height}px`,
                            left: window.maximized ? '0' : `${window.x}px`,
                            top: window.maximized ? '0' : `${window.y}px`,
                            display: window.minimized ? 'none' : 'block',
                            zIndex: windows.indexOf(window) + 1,
                        }}
                    >
                        <div 
                            className="flex p-1 justify-between items-center bg-primary"
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'move',
                                color: 'white'
                            }}
                            onMouseDown={(e) => startDrag(e, window.id)}
                            onContextMenu={(e) => handleContextMenu(e, window.id)}
                        >
                            <span className="ml-2 font-semibold">{window.title}</span>
                            <div className="flex">
                                <i 
                                    className="pi pi-minus mr-2" 
                                    style={{ cursor: 'pointer' }} 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleMinimize(window.id);
                                    }} 
                                />
                                <i 
                                    className={`pi ${window.maximized ? 'pi-window-minimize' : 'pi-window-maximize'} mr-2`}
                                    style={{ cursor: 'pointer' }} 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleMaximize(window.id);
                                    }} 
                                />
                            </div>
                        </div>
                        <div className="surface-0 p-2 h-full">
                            Content for {window.title}
                        </div>
                        <div 
                            className="absolute right-0 cursor-ew-resize"
                            style={{
                                position: 'absolute',
                                top: '0',
                                right: '0',
                                width: '5px',
                                height: '100%',
                                cursor: 'se-resize',
                            }}
                            onMouseDown={(e) => startResize(e, window.id, 'right')}
                        />
                        <div 
                            className="absolute bottom-0 cursor-ns-resize"
                            style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                width: '100%',
                                height: '5px',
                                cursor: 'se-resize',
                            }}
                            onMouseDown={(e) => startResize(e, window.id, 'bottom')}
                        />
                        <div 
                            className="absolute bottom-0 right-0 cursor-se-resize primary-color"
                            style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                width: '12px',
                                height: '12px',
                                cursor: 'se-resize',
                                backgroundColor: 'var(--primary-color)',
                                clipPath: 'polygon(0 100%, 100% 100%, 100% 0)'
                            }}
                            onMouseDown={(e) => startResize(e, window.id)}
                        />
                    </div>
                ))}
            </div>
            <ContextMenu model={contextMenuItems} ref={contextMenuRef} />
        </>
    );
}