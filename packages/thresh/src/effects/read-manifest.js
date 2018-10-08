import ReaderPromise from '@danny.andrews/reader-promise';
import {parseJSON} from '@danny.andrews/fp-utils';

import {ManifestFileReadErr} from '../core/errors';

import {readFile} from './base';

export default manifestFilepath => readFile(manifestFilepath)
  .mapErr(ManifestFileReadErr)
  .chain(
    contents => parseJSON(contents).cata(
      error => ManifestFileReadErr(error) |> ReaderPromise.fromError,
      ReaderPromise.of
    )
  );