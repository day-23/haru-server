import { SetMetadata } from '@nestjs/common';

export const PaginatedResponse = () => SetMetadata('isPaginatedResponse', true);
