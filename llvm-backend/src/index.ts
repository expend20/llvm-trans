import express from 'express';
import { json } from 'body-parser';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const app = express();
app.use(json());

app.post('/api/llvm/compile', async (req, res) => {
  console.log(`Received request: ${JSON.stringify(req.body)}`);
  const { code, llvmVersion, obfuscationOptions } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  const inputFile = path.join('/tmp', `input_${Date.now()}.cpp`);
  let nextStageIRFile = path.join('/tmp', `input_${Date.now()}.ll`);
  const executableFile = path.join('/tmp', `executable_${Date.now()}.out`);

  try {
    await fs.writeFile(inputFile, code);

    const clangCommand = `clang-${llvmVersion} -O1 -S -emit-llvm ${inputFile} -o ${nextStageIRFile}`;
    const compilationResult = await executeCommand(clangCommand);
    if (compilationResult.error) {
      return res.status(500).json(compilationResult);
    }

    let results: { name: string, output: string }[] = [];
    results.push({ name: 'original', output: await fs.readFile(nextStageIRFile, 'utf-8') });

    let executionOutput;
    let filesToDelete: string[] = [inputFile, nextStageIRFile];

    if (obfuscationOptions.enabled) {

      if (obfuscationOptions.pluto_bogus_control_flow) {
        const newIRFile = path.join('/tmp', `obfuscated_pluto_bogus_control_flow_${Date.now()}.ll`);
        const optCommand = `opt-${llvmVersion} -load-pass-plugin=/app/libpasses-${llvmVersion}.so -passes "pluto-bogus-control-flow" ${nextStageIRFile} -S -o ${newIRFile} -debug-pass-manager`;
        const obfuscationResult = await executeCommand(optCommand);
        if (obfuscationResult.error) {
          return res.status(500).json(obfuscationResult);
        }
        const outputFileContent = await fs.readFile(newIRFile, 'utf-8');
        results.push({ name: 'pluto_bogus_control_flow', output: outputFileContent });
        nextStageIRFile = newIRFile;
        filesToDelete.push(newIRFile);
      }
      
      if (obfuscationOptions.pluto_flattening) {
        const newIRFile = path.join('/tmp', `obfuscated_pluto_flattening_${Date.now()}.ll`);
        const optCommand = `opt-${llvmVersion} -load-pass-plugin=/app/libpasses-${llvmVersion}.so -passes "pluto-flattening" ${nextStageIRFile} -S -o ${newIRFile} -debug-pass-manager`;
        const obfuscationResult = await executeCommand(optCommand);
        if (obfuscationResult.error) {
          return res.status(500).json(obfuscationResult);
        }
        const outputFileContent = await fs.readFile(newIRFile, 'utf-8');
        results.push({ name: 'pluto_flattening', output: outputFileContent });
        nextStageIRFile = newIRFile;
        filesToDelete.push(newIRFile);
      }

      if (obfuscationOptions.pluto_global_encryption) {
        const newIRFile = path.join('/tmp', `obfuscated_pluto_global_encryption_${Date.now()}.ll`);
        const optCommand = `opt-${llvmVersion} -load-pass-plugin=/app/libpasses-${llvmVersion}.so -passes "pluto-global-encryption" ${nextStageIRFile} -S -o ${newIRFile} -debug-pass-manager`;
        const obfuscationResult = await executeCommand(optCommand);
        if (obfuscationResult.error) {
          return res.status(500).json(obfuscationResult);
        }
        const outputFileContent = await fs.readFile(newIRFile, 'utf-8');
        results.push({ name: 'pluto_global_encryption', output: outputFileContent });
        nextStageIRFile = newIRFile;
        filesToDelete.push(newIRFile);
      }

      if (obfuscationOptions.pluto_indirect_call) {
        const newIRFile = path.join('/tmp', `obfuscated_pluto_indirect_call_${Date.now()}.ll`);
        const optCommand = `opt-${llvmVersion} -load-pass-plugin=/app/libpasses-${llvmVersion}.so -passes "pluto-indirect-call" ${nextStageIRFile} -S -o ${newIRFile} -debug-pass-manager`;
        const obfuscationResult = await executeCommand(optCommand);
        if (obfuscationResult.error) {
          return res.status(500).json(obfuscationResult);
        }
        const outputFileContent = await fs.readFile(newIRFile, 'utf-8');
        results.push({ name: 'pluto_indirect_call', output: outputFileContent });
        nextStageIRFile = newIRFile;
        filesToDelete.push(newIRFile);
      }

      if (obfuscationOptions.pluto_mba_obfuscation) {
        const newIRFile = path.join('/tmp', `obfuscated_pluto_mba_obfuscation_${Date.now()}.ll`);
        const optCommand = `opt-${llvmVersion} -load-pass-plugin=/app/libpasses-${llvmVersion}.so -passes "pluto-mba-obfuscation" ${nextStageIRFile} -S -o ${newIRFile} -debug-pass-manager`;
        const obfuscationResult = await executeCommand(optCommand);
        if (obfuscationResult.error) {
          return res.status(500).json(obfuscationResult);
        }
        const outputFileContent = await fs.readFile(newIRFile, 'utf-8');
        results.push({ name: 'pluto_mba_obfuscation', output: outputFileContent });
        nextStageIRFile = newIRFile;
        filesToDelete.push(newIRFile);
      }

      if (obfuscationOptions.pluto_substitution) {
        const newIRFile = path.join('/tmp', `obfuscated_pluto_substitution_${Date.now()}.ll`);
        const optCommand = `opt-${llvmVersion} -load-pass-plugin=/app/libpasses-${llvmVersion}.so -passes "pluto-substitution" ${nextStageIRFile} -S -o ${newIRFile} -debug-pass-manager`;
        const obfuscationResult = await executeCommand(optCommand);
        if (obfuscationResult.error) {
          return res.status(500).json(obfuscationResult);
        }
        const outputFileContent = await fs.readFile(newIRFile, 'utf-8');
        results.push({ name: 'pluto_substitution', output: outputFileContent });
        nextStageIRFile = newIRFile;
        filesToDelete.push(newIRFile);
      }
    }

    // Link the object file to create an executable
    const linkCommand = `clang-${llvmVersion} ${nextStageIRFile} -o ${executableFile}`;
    const linkResult = await executeCommand(linkCommand);
    if (linkResult.error) {
      return res.status(500).json(linkResult);
    }

    // Execute the compiled code
    const executeResult = await executeCommand(executableFile);
    executionOutput = executeResult.output || executeResult.error;
    console.log(`Execution output: ${executionOutput}`);

    res.json({ obfuscationResults: results, executionOutput });

    // Clean up temporary files
    await Promise.all(filesToDelete.map(file => fs.unlink(file)));
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
