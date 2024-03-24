import { RushConfiguration } from '@microsoft/rush-lib';
import { IChangelog, IChangeLogComment } from '@microsoft/rush-lib/lib/api/Changelog';
import { ChangelogGenerator } from '@microsoft/rush-lib/lib/logic/ChangelogGenerator';
import { FileSystem, JsonFile } from '@rushstack/node-core-library';
import { resolve } from 'path';
import { dateToUnix, getLatestReleaseDate } from './util';

export interface IGenerateReleaseChangelogOptions {
  releaseName: string;
  releaseFolder: string;
  rushconfig: RushConfiguration;
}

const toMarkdown: (
  changelog: IChangelog,
  rushConfiguration: RushConfiguration,
  isLockstepped?: boolean
) => string = ChangelogGenerator['_translateToMarkdown'];

const getChangeComments: (
  title: string,
  commentsArray: IChangeLogComment[] | undefined
) => string = ChangelogGenerator['_getChangeComments'];

const EOL: string = '\n';
const EOL2: string = EOL + EOL;

export async function generateReleaseChangelog({
  releaseName,
  rushconfig,
  releaseFolder
}: IGenerateReleaseChangelogOptions): Promise<void> {
  // Load all CHANGELOG.json files
  const changelogJsons: {latestReleaseAt: number, changelog: IChangelog}[] = await Promise.all(
    rushconfig.projects
      .filter((project) => project.shouldPublish)
      .map(async (project) => ({
        latestReleaseAt: getLatestReleaseDate(project.packageName),
        changelog: await JsonFile.loadAsync(resolve(project.projectFolder, 'CHANGELOG.json'))
      }))
  );

  if (!changelogJsons.length) return

  let markdown = toMarkdown({ name: releaseName, entries: [] }, rushconfig);

  for (const {changelog,latestReleaseAt} of changelogJsons) {
    const entry = changelog.entries.find((entry) => {
      return entry.date && dateToUnix(entry.date) >= latestReleaseAt;
    });

    if (!entry) continue;

    markdown += `## ${changelog.name}`;
    markdown += EOL;
    markdown += `## ${entry.version}`;
    markdown += EOL;
    markdown += `${entry.date}`;
    markdown += EOL2;

    markdown += getChangeComments('Breaking changes', entry.comments.major);
    markdown += getChangeComments('Minor changes', entry.comments.minor);
    markdown += getChangeComments('Patches', entry.comments.patch);
    markdown += getChangeComments('Updates', entry.comments.none);

    if (entry.comments.dependency) {
      markdown += `_Version update only_` + EOL2;
    }
  }

  await FileSystem.writeFileAsync(resolve(releaseFolder, 'CHANGELOG.md'), markdown, {
    ensureFolderExists: true
  });
}
