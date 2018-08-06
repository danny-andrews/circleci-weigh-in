import {serializeForFile} from '../shared';
import {ErrorWritingAssetDiffsArtifactErr} from '../core/errors';
import {resolve, writeFile} from './base';
import {ASSET_DIFFS_FILENAME, OUTPUT_FILEPATH} from '../core/constants';

export default ({rootPath, assetDiffs, thresholdFailures}) => resolve(
  rootPath,
  OUTPUT_FILEPATH,
  ASSET_DIFFS_FILENAME
)
  .chain(filepath => writeFile(
    filepath,
    serializeForFile({
      diffs: assetDiffs,
      failures: thresholdFailures
    })
  ))
  .mapErr(ErrorWritingAssetDiffsArtifactErr);
