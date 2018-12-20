import { Pipeline, GeneralSteps } from '@ephox/agar';
import { Step } from '@ephox/agar';
import TinyApis from 'ephox/mcagar/api/TinyApis';
import TinyLoader from 'ephox/mcagar/api/TinyLoader';
import { UnitTest } from '@ephox/bedrock';
import { sAssertVersion } from '../../module/AssertVersion';

var sTestVersion = (version: string, major, minor) => {
  return TinyLoader.sSetupVersion(version, [], (editor) => {
    var apis = TinyApis(editor);

    return GeneralSteps.sequence([
      apis.sFocus,
      sAssertVersion(major, minor),
      apis.sSetContent('<p>this is one paragraph</p><p>This is another</p>'),
      apis.sSetSelection([ 0, 0 ], 'this'.length, [ 1, 0 ], 'This is'.length),
      apis.sAssertSelection([ 0, 0 ], 'this'.length, [ 1, 0 ], 'This is'.length),

      apis.sSetCursor([ 0, 0 ], 't'.length),
      apis.sAssertSelection([ 0, 0 ], 't'.length, [ 0, 0 ], 't'.length),

      apis.sSetSelectionFrom({
        start: {
          element: [ 0, 0 ], offset: 'this '.length
        },
        finish: {
          element: [ 1 ], offset: 0
        }
      }),
      apis.sAssertSelection([ 0, 0 ], 'this '.length, [ 1 ], 0),
      apis.sSetSelectionFrom({
        element: [ 0 ],
        offset: 1
      }),
      apis.sAssertSelection([ 0 ], 1, [ 0 ], 1),

      apis.sSetContent('<p>one <strong>word</strong> here</p>'),
      apis.sSelect('p', [ 1 ]),
      // This may not be normalised across all browsers
      apis.sAssertSelection([ 0 ], 1, [ 0 ], 2)
    ]);
  }, { });
};


UnitTest.asynctest('TinySelectionTest', (success, failure) => {

  Pipeline.async({}, [
    sTestVersion('4.5.x', 4, 5),
    sTestVersion('4.8.x', 4, 8),
    sTestVersion('5.0.x', 5, 0)
  ], () => success(), failure);
});
