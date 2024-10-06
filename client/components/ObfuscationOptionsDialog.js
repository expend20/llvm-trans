import React from 'react';
import { Dialog } from 'primereact/dialog';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';

export default function ObfuscationOptionsDialog({ 
    visible, 
    onHide, 
    llvmVersion, 
    setLlvmVersion, 
    obfuscationOptions, 
    toggleObfuscationOption 
}) {
    return (
        <Dialog 
            header="Transformation Options" 
            visible={visible} 
            onHide={onHide}
        >
            <div className="flex flex-column gap-4">
                <div className="flex align-items-center justify-content-between">
                    <label htmlFor="llvmVersion" className="font-bold mr-2">LLVM Version</label>
                    <Dropdown
                        id="llvmVersion"
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
                </div>
                <div className="flex flex-column gap-2">
                    <div className="flex align-items-center justify-content-between">
                        <label htmlFor="obfuscation" className="font-bold">Obfuscation: Pluto</label>
                        <InputSwitch
                            id="obfuscation"
                            checked={obfuscationOptions.enabled}
                            onChange={(e) => toggleObfuscationOption('enabled', e.value)}
                        />
                    </div>
                    <div className="ml-4 flex flex-column gap-2">
                        <ObfuscationOption
                            id="pluto_bogus_control_flow"
                            label="Bogus Control Flow"
                            checked={obfuscationOptions.pluto_bogus_control_flow}
                            onChange={(e) => toggleObfuscationOption('pluto_bogus_control_flow', e.value)}
                            disabled={!obfuscationOptions.enabled}
                        />
                        <ObfuscationOption
                            id="pluto_flattening"
                            label="Flattening"
                            checked={obfuscationOptions.pluto_flattening}
                            onChange={(e) => toggleObfuscationOption('pluto_flattening', e.value)}
                            disabled={!obfuscationOptions.enabled}
                        /> 
                        <ObfuscationOption
                            id="pluto_global_encryption"
                            label="Global Encryption"
                            checked={obfuscationOptions.pluto_global_encryption}
                            onChange={(e) => toggleObfuscationOption('pluto_global_encryption', e.value)}
                            disabled={!obfuscationOptions.enabled}
                        />
                        <ObfuscationOption
                            id="pluto_indirect_call"
                            label="Indirect Call"
                            checked={obfuscationOptions.pluto_indirect_call}
                            onChange={(e) => toggleObfuscationOption('pluto_indirect_call', e.value)}
                            disabled={!obfuscationOptions.enabled}
                        />
                        <ObfuscationOption
                            id="pluto-mba-obfuscation"
                            label="MBA Obfuscation"
                            checked={obfuscationOptions.pluto_mba_obfuscation}
                            onChange={(e) => toggleObfuscationOption('pluto_mba_obfuscation', e.value)}
                            disabled={!obfuscationOptions.enabled}
                        />
                        <ObfuscationOption
                            id="pluto-substitution"
                            label="Substitution"
                            checked={obfuscationOptions.pluto_substitution}
                            onChange={(e) => toggleObfuscationOption('pluto_substitution', e.value)}
                            disabled={!obfuscationOptions.enabled}
                        />
                    </div>
                </div>
            </div>
        </Dialog>
    );
}

function ObfuscationOption({ id, label, checked, onChange, disabled }) {
    return (
        <div className="flex align-items-center justify-content-between">
            <label htmlFor={id} className={disabled ? 'text-color-secondary' : ''}>
                {label}
            </label>
            <InputSwitch
                id={id}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
            />
        </div>
    );
}