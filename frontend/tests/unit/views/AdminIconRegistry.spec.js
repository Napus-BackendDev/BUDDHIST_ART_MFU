import fs from 'fs';
import path from 'path';
import { iconsSet } from '@/assets/icons/icons';

const sourceRoot = path.resolve(__dirname, '../../../src');

const toRegistryKey = (name) => name.split('-').reduce((key, part, index) => {
  if (index === 0) return part;
  return key + part.charAt(0).toUpperCase() + part.slice(1);
}, '');

const collectVueFiles = (directory) => fs.readdirSync(directory, { withFileTypes: true }).reduce((files, entry) => {
  const fullPath = path.join(directory, entry.name);
  if (entry.isDirectory()) return files.concat(collectVueFiles(fullPath));
  return entry.name.endsWith('.vue') ? files.concat(fullPath) : files;
}, []);

describe('CoreUI icon registry', () => {
  it('contains every icon referenced by Vue components', () => {
    const references = new Set();
    const patterns = [
      /["']((?:cil|cib|cif)-[a-z0-9-]+)["']/g,
      /["']((?:cil|cib|cif)[A-Z][A-Za-z0-9]+)["']/g
    ];

    collectVueFiles(sourceRoot).forEach(filePath => {
      const source = fs.readFileSync(filePath, 'utf8');
      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(source))) references.add(match[1]);
      });
    });

    const missing = [...references]
      .map(name => name.includes('-') ? toRegistryKey(name) : name)
      .filter(name => !Object.prototype.hasOwnProperty.call(iconsSet, name));

    expect(missing).toEqual([]);
  });
});
