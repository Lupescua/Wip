import { Executable, PackageName } from '@rushstack/node-core-library';
import 'colors';
import { prompt } from 'inquirer';
import { ScaffoldConfiguration } from './configuration/ScaffoldConfiguration';
import { createPackageJson } from './project/packageJson';
import { createProjectFiles } from './project/projectFiles';
import { addRushProject, parseProject } from './project/rushJson';
import readline from 'readline';

interface IPromptResult {
  packageName: string;
  preset: string;
  prefixProjectFolder: boolean;
  runUpdate: boolean;
}

export async function runCreatePrompt(): Promise<void> {
  const config = ScaffoldConfiguration.load();

  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);

  const answers = await prompt<IPromptResult>([
    {
      name: 'packageName',
      type: 'input'
    },
    {
      name: 'preset',
      type: 'list',
      choices: config.presetKeys,
      when: config.presetKeys.length > 0
    },
    {
      name: 'prefixProjectFolder',
      type: 'confirm',
      default: false,
      when: (input) => !!PackageName.getScope(input.packageName)
    },
    {
      name: 'runUpdate',
      type: 'confirm',
      default: true
    }
  ]);

  const preset = config.getPreset(answers.preset);
  const { packageName, projectFolder, projectAbsoluteFolder } = parseProject(
    answers.packageName,
    preset.categoryFolder,
    answers.prefixProjectFolder
  );

  await createProjectFiles({ filePattern: preset.files, projectAbsoluteFolder });
  await createPackageJson(packageName, projectAbsoluteFolder, config, preset);
  await addRushProject(packageName, projectFolder);

  if (answers.runUpdate) {
    Executable.spawnSync('rush', ['update'], { stdio: 'inherit' });
  }

  console.log(`Project ${packageName} added in ${packageName}`.green);
}
