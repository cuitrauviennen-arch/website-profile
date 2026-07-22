import type { StrapiApp } from '@strapi/strapi/admin';
import * as React from 'react';
import { Button } from '@strapi/design-system';
import { Plus } from '@strapi/icons';
import { useLocation, useNavigate } from 'react-router-dom';

const CreateNewEntryButton = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Strapi 5 edit URL example: /content-manager/collection-types/api::skill.skill/1
  if (pathname.endsWith('/create')) return null;

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
        name: 'create-new-entry',
        Component: CreateNewEntryButton,
      });
    }
  },
};
