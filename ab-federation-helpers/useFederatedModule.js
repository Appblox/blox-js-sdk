/** 
 * Copyright (c)  Appblox. and its affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

import { loadComponent } from './utils'
import useDynamicScript from './useDynamicScript';


const scriptCache = new Map();
export const useFederatedModule = (remoteUrl, scope, module, React) => {
  const key = `${remoteUrl}-${scope}-${module}`;
  const [scriptModule, setScriptModule] = React.useState(null);

  const { ready, errorLoading } = useDynamicScript(remoteUrl, React);
  React.useEffect(() => {
    if (scriptModule) setScriptModule(null);
    // Only recalculate when key changes
  }, [key]);

  React.useEffect(() => {
    if (ready && !scriptModule) {
      let src = null;
      const loadAsyncComp = async () => {
        src = await loadComponent(scope, module)();
        scriptCache.set(key, src);
        setScriptModule(src);
      }
      loadAsyncComp();
    }
    // key includes all dependencies (scope/module)
  }, [scriptModule, ready, key]);
  const errorinLoading = errorLoading;
  return { errorinLoading, scriptModule };
};
