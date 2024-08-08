import { AssociationSpecAssociationCategoryEnum, PublicAssociationsForObject } from '@aw/crm/crm/aw-hubspot/types/responseType';

export const getAssociation = (
  objectId: string,
  ObjectAssociationType: AssociationSpecAssociationCategoryEnum,
  AssociationId: number
): PublicAssociationsForObject => ({
  to: {
    id: objectId,
  },
  types: [
    {
      associationCategory: ObjectAssociationType,
      associationTypeId: AssociationId,
    },
  ],
});
