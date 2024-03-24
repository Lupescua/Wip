import { Command } from 'commander';
import { resolve } from 'path';
import { generateReleaseChangelog } from './changelog';
import { releasesFolder, rushconfig } from './util';

const releasetools: Command = new Command('release');

releasetools
  .command('generate-changelog <releaseName>')
  .action(async (releaseName: string) => {
    await generateReleaseChangelog({
      releaseFolder: resolve(releasesFolder, releaseName),
      releaseName,
      rushconfig
    });
  });

releasetools
  .parseAsync()
  .then(() => {})
  .catch(console.error);
