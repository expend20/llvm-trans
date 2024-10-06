import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import dynamic from 'next/dynamic';
import { useTheme } from '../hooks/use-theme';

const MonacoDiffEditor = dynamic(() => import('@monaco-editor/react').then(mod => mod.DiffEditor), { ssr: false });

export default function ObfuscationStagesDialog({ visible, onHide, obfuscationResults }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const { theme } = useTheme();

    useEffect(() => {
        setActiveIndex(0);
    }, [visible, obfuscationResults]);

    const renderDiffEditor = (original, modified) => {
        return (
            <MonacoDiffEditor
                original={original}
                modified={modified}
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
                    <div className="mb-3 mt-2">
                        <Dropdown
                            value={activeIndex}
                            options={stageOptions}
                            onChange={(e) => setActiveIndex(e.value)}
                            placeholder="Select an obfuscation stage"
                            className="w-full md:w-20rem"
                        />
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                        <h3>{obfuscationResults[activeIndex].stageName}</h3>
                        {renderDiffEditor(
                            activeIndex === 0 ? obfuscationResults[activeIndex].input : obfuscationResults[activeIndex - 1].output,
                            obfuscationResults[activeIndex].output
                        )}
                    </div>
                </div>
            ) : (
                <p>No obfuscation results available.</p>
            )}
        </Dialog>
    );
}