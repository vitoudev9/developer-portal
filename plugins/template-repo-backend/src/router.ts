import { HttpAuthService, resolvePackagePath } from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import { z } from 'zod';
import express from 'express';
import Router from 'express-promise-router';
import { templateRepoServiceRef } from './services/TemplateRepoService';
import multer from "multer";
import path from "path";

export async function createRouter({
  httpAuth,
  templateRepo,
}: {
  httpAuth: HttpAuthService;
  templateRepo: typeof templateRepoServiceRef.T;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
      cb(null, 'uploads/'); // folder where files will be saved
    },
    filename: function (_req, file, cb) {
      // e.g., file-1634823423.png
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage });

  // Zod schema for upload request
  const uploadSchema = z.object({
    originalName: z.string().optional(), // optional — will fallback to file.originalname
  });

  /**
  * POST /templates/upload
  * Uploads a file, validates input, stores in DB + filesystem
  */
  router.post(
    '/templates/upload',
    async (req, res) => {
      // // File object is required
      // const file = req.file;
      // if (!file) {
      //   throw new InputError('A file must be provided under the field "template"');
      // }

      // Parse any metadata (optional)
      const parsed = uploadSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new InputError(parsed.error.toString());
      }

      // Get user credentials
      const credentials = await httpAuth.credentials(req, { allow: ['user'] });

      console.log(`Credentail: ${credentials}`)

      // const result = await templateRepo.uploadTemplate(
      //   {
      //     tempFilePath: file.path,
      //     originalName: parsed.data.originalName ?? file.originalname,
      //     mimeType: file.mimetype,
      //   },
      //   { credentials },
      // );

      res.status(201).json(req.body);
    },
  );

  /**
   * GET /templates
   * Returns list of stored templates
   */
  router.get('/templates', async (_req, res) => {
    const result = await templateRepo.listTemplates();
    res.json(result);
  });

  /**
   * GET /templates/:id/download
   * Downloads the stored ZIP file
   */
  router.get('/templates/:id/download', async (req, res) => {
    const { id } = req.params;

    const template = await templateRepo.getTemplate({ id });

    // Express handles file download
    res.download(
      template.path,
      template.originalName.replace(/\.zip$/i, '') + '.zip',
      (err) => {
        if (err) {
          console.error("Download error:", err);
          res.status(500).send("Unable to download the file.");
        }
      }
    );
  });


  return router;
}
