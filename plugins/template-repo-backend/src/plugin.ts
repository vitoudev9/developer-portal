import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { resolvePackagePath } from '@backstage/backend-plugin-api';
import { templateRepoServiceRef } from './services/TemplateRepoService';

/**
 * templateRepoPlugin backend plugin
 *
 * @public
 */
export const templateRepoPlugin = createBackendPlugin({
  pluginId: 'template-repo',
  register(env) {
    env.registerInit({
      deps: {
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        templateRepo: templateRepoServiceRef,
        database: coreServices.database,
        logger: coreServices.logger
      },
      async init({ httpAuth, httpRouter, templateRepo, database, logger }) {
        const client = await database.getClient();
        const migrationsDir = resolvePackagePath(
          '@internal/backstage-plugin-template-repo-backend',
          'migrations',
        );
        if (!database.migrations?.skip) {
          const result = await client.migrate.latest({
            directory: migrationsDir,
          });

          logger.info(`Migration completed`, result);
        }
        httpRouter.use(
          await createRouter({
            httpAuth,
            templateRepo,
          }),
        );
      },
    });
  },
});
