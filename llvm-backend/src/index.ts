import express from 'express';
import { json } from 'body-parser';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const app = express();
app.use(json());

app.post('/api/llvm/compile', 
  async (req, res) => {
  // print body
  console.log(req.body);
  const { code, llvmVersion } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  const inputFile = path.join('/tmp', `input_${Date.now()}.cpp`);
  const outputFile = path.join('/tmp', `output_${Date.now()}.ll`);

  try {
    await fs.writeFile(inputFile, code);

    const clangCommand = `clang-${llvmVersion} -S -emit-llvm ${inputFile} -o ${outputFile}`;

    exec(clangCommand, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Compilation error: ${error.message}`);
        return res.status(500).json({ error: 'Compilation failed', details: stderr });
      }

      const llvmOutput = await fs.readFile(outputFile, 'utf-8');
      res.json({ llvmOutput });

      // Clean up temporary files
      await fs.unlink(inputFile);
      await fs.unlink(outputFile);
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