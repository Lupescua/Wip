import { RushConfiguration } from '@microsoft/rush-lib';
import { JsonFile, PackageName } from '@rushstack/node-core-library';
import { resolve } from 'path';

const rushConfig: RushConfiguration = RushConfiguration.loadFromDefaultLocation();

export async function addRushProject(
  packageName: string,
  projectFolder: string
): Promise<void> {
  rushConfig.rushConfigurationJson.projects.push({
    packageName,
    projectFolder
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  await JsonFile.saveAsync(rushConfig.rushConfigurationJson, rushConfig.rushJsonFile, {
    updateExistingFile: true,
    onlyIfChanged: true
  });
}

export function parseProject(
  packageName: string,
  categoryFolder: string,
  prefixProjectFolder: boolean
): {
  packageName: string;
  unscopedPackageName: string;
  projectFolder: string;
  projectAbsoluteFolder: string;
} {
  const scope = PackageName.getScope(packageName).slice(1);
  const unscopedPackageName =
    (prefixProjectFolder ? `${scope}-` : '') + PackageName.getUnscopedName(packageName);
  const projectFolder = `${categoryFolder}/${unscopedPackageName}`;
  const projectAbsoluteFolder = resolve(rushConfig.rushJsonFolder, projectFolder);

  return {
    packageName,
    unscopedPackageName,
    projectFolder,
    projectAbsoluteFolder
  };
}
