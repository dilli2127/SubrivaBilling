import { FieldMetadata } from '../../hooks/useFieldMetadata';

export interface FieldMetadataManagerProps {
  entityName: string;
  businessType?: string;
  tenantId?: string;
  organisationId?: string;
  onFieldsUpdated?: () => void;
}

export interface FieldFormProps {
  form: any;
  editingField: FieldMetadata | null;
  optionsText: string;
  onOptionsChange: (text: string) => void;
}

export interface FieldsTableProps {
  data: FieldMetadata[];
  loading: boolean;
  deleteLoading: boolean;
  onEdit: (field: FieldMetadata) => void;
  onDelete: (fieldId: string) => void;
}

export interface UseFieldMetadataOperationsProps {
  entityName: string;
  businessType?: string;
  tenantId?: string;
  organisationId?: string;
  onFieldsUpdated?: () => void;
}

export interface UseFieldMetadataOperationsReturn {
  fieldsData: FieldMetadata[];
  fieldsLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  fetchFields: () => void;
  handleSubmitField: (
    values: any,
    optionsText: string,
    editingField: FieldMetadata | null
  ) => Promise<void>;
  handleDeleteField: (fieldId: string) => void;
}

