import type { StrapiApp } from '@strapi/strapi/admin';
import * as React from 'react';
import { Button } from '@strapi/design-system';
import { Download, Plus } from '@strapi/icons';
import { useFetchClient, useNotification } from '@strapi/strapi/admin';
import { useLocation, useNavigate } from 'react-router-dom';

const briefCollection = '/content-manager/collection-types/api::client-brief.client-brief/';

const DownloadClientBriefButton = () => {
  const { pathname } = useLocation();
  const { get } = useFetchClient();
  const { toggleNotification } = useNotification();
  const [downloading, setDownloading] = React.useState(false);
  const pk = pathname.startsWith(briefCollection) ? pathname.slice(briefCollection.length).split('/')[0] : '';

  if (!pk || pk === 'create') return null;

  async function download() {
    setDownloading(true);
    try {
      const { data, headers } = await get(`/client-brief-export/${encodeURIComponent(pk)}`, { responseType: 'blob' });
      if (data.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        throw new Error('The export response was not a Word document');
      }
      const filename = headers?.get('Content-Disposition')?.match(/client-brief-BRF-\d+\.docx/i)?.[0] ?? 'client-brief.docx';
      const url = URL.createObjectURL(data);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toggleNotification({ type: 'danger', message: 'Unable to download the brief. Check your permissions or try again.' });
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Button startIcon={<Download />} loading={downloading} onClick={download} fullWidth>
      Download Word
    </Button>
  );
};

const CreateNewEntryButton = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Strapi 5 edit URL example: /content-manager/collection-types/api::skill.skill/1
  if (pathname.endsWith('/create') || pathname.startsWith(briefCollection)) return null;

  const isEditView = pathname.includes('/content-manager/collection-types/') || pathname.includes('/content-manager/single-types/');
  if (!isEditView) return null;

  const handleCreateNew = () => {
    const newPath = pathname.replace(/\/[^/]+$/, '/create');
    navigate(newPath);
  };

  return (
    <Button variant="secondary" startIcon={<Plus />} onClick={handleCreateNew} style={{ marginTop: '16px', width: '100%' }}>
      Create New Entry
    </Button>
  );
};

export default {
  config: {
    locales: [],
  },
  bootstrap(app: StrapiApp) {
    const cmPlugin = app.getPlugin('content-manager');
    if (cmPlugin) {
      cmPlugin.injectComponent('editView', 'right-links', {
        name: 'download-client-brief',
        Component: DownloadClientBriefButton,
      });
      cmPlugin.injectComponent('editView', 'right-links', {
        name: 'create-new-entry',
        Component: CreateNewEntryButton,
      });
    }
  },
};
