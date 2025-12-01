import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const templateRepoPlugin = createPlugin({
  id: 'template-repo',
  routes: {
    root: rootRouteRef,
  },
});

export const TemplateRepoPage = templateRepoPlugin.provide(
  createRoutableExtension({
    name: 'TemplateRepoPage',
    component: () =>
      import('./components/TemplateComponent').then(m => m.TemplateComponent),
    mountPoint: rootRouteRef,
  }),
);
