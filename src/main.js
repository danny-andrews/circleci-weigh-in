/* eslint-disable no-console */
import path from 'path';
import {mkdir, writeFile, readFile, getFileStats, Database, request}
  from './shared';
import circleciWeighIn from './circleci-weigh-in';
import * as effects from './effects';

export default options =>
  circleciWeighIn(options)
    .run({
      writeFile,
      readFile,
      resolve: path.resolve,
      request,
      db: Database('my.db'),
      mkdir,
      getFileStats,
      logMessage: console.log,
      logError: console.error,
      effects
    });
