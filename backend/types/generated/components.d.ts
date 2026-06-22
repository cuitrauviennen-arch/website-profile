import type { Schema, Struct } from '@strapi/strapi';

export interface ProjectCreativeAsset extends Struct.ComponentSchema {
  collectionName: 'components_project_creative_assets';
  info: {
    displayName: 'Creative Asset';
    icon: 'picture';
  };
  attributes: {
    category: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    name: Schema.Attribute.String;
    size: Schema.Attribute.Enumeration<['normal', 'tall']> &
      Schema.Attribute.DefaultTo<'normal'>;
  };
}

export interface ProjectMetric extends Struct.ComponentSchema {
  collectionName: 'components_project_metrics';
  info: {
    displayName: 'Metric';
    icon: 'chartCircle';
  };
  attributes: {
    count: Schema.Attribute.Decimal;
    label: Schema.Attribute.String;
    prefix: Schema.Attribute.String;
    ring: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    suffix: Schema.Attribute.String;
  };
}

export interface ProjectOverviewItem extends Struct.ComponentSchema {
  collectionName: 'components_project_overview_items';
  info: {
    displayName: 'Overview Item';
    icon: 'bulletList';
  };
  attributes: {
    body: Schema.Attribute.Text;
    k: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface ProjectPhase extends Struct.ComponentSchema {
  collectionName: 'components_project_phases';
  info: {
    displayName: 'Phase';
    icon: 'layer';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    image: Schema.Attribute.Media<'images'>;
    step: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SharedNavItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_nav_items';
  info: {
    description: '';
    displayName: 'nav_item';
    icon: 'link';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    sectionId: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'project.creative-asset': ProjectCreativeAsset;
      'project.metric': ProjectMetric;
      'project.overview-item': ProjectOverviewItem;
      'project.phase': ProjectPhase;
      'shared.nav-item': SharedNavItem;
    }
  }
}
