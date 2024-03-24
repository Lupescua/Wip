import { RushConfiguration } from '@microsoft/rush-lib';
import { FileSystem, JsonFile } from '@rushstack/node-core-library';
import { resolve } from 'path';

export interface IScaffoldConfigurationJson {
  presets: {
    [name: string]: IScaffoldConfigurationPresetJson;
  };
  packageJson: IScaffoldConfigurationPackageJson;
}

export interface IScaffoldConfigurationPresetJson {
  name: string;
  categoryFolder: string;
  files: string[];
  packageJson: Partial<IScaffoldConfigurationPackageJson>;
}

export interface IScaffoldConfigurationPackageJson {
  main: string;
  module: string;
  types: string;
  scripts: { [key: string]: string };
  dependencies: string[];
  devDependencies: string[];
}

export class ScaffoldConfiguration {
  public readonly presets: { [name: string]: IScaffoldConfigurationPresetJson };
  public readonly packageJson: IScaffoldConfigurationPackageJson;

  private constructor(json: IScaffoldConfigurationJson) {
    this.presets = json.presets;
    this.packageJson = json.packageJson;
  }

  public static load(): ScaffoldConfiguration {
    const rushConfig = RushConfiguration.loadFromDefaultLocation();
    const configPath = resolve(rushConfig.rushJsonFolder, 'scaffold.json');

    if (!FileSystem.exists(configPath)) {
      JsonFile.save(
        {
          presets: {}
        } as IScaffoldConfigurationJson,
        configPath
      );
    }

    return new ScaffoldConfiguration(JsonFile.load(configPath));
  }

  public get presetKeys(): string[] {
    return Object.keys(this.presets);
  }

  public getPreset(name: string): IScaffoldConfigurationPresetJson {
    return this.presets[name];
  }
}
