import { ApproxStructure, Assertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Tabstopping } from 'ephox/alloy/api/behaviour/Tabstopping';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';

UnitTest.asynctest('TabstoppingTest', (success, failure) => {

  GuiSetup.setup((_store, _doc, _body) => {
    return GuiFactory.build(
      Container.sketch({
        containerBehaviours: Behaviour.derive([
          Tabstopping.config({ })
        ])
      })
    );

  }, (_doc, _body, _gui, component, _store) => {
    return [
      Assertions.sAssertStructure(
        'Check initial tabstopping values',
        ApproxStructure.build((s, str, _arr) => {
          return s.element('div', {
            attrs: {
              'data-alloy-tabstop': str.is('true')
            }
          });
        }),
        component.element()
      )
    ];
  }, () => { success(); }, failure);
});
