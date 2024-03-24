import { RushConfiguration } from '@microsoft/rush-lib';
import { Executable, IExecutableSpawnSyncOptions } from '@rushstack/node-core-library';
import { SpawnSyncReturns } from 'child_process';
import { resolve } from 'path';

export const rushconfig: RushConfiguration = RushConfiguration.loadFromDefaultLocation();
export const releasesFolder: string = resolve(rushconfig.commonFolder, 'releases');

export function getLatestReleaseDate(packageName: string): number {
  // Gets a list of tags sorted by date
  const result = executeCommand(
    'git',
    [
      'tag',
      '--merged',
      'origin/master',
      '--format="%(taggerdate:raw)"',
      // sort by descending versions
      '--sort=-v:refname',
      `${packageName}_*`
    ],
    { stdio: 'pipe' }
  );
  const [, time] = result.stdout.trim().match(/^[^\d]*(\d+)[\s]/) ?? [];

  if (!time) return 0;
  return Number(time);
}

export function dateToUnix(dateLike: string): number {
  // Apparently js is using miliseconds since 1 January 1970 00:00:00 UTC
  // instead of seconds like the rest of the world.
  return Math.floor(Date.parse(dateLike) / 1000);
}

function executeCommand(
  command: string,
  args: string[],
  options: IExecutableSpawnSyncOptions = { stdio: 'inherit' }
): SpawnSyncReturns<string> {
  console.log(`"EXECUTING: ${command} ${args.join(' ')}"`);

  return Executable.spawnSync(command, args, options);
}
