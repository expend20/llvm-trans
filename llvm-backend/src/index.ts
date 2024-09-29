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

  try {
    await fs.writeFile(inputFile, code);

    const clangCommand = `clang-${llvmVersion} -O1 -S -emit-llvm ${inputFile} -o ${llvmIRFile}`;

    console.log(`Running clang command: ${clangCommand}`);
    exec(clangCommand, async (clangError, clangStdout, clangStderr) => {
      if (clangError) {
        console.error(`Compilation error: ${clangError.message}`);
        return res.status(500).json({ error: 'Compilation failed', details: clangStderr });
      }

      if (runObfuscation) {
        const optCommand = `opt-${llvmVersion} -load-pass-plugin=/app/libpasses-${llvmVersion}.so -passes pluto-bogus-control-flow ${llvmIRFile} -S -o ${obfuscatedFile} -debug-pass-manager`;

        console.log(`Running opt command: ${optCommand}`);
        exec(optCommand, async (optError, optStdout, optStderr) => {
          if (optError) {
            console.error(`Obfuscation error: ${optError.message}`);
            return res.status(500).json({ error: 'Obfuscation failed', details: optStderr });
          }

          console.log(`Obfuscated output: ${optStdout}`);
          const obfuscatedOutput = await fs.readFile(obfuscatedFile, 'utf-8');
          console.log(`Obfuscated output2: ${obfuscatedOutput}`);
          res.json({ llvmOutput: obfuscatedOutput });

          // Clean up temporary files
          await fs.unlink(inputFile);
          await fs.unlink(llvmIRFile);
          await fs.unlink(obfuscatedFile);
        });
      } else {
        const llvmIROutput = await fs.readFile(llvmIRFile, 'utf-8');
        res.json({ llvmOutput: llvmIROutput });

        // Clean up temporary files
        await fs.unlink(inputFile);
        await fs.unlink(llvmIRFile);
      }
    });
  } catch (err) {
    console.error(`Error: ${err}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`LLVM backend listening on port ${port}`);
});