import { RushConfiguration } from '@microsoft/rush-lib';
import { FileSystem } from '@rushstack/node-core-library';
import fastglob from 'fast-glob';
import { resolve } from 'path';

export async function createProjectFiles({
  filePattern,
  projectAbsoluteFolder
}: {
  filePattern: string[];
  projectAbsoluteFolder: string;
}): Promise<void> {
  const rushConfig = RushConfiguration.loadFromDefaultLocation();

  const files = await fastglob(filePattern, {
    cwd: rushConfig.rushJsonFolder,
    ignore: ['**/node_modules/**', '**/package.json']
  });

  if (FileSystem.exists(projectAbsoluteFolder)) {
    throw new Error('Project already exists.');
  }

  await FileSystem.ensureEmptyFolderAsync(projectAbsoluteFolder);
  await Promise.all(
    files.map((file) =>
      FileSystem.copyFileAsync({
        sourcePath: resolve(rushConfig.rushJsonFolder, file),
        destinationPath: resolve(
          file.replace(/^([^\/]+\/[^\/]+)?/g, projectAbsoluteFolder)
        )
      })
    )
  );

  await FileSystem.writeFileAsync(resolve(projectAbsoluteFolder, 'src', 'index.ts'), '', {
    ensureFolderExists: true
  });
}
