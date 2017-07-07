import {flatten, map, pipe, toPairs, values} from 'ramda';
import path from 'path';

const assetsByFilename = webpackStats =>
  pipe(values, flatten)(webpackStats.assetsByChunkName)
    .reduce(
      (acc, filepath) => ({...acc, [path.basename(filepath)]: filepath}),
      {},
    );

export const bundleSizesFromWebpackStats = (webpackStats, manifest) => {
  const assetNameFilepathMap = manifest
    ? manifest
    : assetsByFilename(webpackStats);

  return map(filepath => {
    const assetStats = webpackStats.assets.find(({name}) => name === filepath);

    if(!assetStats) {
      throw new Error(
        `Could not find ${filepath} listed in given webpack stats!`
      );
    }

    return {size: assetStats.size, path: filepath};
  }, assetNameFilepathMap);
};

export const diffBundles = ({current, original}) =>
  toPairs(current).reduce(
    (acc, [filename, fileStats]) => {
      const originalStat = original[filename];
      const difference = fileStats.size - originalStat.size;

      return originalStat
        ? {
          ...acc, [filename]: {
            current: fileStats.size,
            original: originalStat.size,
            difference,
            // eslint-disable-next-line no-magic-numbers
            percentChange: difference / originalStat.size * 100
          }
        }
        : acc;
    },
    {}
  );
