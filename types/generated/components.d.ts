import type { Schema, Struct } from '@strapi/strapi';

export interface FurnitureCalculatorDimensionsCm
  extends Struct.ComponentSchema {
  collectionName: 'components_furniture_calculator_dimensions_cms';
  info: {
    description: '';
    displayName: 'dimensions';
  };
  attributes: {
    depth: Schema.Attribute.String;
    dimensions_type: Schema.Attribute.Enumeration<['cm', 'ft']>;
    height: Schema.Attribute.String;
    width: Schema.Attribute.String;
  };
}

export interface FurnitureCalculatorFurnitureVariant
  extends Struct.ComponentSchema {
  collectionName: 'components_furniture_calculator_furniture_variants';
  info: {
    description: '';
    displayName: 'Furniture Variant';
  };
  attributes: {
    multiple_image: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    size: Schema.Attribute.Component<'furniture-calculator.size', false>;
    title: Schema.Attribute.String;
  };
}

export interface FurnitureCalculatorQuantity extends Struct.ComponentSchema {
  collectionName: 'components_furniture_calculator_quantities';
  info: {
    description: '';
    displayName: 'quantity';
  };
  attributes: {
    quantity: Schema.Attribute.String;
    thickness: Schema.Attribute.String;
  };
}

export interface FurnitureCalculatorSize extends Struct.ComponentSchema {
  collectionName: 'components_furniture_calculator_sizes';
  info: {
    description: '';
    displayName: 'size';
  };
  attributes: {
    dimensions: Schema.Attribute.Component<
      'furniture-calculator.dimensions-cm',
      true
    >;
    quantity_thickness: Schema.Attribute.Component<
      'furniture-calculator.quantity',
      true
    >;
  };
}

export interface InvestorsFileData extends Struct.ComponentSchema {
  collectionName: 'components_investors_file_data';
  info: {
    description: '';
    displayName: 'File data';
  };
  attributes: {
    date: Schema.Attribute.Date;
    file: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    file_url: Schema.Attribute.String;
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    title: Schema.Attribute.String;
  };
}

export interface InvestorsInvestors extends Struct.ComponentSchema {
  collectionName: 'components_investors_investors';
  info: {
    displayName: 'Investors';
  };
  attributes: {
    file_info: Schema.Attribute.Component<'investors.file-data', true>;
    title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'furniture-calculator.dimensions-cm': FurnitureCalculatorDimensionsCm;
      'furniture-calculator.furniture-variant': FurnitureCalculatorFurnitureVariant;
      'furniture-calculator.quantity': FurnitureCalculatorQuantity;
      'furniture-calculator.size': FurnitureCalculatorSize;
      'investors.file-data': InvestorsFileData;
      'investors.investors': InvestorsInvestors;
    }
  }
}
