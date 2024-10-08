import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import dynamic from 'next/dynamic';
import { useTheme } from '../hooks/use-theme';

const MonacoDiffEditor = dynamic(() => import('@monaco-editor/react').then(mod => mod.DiffEditor), { ssr: false });

export default function ObfuscationStagesDialog({ visible, onHide, obfuscationResults, originalCode }) {
    const [activeIndex, setActiveIndex] = useState(1);
    const { theme } = useTheme();

    useEffect(() => {
        // Remove the console.log statement
        setActiveIndex(1);
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
                        label={option.label}
                        onClick={() => setActiveIndex(option.value)}
                        className={`p-button-sm ${index === 0 ? 'p-button-secondary' : activeIndex === option.value ? 'p-button-raised' : 'p-button-outlined'}`}
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
            header="Obfuscation Stages"
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