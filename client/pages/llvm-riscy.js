import { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { useTheme } from '../hooks/use-theme'
import axios from 'axios'

// default code for cpp
const defaultCppCode = `
#include <stdio.h>

int main() {
  printf("Hello, World!");
  return 0;
}
`;

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

export default function LLVMRiscy() {
  const { theme } = useTheme()
  const [inputLanguage, setInputLanguage] = useState('cpp')
  const [inputCode, setInputCode] = useState(defaultCppCode)
  const [outputCode, setOutputCode] = useState('')
  const [llvmVersion, setLlvmVersion] = useState('18')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = useCallback((value) => {
    setInputCode(value || '')
  }, [])

  const handleLanguageToggle = useCallback((e) => {
    setInputLanguage(e.value ? 'cpp' : 'llvm')
  }, [])

  const handleConvert = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/llvm/compile', {
        code: inputCode,
        llvmVersion
      });
      setOutputCode(response.data.llvmOutput);
    } catch (error) {
      console.error('Compilation failed:', error);
      setOutputCode('Compilation failed. Please check your input and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [inputCode, llvmVersion]);

  const [editorTheme, setEditorTheme] = useState('vs-light')

  useEffect(() => {
    setEditorTheme(theme === 'light' ? 'vs-light' : 'vs-dark')
  }, [theme])

  return (
    <div className="flex flex-column h-full">
      <div className="flex-grow-1 flex flex-column md:flex-row p-2 overflow-hidden">
        <div className="w-full md:w-6 mb-2 md:mb-0 md:mr-2 flex flex-column">
          <div className="mb-2 flex justify-content-between align-items-center">
            <h2 className="text-xl font-bold">Input: {inputLanguage === 'llvm' ? 'LLVM Bitcode' : 'C/C++'}</h2>
            <div className="flex justify-content-between align-items-center">
              <Dropdown
                value={inputLanguage}
                onChange={(e) => setInputLanguage(e.value)}
                options={[
                  { label: 'C/C++', value: 'cpp' }
                ]}
                optionLabel="label"
                placeholder="Select Language"
                className="w-full md:w-14rem mr-2"
              />
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
            </div>
          </div>
          <div className="flex-grow-1 overflow-hidden">
            <MonacoEditor
              language={inputLanguage}
              value={inputCode}
              onChange={handleInputChange}
              theme={editorTheme}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
              }}
              className="h-full"
            />
          </div>
        </div>
        <div className="w-full md:w-6 flex flex-column">
          <h2 className="text-xl font-bold mb-2">Output: LLVM Bitcode</h2>
          <div className="flex-grow-1 overflow-hidden">
            <MonacoEditor
              language="llvm"
              value={outputCode}
              theme={editorTheme}
              options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14 }}
              className="h-full"
            />
          </div>
        </div>
      </div>
      <div className="p-2 mt-2">
        <Button 
          label={isLoading ? 'Converting...' : 'Convert'} 
          className="w-full p-button-raised p-button-primary" 
          onClick={handleConvert}
          disabled={isLoading}
        />
      </div>
    </div>
  )
}