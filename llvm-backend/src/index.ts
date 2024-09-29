import express from 'express';
import { json } from 'body-parser';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const app = express();
app.use(json());

app.post('/api/llvm/compile', async (req, res) => {
  console.log(`Received request: ${JSON.stringify(req.body)}`);
  const { code, llvmVersion, runObfuscation } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  const inputFile = path.join('/tmp', `input_${Date.now()}.cpp`);
  const llvmIRFile = path.join('/tmp', `output_${Date.now()}.ll`);
  const obfuscatedFile = path.join('/tmp', `obfuscated_${Date.now()}.ll`);
  const executableFile = path.join('/tmp', `executable_${Date.now()}`);

  try {
    await fs.writeFile(inputFile, code);
    let nextStageFile;

    const clangCommand = `clang-${llvmVersion} -O1 -S -emit-llvm ${inputFile} -o ${llvmIRFile}`;
    const compilationResult = await executeCommand(clangCommand);
    if (compilationResult.error) {
      return res.status(500).json(compilationResult);
    }
    const llvmInitialCompilation = compilationResult.output;
    nextStageFile = llvmIRFile;

    let llvmOutput;
    let executionOutput;
    if (runObfuscation) {
      const optCommand = `opt-${llvmVersion} -load-pass-plugin=/app/libpasses-${llvmVersion}.so -passes pluto-bogus-control-flow ${llvmIRFile} -S -o ${obfuscatedFile} -debug-pass-manager`;
      const obfuscationResult = await executeCommand(optCommand);
      if (obfuscationResult.error) {
        return res.status(500).json(obfuscationResult);
      }
      nextStageFile = obfuscatedFile;
      llvmOutput = await fs.readFile(obfuscatedFile, 'utf-8');
    } else {
      nextStageFile = llvmIRFile;
      llvmOutput = await fs.readFile(llvmIRFile, 'utf-8');
    }

    // Link the object file to create an executable
    const linkCommand = `clang-${llvmVersion} ${nextStageFile} -o ${executableFile}`;
    const linkResult = await executeCommand(linkCommand);
    if (linkResult.error) {
      return res.status(500).json(linkResult);
    }

    // Execute the compiled code
    const executeResult = await executeCommand(executableFile);
    executionOutput = executeResult.output || executeResult.error;
    console.log(`Execution output: ${executionOutput}`);

    res.json({ llvmInitialCompilation, llvmOutput, executionOutput });

    // Clean up temporary files
    await Promise.all([
      fs.unlink(inputFile),
      fs.unlink(llvmIRFile),
      fs.unlink(executableFile),
      runObfuscation ? fs.unlink(obfuscatedFile) : Promise.resolve(),
    ]);
  } catch (err) {
    console.error(`Error: ${err}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function executeCommand(command: string, outputFile?: string): Promise<{ error?: string; details?: string; output?: string }> {
  return new Promise((resolve) => {
    console.log(`Running command: ${command}`);
    
    exec(command, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Execution error: ${error.message}`);
        resolve({ error: 'Execution failed', details: stderr });
      } else {
        console.log(`Command output: ${stdout}`);
        console.log(`Command stderr: ${stderr}`);
        
        if (outputFile) {
          try {
            const output = await fs.readFile(outputFile, 'utf-8');
            console.log(`File output: ${output}`);
            resolve({ output });
          } catch (readError: unknown) {
            if (readError instanceof Error) {
              console.error(`Error reading output file: ${readError.message}`);
              resolve({ error: 'Failed to read output file', details: readError.message });
            } else {
              console.error(`Unknown error reading output file`);
              resolve({ error: 'Failed to read output file', details: 'Unknown error' });
            }
          }
        } else {
          resolve({ output: stdout });
        }
      }
    });
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`LLVM backend listening on port ${port}`);
});