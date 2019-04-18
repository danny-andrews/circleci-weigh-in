import ReaderPromise from '@danny.andrews/reader-promise';
import R from 'ramda';

import {NoRecentBuildsFoundErr, NoAssetStatsArtifactFoundErr} from './errors';

const BuildStatuses = {SUCCESS: 'success', FIXED: 'fixed'};

const isSuccessfulBuildStatus = buildStatus => [
  BuildStatuses.SUCCESS,
  BuildStatuses.FIXED
].includes(buildStatus);

const makeCircleRequest = ReaderPromise.invokeAt(
  (result, config) => result.run(config),
  R.prop('makeCircleRequest')
);

export default (baseBranch, assetStatsFilepath) => {
  const getLatestSuccessfulBuildNumber = () =>
    makeCircleRequest({path: `tree/${baseBranch}`}).chain(recentBuilds => {
      if(recentBuilds.length === 0) {
        return NoRecentBuildsFoundErr(baseBranch) |> ReaderPromise.fromError;
      }

      const [firstItem] = recentBuilds;
      const buildNumber = isSuccessfulBuildStatus(firstItem.status)
        ? firstItem.buildNum
        : R.path(['previousSuccessfulBuild', 'buildNum'], firstItem);

      if(!buildNumber) {
        return NoRecentBuildsFoundErr(baseBranch) |> ReaderPromise.fromError;
      }

      return ReaderPromise.of(buildNumber);
    });

  const getAssetSizeArtifactUrl = buildNumber =>
    makeCircleRequest({path: `${buildNumber}/artifacts`})
      .chain(buildArtifacts => {
        const artifactPathRegExp = new RegExp(`${assetStatsFilepath}$`);
        const assetSizeArtifact = buildArtifacts
          .find(artifact => artifact.path.match(artifactPathRegExp));
        if(!assetSizeArtifact) {
          return NoAssetStatsArtifactFoundErr(baseBranch, buildNumber)
            |> ReaderPromise.fromError;
        }

        return ReaderPromise.of(assetSizeArtifact.url);
      });

  const getAssetSizeArtifact = assetSizeArtifactUrl => makeCircleRequest({
    url: assetSizeArtifactUrl,
    raw: true
  });

  return getLatestSuccessfulBuildNumber()
    .chain(getAssetSizeArtifactUrl)
    .chain(getAssetSizeArtifact);
};
