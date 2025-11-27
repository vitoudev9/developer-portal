import React, { useState } from 'react';
import {
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
} from '@material-ui/core';
import {
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
} from '@backstage/core-components';
import { TemplateFetchComponent } from '../TemplateFetchComponent';

export const TemplateComponent = () => {
  const [open, setOpen] = useState(false);
  const [zipFile, setZipFile] = useState<File | null>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setZipFile(null); // reset when closing
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setZipFile(file);
  };

  return (
    <Page themeId="tool">
      <Header
        title="Welcome to Template Repository!"
        subtitle="The Template Repository Backend Plugin is a Backstage backend module designed to handle file uploads and management for your software templates."
      >
        <HeaderLabel label="Owner" value="IT Risk" />
        <HeaderLabel label="Lifecycle" value="Alpha Testing Version" />
      </Header>

      <Content>
        <ContentHeader title="Templates">
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <SupportButton>A description of your plugin goes here.</SupportButton>
            </Grid>

            <Grid item style={{ marginLeft: 'auto' }}>
              <Button variant="contained" color="primary" onClick={handleOpen}>
                Create Template
              </Button>
            </Grid>
          </Grid>
        </ContentHeader>

        <Grid container spacing={3} direction="column">
          <Grid item>
            <TemplateFetchComponent />
          </Grid>
        </Grid>
      </Content>

      {/* --- Dialog --- */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Create New Template</DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField label="Template Name" variant="outlined" fullWidth />
            </Grid>

            <Grid item xs={12}>
              <TextField label="Category" variant="outlined" fullWidth />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                variant="outlined"
                fullWidth
                multiline
                minRows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField label="Owner" variant="outlined" fullWidth />
            </Grid>

            {/* ZIP Upload */}
            <Grid item xs={12}>
              <input
                id="zip-upload-input"
                type="file"
                accept=".zip"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <label htmlFor="zip-upload-input">
                <Button
                  variant="contained"
                  color="secondary"
                  component="span"
                >
                  Upload ZIP File
                </Button>
              </label>

              {zipFile && (
                <Typography
                  variant="body2"
                  style={{ marginTop: 8, color: '#444' }}
                >
                  Selected: {zipFile.name}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            color="primary"
            variant="contained"
            disabled={!zipFile} // require a zip to submit
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Page>
  );
};
