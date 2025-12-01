import { createDevApp } from '@backstage/dev-utils';
import { templateRepoPlugin, TemplateRepoPage } from '../src/plugin';

createDevApp()
  .registerPlugin(templateRepoPlugin)
  .addPage({
    element: <TemplateRepoPage />,
    title: 'Root Page',
    path: '/template-repo',
  })
  .render();
