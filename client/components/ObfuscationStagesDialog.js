import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Tooltip } from 'primereact/tooltip';
import dynamic from 'next/dynamic';
import { useTheme } from '../hooks/use-theme';

const MonacoDiffEditor = dynamic(() => import('@monaco-editor/react').then(mod => mod.DiffEditor), { ssr: false });

export default function ObfuscationStagesDialog({ visible, onHide, obfuscationResults, originalCode }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const { theme } = useTheme();

    useEffect(() => {
        // Remove the console.log statement
        setActiveIndex(obfuscationResults.length > 1 ? 1 : 0);
    }, [visible, obfuscationResults]);

    const renderDiffEditor = (original, modified) => {
        return (
            <MonacoDiffEditor
                original={original || ''}  // Provide a default empty string if original is null or undefined
                modified={modified || ''}  // Provide a default empty string if modified is null or undefined
                language="cpp"
                theme={theme === 'light' ? 'vs' : 'vs-dark'}
                options={{
                    readOnly: true,
                    renderSideBySide: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                }}
                height="calc(100vh - 200px)" // Adjust this value as needed
            />
        );
    };

    const stageOptions = obfuscationResults.map((result, index) => ({
        label: result.name,
        value: index
    }));

    const renderStageSelector = () => (
        <div className="mb-3 mt-2">
            <div className="hidden md:flex flex-wrap gap-2">
                {stageOptions.map((option, index) => (
                    <Button
                        key={option.value}
                        label={
                            <span className="flex align-items-center gap-2">
                                {index <= activeIndex ? (
                                    <i className="pi pi-check-circle" />
                                ) : (
                                    <i className="pi pi-circle" />
                                )}
                                {option.label}
                            </span>
                        }
                        onClick={() => setActiveIndex(option.value)}
                        className={`p-button-sm ${
                            index <= activeIndex 
                                ? 'p-button-raised' 
                                : 'p-button-outlined'
                        }`}
                    />
                ))}
            </div>
            <div className="md:hidden">
                <Dropdown
                    value={activeIndex}
                    options={stageOptions}
                    onChange={(e) => setActiveIndex(e.value)}
                    placeholder="Select an obfuscation stage"
                    className="w-full"
                />
            </div>
        </div>
    );

    return (
        <Dialog
            header={
                <div className="flex align-items-center gap-2">
                    <span>Obfuscation Stages</span>
                    <i 
                        className="pi pi-info-circle cursor-pointer text-sm"
                        data-pr-tooltip="Obfuscation passes are applied sequentially based on your Options menu selections. The process begins with translating C/C++ code into LLVM IR (shown in the 'original' stage). The diff viewer shows the previous stage's LLVM IR on the left and the current pass's modifications on the right. Note that passes cannot currently be reordered or repeated."
                        data-pr-position="right"
                        data-pr-at="right+5 top"
                        style={{ color: 'var(--primary-color)' }}
                    />
                    <Tooltip target=".pi-info-circle" />
                </div>
            }
            visible={visible}
            style={{ width: '90vw', height: '90vh' }}
            onHide={onHide}
            contentStyle={{ height: 'calc(100% - 6rem)' }}
        >
            {obfuscationResults.length > 0 ? (
                <div className="flex flex-column h-full">
                    {renderStageSelector()}
                    <div className="flex-grow-1 overflow-hidden">
                        {renderDiffEditor(
                            activeIndex === 0 ? (originalCode || '') : (obfuscationResults[activeIndex - 1]?.output || ''),
                            obfuscationResults[activeIndex]?.output || ''
                        )}
                    </div>
                </div>
            ) : (
                <Message severity="info" text="To view the obfuscation pipeline, please transform your code first." />
            )}
        </Dialog>
    );
}