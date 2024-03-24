import { RushConfiguration } from '@microsoft/rush-lib';
import {
  Executable,
  IPackageJson,
  JsonFile,
  PackageName
} from '@rushstack/node-core-library';
import { resolve } from 'path';
import {
  IScaffoldConfigurationPackageJson,
  IScaffoldConfigurationPresetJson,
  ScaffoldConfiguration
} from '../configuration/ScaffoldConfiguration';

const rushConfig: RushConfiguration = RushConfiguration.loadFromDefaultLocation();

export function createPackageJsonObject(
  packageName: string,
  configPackageJson: IScaffoldConfigurationPackageJson
): IPackageJson & { [k: string]: unknown } {
  const dependencies = getDependencies();
  const localDependencies = new Map(
    rushConfig.projects.map((p) => [p.packageName, 'workspace:*'])
  );

  const getLatestVersion = (name: string): string => {
    console.log('Querying npm for the latest version...');
    return Executable.spawnSync('npm', ['show', name, 'version']).stdout.trim();
  };

  const getVersion = (name: string): string => {
    if (name.includes('@workspace')) {
      return localDependencies.get(name.split('@workspace')[0])!;
    }
    return dependencies.get(name)?.version ?? getLatestVersion(name);
  };

  const interpolateProjectToken = (value: string, replacer: string): string => {
    return value.replace('<unscopedPackageName>', replacer);
  };

  const stripName = (name: string): string => name.replace('@workspace', '');

  return {
    name: packageName,
    version: '0.0.0',
    license: 'MIT',
    main: configPackageJson.main,
    module: configPackageJson.module,
    types: interpolateProjectToken(
      configPackageJson.types,
      PackageName.getUnscopedName(packageName)
    ),
    scripts: configPackageJson.scripts,
    dependencies: configPackageJson.dependencies.reduce(
      (acc, name) => ({ ...acc, [stripName(name)]: getVersion(name) }),
      {}
    ),
    devDependencies: configPackageJson.devDependencies.reduce(
      (acc, name) => ({ ...acc, [stripName(name)]: getVersion(name) }),
      {}
    )
  };
}

export async function createPackageJson(
  packageName: string,
  projectAbsoluteFolder: string,
  config: ScaffoldConfiguration,
  preset: IScaffoldConfigurationPresetJson
): Promise<void> {
  const packageJson = createPackageJsonObject(packageName, {
    ...config.packageJson,
    ...preset.packageJson,
    dependencies: [
      ...config.packageJson.dependencies,
      ...(preset.packageJson.dependencies ?? [])
    ],
    devDependencies: [
      ...config.packageJson.devDependencies,
      ...(preset.packageJson.devDependencies ?? [])
    ]
  });

  await JsonFile.saveAsync(packageJson, resolve(projectAbsoluteFolder, 'package.json'), {
    prettyFormatting: true
  });
}

export function getDependencies(): Map<string, { name: string; version: string }> {
  return new Map(
    [
      ...rushConfig.projects.flatMap((p) => p.packageJsonEditor.dependencyList),
      ...rushConfig.projects.flatMap((p) => p.packageJsonEditor.devDependencyList)
    ].map((d) => [d.name, d])
  );
}
