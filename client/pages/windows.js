import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from 'primereact/button';
import { ContextMenu } from 'primereact/contextmenu';
import { Dropdown } from 'primereact/dropdown';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { useTheme } from '../hooks/use-theme';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const SHADOW_SIZE = 10; // Adjust this value based on your shadow size

export default function MultiWindowCppEditors() {
    const [windows, setWindows] = useState([
        { id: 1, title: 'C++ input', x: 0, y: 0, width: '50%', height: '75%', minimized: false, maximized: false },
        { id: 2, title: 'LLVM output', x: '50%', y: 0, width: '50%', height: '75%', minimized: false, maximized: false },
        { id: 3, title: 'Console output', x: 0, y: '75%', width: '50%', height: '25%', minimized: false, maximized: false },
    ]);

    const containerRef = useRef(null);
    const dragRef = useRef(null);
    const resizeRef = useRef(null);
    const contextMenuRef = useRef(null);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
    const [activeWindowId, setActiveWindowId] = useState(null);

    const { theme } = useTheme();
    const [inputCode, setInputCode] = useState(defaultCppCode);
    const [outputCode, setOutputCode] = useState('');
    const [consoleOutput, setConsoleOutput] = useState('');
    const [llvmVersion, setLlvmVersion] = useState('18');
    const [isLoading, setIsLoading] = useState(false);
    const [runObfuscation, setRunObfuscation] = useState(true);
    const [editorTheme, setEditorTheme] = useState('vs-light');

    useEffect(() => {
        setEditorTheme(theme === 'light' ? 'vs-light' : 'vs-dark');
    }, [theme]);

    useEffect(() => {
        if (containerRef.current) {
            resetWindowsLayout();
        }
    }, []);

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
                return { 
                    ...window, 
                    width: Math.max(width, 200 + SHADOW_SIZE * 2), 
                    height: Math.max(height, 100 + SHADOW_SIZE * 2) 
                };
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

    const toggleMaximize = (id) => {
        setWindows(prevWindows => {
            const updatedWindows = prevWindows.map(window => {
                if (window.id === id) {
                    return { ...window, maximized: !window.maximized };
                }
                return window;
            });

            const maximizedWindow = updatedWindows.find(w => w.id === id);
            if (maximizedWindow && maximizedWindow.maximized) {
                // If the window is being maximized, bring it to front
                return [
                    ...updatedWindows.filter(w => w.id !== id),
                    maximizedWindow
                ];
            }

            return updatedWindows;
        });
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

    const toggleHide = (id) => {
        setWindows(prevWindows => {
            const updatedWindows = prevWindows.map(window =>
                window.id === id ? { ...window, hidden: !window.hidden } : window
            );
            
            // If the active window is being hidden, set activeWindowId to null
            if (id === activeWindowId && !updatedWindows.find(w => w.id === id).hidden) {
                setActiveWindowId(null);
            }
            
            return updatedWindows;
        });
    };

    const getContextMenuItems = useCallback((windowId) => {
        const window = windows.find(w => w.id === windowId);
        if (!window) return []; // Return an empty array if no window is found

        return [
            { 
                label: window.hidden ? 'Show' : 'Hide', 
                icon: 'pi pi-minus',
                command: () => toggleHide(windowId) 
            },
            { 
                label: window.maximized ? 'Restore' : 'Maximize', 
                icon: window.maximized ? 'pi pi-window-minimize' : 'pi pi-window-maximize', 
                command: () => toggleMaximize(windowId) 
            },
            { separator: true },
            { 
                label: 'Bring to Front', 
                icon: 'pi pi-chevron-up', 
                command: () => bringToFront(windowId) 
            },
            { 
                label: 'Send to Back', 
                icon: 'pi pi-chevron-down', 
                command: () => sendToBack(windowId) 
            }
        ];
    }, [windows, toggleHide, toggleMaximize, bringToFront, sendToBack]);

    const handleContextMenu = (e, id) => {
        e.preventDefault();
        setContextMenuPosition({ x: e.clientX, y: e.clientY });
        setActiveWindowId(id);
        contextMenuRef.current.show(e);
    };

    const handleInputChange = useCallback((value) => {
        setInputCode(value || '');
    }, []);

    const handleConvert = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.post('/api/llvm/compile', {
                code: inputCode,
                llvmVersion,
                runObfuscation
            });
            console.log(`Received response: ${JSON.stringify(response.data)}`);
            setOutputCode(response.data.llvmOutput);
            setConsoleOutput(response.data.executionOutput);
        } catch (error) {
            console.error('Compilation failed:', error);
            setOutputCode('Compilation failed. Please check your input and try again.');
            setConsoleOutput('Error: Compilation failed');
        } finally {
            setIsLoading(false);
        }
    }, [inputCode, llvmVersion, runObfuscation]);

    const toggleMaximizeMinimize = (id) => {
        setWindows(prevWindows => {
            const updatedWindows = prevWindows.map(window => {
                if (window.id === id) {
                    if (window.maximized) {
                        return { ...window, maximized: false };
                    } else {
                        return { ...window, maximized: true };
                    }
                }
                return window;
            });

            const updatedWindow = updatedWindows.find(w => w.id === id);
            if (updatedWindow && updatedWindow.maximized) {
                // If the window is being maximized, bring it to front
                return [
                    ...updatedWindows.filter(w => w.id !== id),
                    updatedWindow
                ];
            }

            return updatedWindows;
        });
    };

    const resetWindowsLayout = () => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.clientWidth;
            const containerHeight = containerRef.current.clientHeight;

            // Calculate available space after accounting for shadows
            const availableWidth = containerWidth - SHADOW_SIZE * 2; // 3 shadows: left, middle, right
            const availableHeight = containerHeight - SHADOW_SIZE * 2; // 3 shadows: top, middle, bottom

            setWindows([
                { 
                    id: 1, 
                    title: 'C++ input', 
                    x: SHADOW_SIZE, 
                    y: SHADOW_SIZE, 
                    width: availableWidth * 0.5 - SHADOW_SIZE, 
                    height: availableHeight * 0.75 - SHADOW_SIZE, 
                    minimized: false, 
                    maximized: false, 
                    hidden: false 
                },
                { 
                    id: 2, 
                    title: 'LLVM output', 
                    x: availableWidth * 0.5 + SHADOW_SIZE * 2, 
                    y: SHADOW_SIZE, 
                    width: availableWidth * 0.5 - SHADOW_SIZE, 
                    height: availableHeight * 0.75 - SHADOW_SIZE, 
                    minimized: false, 
                    maximized: false, 
                    hidden: false 
                },
                { 
                    id: 3, 
                    title: 'Console output', 
                    x: SHADOW_SIZE, 
                    y: availableHeight * 0.75 + SHADOW_SIZE * 2, 
                    width: availableWidth * 0.5 - SHADOW_SIZE, 
                    height: availableHeight * 0.25 - SHADOW_SIZE, 
                    minimized: false, 
                    maximized: false, 
                    hidden: false 
                },
            ]);
        }
    };

    return (
        <>
            <div className="sticky top-0 z-5 py-1 px-2 flex gap-3 bg-surface-0">
                <Dropdown
                    value={llvmVersion}
                    onChange={(e) => setLlvmVersion(e.value)}
                    options={[
                        { label: 'LLVM 18', value: '18' },
                        { label: 'LLVM 17', value: '17' },
                        { label: 'LLVM 16', value: '16' }
                    ]}
                    optionLabel="label"
                    placeholder="Select LLVM Version"
                    className="w-full md:w-14rem"
                />
                <div className="flex align-items-center ml-2">
                    <label htmlFor="obfuscation-toggle" className="mr-2">Obfuscation:</label>
                    <input
                        id="obfuscation-toggle"
                        type="checkbox"
                        checked={runObfuscation}
                        onChange={(e) => setRunObfuscation(e.target.checked)}
                    />
                </div>
                <Button 
                    label={isLoading ? 'Converting...' : 'Convert'} 
                    className="p-button-raised p-button-primary" 
                    onClick={handleConvert}
                    disabled={isLoading}
                />
            </div>
            <div ref={containerRef} style={{ position: 'relative', width: '100%', height: 'calc(100vh - 150px)' }}>
                {windows.map((window) => (
                    <div
                        key={window.id}
                        className="absolute shadow-6 overflow-hidden border-round"
                        style={{
                            width: window.maximized ? '100%' : `${window.width}px`,
                            height: window.maximized ? '100%' : `${window.height}px`,
                            left: window.maximized ? '0' : `${window.x}px`,
                            top: window.maximized ? '0' : `${window.y}px`,
                            display: window.hidden ? 'none' : 'block',
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
                            onDoubleClick={(e) => {
                                e.stopPropagation();
                                toggleMaximizeMinimize(window.id);
                            }}
                        >
                            <span className="ml-2 font-semibold">{window.title}</span>
                            <div className="flex">
                                <i 
                                    className="pi pi-minus mr-2" 
                                    style={{ cursor: 'pointer' }} 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleHide(window.id);
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
                        <div className="surface-0 h-full">
                            {window.id === 1 && (
                                <MonacoEditor
                                    language="cpp"
                                    value={inputCode}
                                    onChange={handleInputChange}
                                    theme={editorTheme}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                    }}
                                    className="h-full"
                                />
                            )}
                            {window.id === 2 && (
                                <MonacoEditor
                                    language="llvm"
                                    value={outputCode}
                                    theme={editorTheme}
                                    options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14 }}
                                    className="h-full"
                                />
                            )}
                            {window.id === 3 && (
                                <MonacoEditor
                                    language="plaintext"
                                    value={consoleOutput}
                                    theme={editorTheme}
                                    options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14 }}
                                    className="h-full"
                                />
                            )}
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
            <ContextMenu model={getContextMenuItems(activeWindowId)} ref={contextMenuRef} />
            <div className="fixed bottom-0 left-0 right-0 z-5 py-1 px-2 flex gap-3 bg-surface-0">
                <div className="flex-grow flex gap-3">
                    {windows.sort((a, b) => a.id - b.id).map((window) => (
                        <span 
                            key={window.id}
                            className={`cursor-pointer text-sm ${window.hidden ? 'text-300' : 'text-primary'}`}
                            onClick={() => toggleHide(window.id)}
                            onContextMenu={(e) => handleContextMenu(e, window.id)}
                        >
                            {window.title}
                        </span>
                    ))}
                </div>
            </div>
        </>
    );
}

// Default C++ code
const defaultCppCode = `
#include <stdio.h>

int main() {
  printf("Hello, World!");
  return 0;
}
`;