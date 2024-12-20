import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from 'primereact/button';
import { ContextMenu } from 'primereact/contextmenu';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { useTheme } from '../hooks/use-theme';
import ObfuscationOptionsDialog from '../components/ObfuscationOptionsDialog';
import ObfuscationStagesDialog from '../components/ObfuscationStagesDialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { SplitButton } from 'primereact/splitbutton';
import { Tooltip } from 'primereact/tooltip';
import { Menu } from 'primereact/menu';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const SHADOW_SIZE = 10; // Adjust this value based on your shadow size

export default function MultiWindowCppEditors() {
    const [windows, setWindows] = useState([]);

    const containerRef = useRef(null);
    const dragRef = useRef(null);
    const resizeRef = useRef(null);
    const contextMenuRef = useRef(null);
    const [activeWindowId, setActiveWindowId] = useState(null);

    const { theme } = useTheme();
    const [inputCode, setInputCode] = useState(cppPrintfTemplate);
    const [outputCode, setOutputCode] = useState('');
    const [consoleOutput, setConsoleOutput] = useState('');
    const [llvmVersion, setLlvmVersion] = useState('18');
    const [isLoading, setIsLoading] = useState(false);
    const [showOptionsDialog, setShowOptionsDialog] = useState(false);
    const [obfuscationOptions, setObfuscationOptions] = useState({
        enabled: true,
        pluto_bogus_control_flow: true,
        pluto_flattening: true,
        pluto_global_encryption: true,
        pluto_indirect_call: true,
        pluto_mba_obfuscation: true,
        pluto_substitution: true,
    });
    const [showObfuscationStagesDialog, setShowObfuscationStagesDialog] = useState(false);
    const [obfuscationResults, setObfuscationResults] = useState([]);

    const [templateMenuVisible, setTemplateMenuVisible] = useState(false);
    const templateMenuRef = useRef(null);

    const templateItems = [
        {
            label: 'Printf Example',
            icon: 'pi pi-file',
            command: () => {
                setInputCode(cppPrintfTemplate);
                setTemplateMenuVisible(false);
            }
        },
        {
            label: 'Xtea Encryption',
            icon: 'pi pi-file-o',
            command: () => {
                setInputCode(cppXteaEncryptionTemplate);
                setTemplateMenuVisible(false);
            }
        }
    ];

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

    const handleResize = (id, width, height) => {
        setWindows(prevWindows => prevWindows.map(window => {
            if (window.id === id) {
                return { 
                    ...window, 
                    width: Math.max(width, 200 + SHADOW_SIZE * 2), 
                    height: Math.max(height, 100 + SHADOW_SIZE * 2) 
                };
            }
            
            return window;
        }));
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
        setActiveWindowId(id);
        contextMenuRef.current.show(e);
    };

    const handleInputChange = useCallback((value) => {
        setInputCode(value || '');
    }, []);

    const handleConvert = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.post('/api/llvm-backend', {
                code: inputCode,
                llvmVersion,
                obfuscationOptions,
            });
            //console.log(`Received response: ${JSON.stringify(response.data)}`);
            setObfuscationResults(response.data.obfuscationResults);
            // take the last obfuscation result (array)
            const lastObfuscationResult = response.data.obfuscationResults[response.data.obfuscationResults.length - 1];
            setOutputCode(lastObfuscationResult.output);
            setConsoleOutput(response.data.executionOutput);
        } catch (error) {
            console.error('Compilation failed:', error);
            setOutputCode('Compilation failed.');
            setConsoleOutput(`Error details:\n ${error.response.data.details}`);
        } finally {
            setIsLoading(false);
        }
    }, [inputCode, llvmVersion, obfuscationOptions]);

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
            const availableHeight = containerHeight; // 3 shadows: top, middle, bottom

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
                    height: availableHeight * 1, 
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

    const toggleObfuscationOption = (option, value) => {
        setObfuscationOptions(prev => {
            const newOptions = { ...prev, [option]: value };
            // Reset option2 if option1 is set to 'none'
            if (option === 'option1' && value === 'none') {
                newOptions.option2 = 'none';
            }
            return newOptions;
        });
    };

    const getWindowsDropdownItems = useCallback(() => {
        const items = [{
            label: 'Reset windows layout',
            icon: 'pi pi-refresh',
            command: resetWindowsLayout
        }];

        items.push({ separator: true });

        items.push(...windows.map(window => ({
            label: window.title,
            icon: window.hidden ? 'pi pi-eye-slash' : 'pi pi-eye',
            command: () => toggleHide(window.id)
        })));

        return items;
    }, [windows]);

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setInputCode(text);
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
        }
    };

    const handleCopy = () => {
        // copy outputCode to clipboard
        navigator.clipboard.writeText(outputCode);
    }; 

    // download outputCode as an "obfuscated.ll" file
    const handleDownload = () => {
        const blob = new Blob([outputCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'obfuscated.ll';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <div className="sticky mt-2 top-0 z-5 py-1 px-2 flex gap-3 bg-surface-0 justify-between items-center">
                <div className="flex gap-3">
                    <Button 
                        icon="pi pi-cog" 
                        onClick={() => setShowOptionsDialog(true)}
                        className="p-button-outlined"
                        iconPos="left"
                    >
                        <span className="ml-2 hidden sm:inline font-semibold">Options</span>
                    </Button>
                    <Button 
                        icon={isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-play'}
                        className="p-button-raised p-button-primary" 
                        onClick={handleConvert}
                        disabled={isLoading}
                        iconPos="left"
                    >
                        <span className="ml-2 font-semibold hidden sm:inline">
                            {isLoading ? 'Transforming...' : 'Transform'}
                        </span>
                    </Button>
                    <Button 
                        icon="pi pi-chart-line" 
                        onClick={() => setShowObfuscationStagesDialog(true)}
                        className="p-button-outlined"
                        iconPos="left"
                        disabled={obfuscationResults.length === 0}
                        tooltip="Transform your code first"
                        tooltipOptions={{ disabled: obfuscationResults.length > 0, showOnDisabled: true }}
                    >
                        <span className="ml-2 hidden sm:inline font-semibold">Explore pipeline</span>
                    </Button>
                </div>
                <div className="ml-auto">
                    <SplitButton 
                        label={<span className="hidden sm:inline">Windows</span>}
                        icon="pi pi-clone" 
                        model={getWindowsDropdownItems()} 
                        className="p-button-outlined"
                    />
                </div>
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
                            <div className="flex items-center">
                                <span className="ml-2 font-semibold">{window.title}</span>
                                {window.id === 1 && (
                                    <>
                                        <Tooltip target=".paste-icon" />
                                        <i
                                            className="pi pi-clipboard ml-2 paste-icon"
                                            style={{ cursor: 'pointer' }} 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePaste();
                                            }}
                                            data-pr-tooltip="Paste"
                                            data-pr-position="bottom"
                                        />
                                        <Tooltip target=".template-icon" />
                                        <i
                                            className="pi pi-file-plus ml-2 template-icon"
                                            style={{ cursor: 'pointer' }} 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTemplateMenuVisible(true);
                                                templateMenuRef.current.toggle(e);
                                            }}
                                            data-pr-tooltip="Template"
                                            data-pr-position="bottom"
                                        />
                                        <Menu model={templateItems} popup ref={templateMenuRef} />
                                    </>
                                )}
                                {window.id === 2 && (
                                    <>
                                        <Tooltip target=".copy-icon" />
                                        <i
                                            className="pi pi-clipboard ml-2 copy-icon"
                                            style={{ cursor: 'pointer' }} 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCopy();
                                            }}
                                            data-pr-tooltip="Copy"
                                            data-pr-position="bottom"
                                        />
                                        <Tooltip target=".download-icon" />
                                        <i
                                            className="pi pi-download ml-2 download-icon"
                                            style={{ cursor: 'pointer' }} 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownload();
                                            }}
                                            data-pr-tooltip="Download"
                                            data-pr-position="bottom"
                                        />
                                    </>
                                )}
                            </div>
                            <div className="flex">
                                <>
                                    <Tooltip target=".minimize-icon" />
                                    <i 
                                        className="pi pi-minus mr-2 minimize-icon" 
                                        style={{ cursor: 'pointer' }} 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleHide(window.id);
                                        }} 
                                        data-pr-tooltip="Hide"
                                        data-pr-position="bottom"
                                    />
                                </>
                                <>
                                    <Tooltip target=".maximize-icon" />
                                    <i 
                                        className={`pi ${window.maximized ? 'pi-window-minimize' : 'pi-window-maximize'} mr-2 maximize-icon`}
                                        style={{ cursor: 'pointer' }} 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleMaximize(window.id);
                                        }} 
                                        data-pr-tooltip={window.maximized ? "Restore" : "Maximize"}
                                        data-pr-position="left"
                                    />
                                </>
                            </div>
                        </div>
                        <div className="surface-0 h-full">
                            {window.id === 1 && (
                                <MonacoEditor
                                    language="cpp"
                                    value={inputCode}
                                    onChange={handleInputChange}
                                    theme={theme === 'light' ? 'vs' : 'vs-dark'}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                    }}
                                    className="h-full"
                                />
                            )}
                            {window.id === 2 && (
                                <MonacoEditor
                                    language="cpp"
                                    value={outputCode}
                                    theme={theme === 'light' ? 'vs' : 'vs-dark'}
                                    options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14 }}
                                    className="h-full"
                                />
                            )}
                            {window.id === 3 && (
                                <MonacoEditor
                                    language="plaintext"
                                    value={consoleOutput}
                                    theme={theme === 'light' ? 'vs' : 'vs-dark'}
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
            <ObfuscationOptionsDialog 
                visible={showOptionsDialog} 
                onHide={() => setShowOptionsDialog(false)}
                llvmVersion={llvmVersion}
                setLlvmVersion={setLlvmVersion}
                obfuscationOptions={obfuscationOptions}
                toggleObfuscationOption={toggleObfuscationOption}
            />
            <ObfuscationStagesDialog
                visible={showObfuscationStagesDialog}
                onHide={() => setShowObfuscationStagesDialog(false)}
                obfuscationResults={obfuscationResults}
                originalCode={inputCode}  // Add this line
            />
        </>
    );
}

// Default C++ code
const cppPrintfTemplate = `
#include <stdio.h>

__attribute__((noinline)) // to showcase indirect call feature
static void test_func()
{
  printf("Hello, World!");
}

int main() {
  test_func();
  return 0;
}
`;

const cppXteaEncryptionTemplate = `
#include <stdint.h>
#include <stdio.h>
#include <string.h>

// noinline is needed to test indirect call feature
__attribute__((noinline))
static void xtea_encrypt(uint32_t v[2], const uint32_t key[4], uint32_t num_rounds) {
    uint32_t v0 = v[0], v1 = v[1], sum = 0, delta = 0x9E3779B9;
    for (uint32_t i = 0; i < num_rounds; i++) {
        v0 += (((v1 << 4) ^ (v1 >> 5)) + v1) ^ (sum + key[sum & 3]);
        sum += delta;
        v1 += (((v0 << 4) ^ (v0 >> 5)) + v0) ^ (sum + key[(sum >> 11) & 3]);
    }
    v[0] = v0; v[1] = v1;
}

// noinline is needed to test indirect call feature
__attribute__((noinline))
static void xtea_decrypt(uint32_t v[2], const uint32_t key[4], uint32_t num_rounds) {
    uint32_t v0 = v[0], v1 = v[1], delta = 0x9E3779B9;
    uint32_t sum = delta * num_rounds;
    for (uint32_t i = 0; i < num_rounds; i++) {
        v1 -= (((v0 << 4) ^ (v0 >> 5)) + v0) ^ (sum + key[(sum >> 11) & 3]);
        sum -= delta;
        v0 -= (((v1 << 4) ^ (v1 >> 5)) + v1) ^ (sum + key[sum & 3]);
    }
    v[0] = v0; v[1] = v1;
}

int main() {
    uint32_t key[4] = {0x01234567, 0x89ABCDEF, 0xFEDCBA98, 0x76543210};
    uint32_t v[2] = {0, 0};
    uint32_t num_rounds = 32;  // Standard number of rounds for XTEA
    
    // Message to encrypt (8 bytes / 64 bits)
    char message[] = "HelloWld";
    
    // Copy message to v array
    memcpy(v, message, 8);
    
    printf("Original message: %.8s\\n", (char*)v);
    
    // Encrypt
    xtea_encrypt(v, key, num_rounds);
    printf("Encrypted: 0x%08X 0x%08X\\n", v[0], v[1]);
    
    // Decrypt
    xtea_decrypt(v, key, num_rounds);
    printf("Decrypted message: %.8s\\n", (char*)v);
    
    return 0;
}
`;
