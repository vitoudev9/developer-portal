import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import archiver from 'archiver';
import {
    coreServices,
    createServiceFactory,
    createServiceRef,
    DatabaseService,
    LoggerService,
} from '@backstage/backend-plugin-api';
import { NotFoundError } from '@backstage/errors';
import {
    BackstageCredentials,
    BackstageUserPrincipal,
} from '@backstage/backend-plugin-api';
import { Expand } from '@backstage/types';


export interface StoredTemplate {
    id: string;
    category: string;
    title: string;
    description: string;
    owner: string;
    filename: string;
    originalName: string;
    createdBy: string;
    createdAt: string;
    path: string;
}

export class TemplateRepoService {
    readonly #logger: LoggerService;
    readonly #database: DatabaseService;
    readonly #templateDir = path.join(process.cwd(), 'store-templates');

    static create(options: {
        logger: LoggerService;
        database: DatabaseService;
    }) {
        return new TemplateRepoService(options.logger, options.database);
    }

    private constructor(
        logger: LoggerService,
        database: DatabaseService,
    ) {
        this.#logger = logger;
        this.#database = database;

        if (!fs.existsSync(this.#templateDir)) {
            fs.mkdirSync(this.#templateDir, { recursive: true })
        }
    }

    /** Upload and store template */
    async uploadTemplate(
        input: {
            category: string;
            title: string;
            description: string;
            owner: string;
            tempFilePath: string;
            originalName: string;
            mimeType: string;
        },
        options: {
            credentials: BackstageCredentials<BackstageUserPrincipal>;
        },
    ): Promise<StoredTemplate> {
        const id = crypto.randomUUID();
        const targetFilename = `${id}.zip`;
        const targetPath = path.join(this.#templateDir, targetFilename);
        const createdBy = options.credentials.principal.userEntityRef;

        // Already a zip? Just move it
        if (input.mimeType === 'application/zip') {
            fs.renameSync(input.tempFilePath, targetPath);
        } else {
            // Zip the folder / single file
            await this.#zipToPath(input.tempFilePath, targetPath, input.originalName);
            fs.rmSync(input.tempFilePath, { recursive: true, force: true });
        }

        const record: StoredTemplate = {
            id,
            category: input.category,
            title: input.title,
            description: input.description,
            owner: input.owner,
            filename: targetFilename,
            originalName: input.originalName,
            createdBy,
            createdAt: new Date().toISOString(),
            path: targetPath,
        };

        const db = await this.#database.getClient();

        // Store in DB
        await db
            .insert({
                id: record.id,
                filename: record.filename,
                original_name: record.originalName,
                created_by: record.createdBy,
                created_at: record.createdAt,
                path: record.path,
            })
            .into('template_storage');

        this.#logger.info(`Stored template uploaded: ${record.id}`);

        return record;
    }

    /** List all templates (from DB) */
    async listTemplates(): Promise<{ items: StoredTemplate[] }> {
        const db = await this.#database.getClient();
        const rows = await db.select('*').from('template_storage');

        const items = rows.map(row => ({
            id: row.id,
            category: row.category,
            title: row.title,
            description: row.description,
            owner: row.owner,
            filename: row.filename,
            originalName: row.original_name,
            createdBy: row.created_by,
            createdAt: row.created_at,
            path: row.path,

        }));

        return { items };
    }

    /** Fetch single template */
    async getTemplate(req: { id: string }): Promise<StoredTemplate> {
        const db = await this.#database.getClient();
        const row = await db.from('template_storage')
            .where({ id: req.id })
            .first();

        if (!row) {
            throw new NotFoundError(`No template found with id '${req.id}'`);
        }

        return {
            id: row.id,
            category: row.category,
            title: row.title,
            description: row.description,
            owner: row.owner,
            filename: row.filename,
            originalName: row.original_name,
            createdBy: row.created_by,
            createdAt: row.created_at,
            path: row.path,
        };
    }

    /** Private: handles zipping logic */
    async #zipToPath(srcPath: string, destZipPath: string, originalName: string) {
        await new Promise<void>((resolve, reject) => {
            const output = fs.createWriteStream(destZipPath);
            const archive = archiver('zip');

            output.on('close', resolve);
            archive.on('error', reject);

            archive.pipe(output);

            const stats = fs.statSync(srcPath);
            if (stats.isDirectory()) {
                archive.directory(srcPath, false);
            } else {
                archive.file(srcPath, { name: originalName });
            }

            archive.finalize();
        });
    }
}

export const templateRepoServiceRef = createServiceRef<Expand<TemplateRepoService>>({
    id: 'template.repo',
    defaultFactory: async service =>
        createServiceFactory({
            service,
            deps: {
                logger: coreServices.logger,
                database: coreServices.database,
            },
            async factory(deps) {
                return TemplateRepoService.create(deps);
            },
        }),
});