// packages/app/src/components/TemplateCard.tsx
import React from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Box,
    Grid
} from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import { discoveryApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';

interface TemplateCard {
    id: string;
    category: string;
    title: string;
    description: string;
    owner: string;
    onChoose: () => void;
}

interface TemplateCardProps {
    templates: TemplateCard[];
}

export const TemplateCardComponent: React.FC<TemplateCardProps> = ({ templates }) => {
    const fetchApi = useApi(fetchApiRef);
    const discoveryApi = useApi(discoveryApiRef);

    const handleDownload = async (template: TemplateCard) => {
        try {
            const baseUrl = await discoveryApi.getBaseUrl('template-repo');
            const response = await fetchApi.fetch(`${baseUrl}/templates/${template.id}/download`, {
                method: 'GET',
            });

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${template.title}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert('Failed to download template');
        }
    };
    return (
        <Grid container spacing={3} style={{ padding: 16 }}>
            {templates.map((template) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={template.id}>
                    <Card
                        style={{
                            borderRadius: 8,
                            overflow: 'hidden',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                    >
                        {/* Header */}
                        <Box
                            style={{
                                backgroundColor: '#1976d2',
                                color: '#fff',
                                padding: '10px 14px'
                            }}
                        >
                            <Typography variant="caption" style={{ textTransform: 'uppercase', fontWeight: 500 }}>
                                {template.category}
                            </Typography>
                            <Typography variant="h6" style={{ fontWeight: 600, marginTop: 2 }}>
                                {template.title}
                            </Typography>
                        </Box>

                        {/* Body */}
                        <CardContent style={{ padding: '16px 14px' }}>
                            <Typography variant="body2" color="textSecondary">
                                {template.description}
                            </Typography>
                        </CardContent>

                        {/* Footer */}
                        <CardActions style={{ justifyContent: 'space-between', padding: '10px 14px' }}>
                            <Box display="flex" alignItems="center">
                                <PersonIcon style={{ fontSize: 16, marginRight: 6, color: '#1976d2' }} />
                                <Typography variant="caption" color="textSecondary">
                                    {template.owner}
                                </Typography>
                            </Box>
                            <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                onClick={() => handleDownload(template)}
                                style={{ fontWeight: 600 }}
                            >
                                Download
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};
