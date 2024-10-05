import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import dynamic from 'next/dynamic';

const MonacoDiffEditor = dynamic(() => import('@monaco-editor/react').then(mod => mod.DiffEditor), { ssr: false });

export default function ObfuscationStagesDialog({ visible, onHide, obfuscationResults }) {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (visible) {
            setActiveIndex(0);
        }
    }, [visible]);

    const renderDiffEditor = (original, modified) => {
        return (
            <MonacoDiffEditor
                original={original}
                modified={modified}
                language="cpp"
                theme="vs-dark"
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
                    <div className="flex justify-content-center mb-3">
                        {obfuscationResults.map((_, index) => (
                            <Button
                                key={index}
                                label={obfuscationResults[index].name}
                                className={`mr-2 mt-1 ${activeIndex === index ? 'p-button-outlined' : 'p-button-text'}`}
                                onClick={() => setActiveIndex(index)}
                            />
                        ))}
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