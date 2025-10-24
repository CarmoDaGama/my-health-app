export { Button } from './common/Button';
export { default as ErrorBoundary } from './common/ErrorBoundary';
export { default as ErrorDisplay } from './common/ErrorDisplay';
export { LanguageSelector } from './common/LanguageSelector';
export { default as LoadingSpinner } from './common/LoadingSpinner';
export { default as Skeleton, SkeletonListItem } from './common/Skeleton';
export { default as ValidatedInput } from './common/ValidatedInput';
export { default as PhoneInput } from './common/PhoneInput';
export { UserAvatar } from './common/UserAvatar';
export { ProtectedRoute } from './common/ProtectedRoute';
export { ServiceListItem } from './specific/ServiceListItem';
export { MapView } from './specific/MapView';
export { ReviewForm } from './specific/ReviewForm';
export { ReviewsList } from './specific/ReviewsList';
export { ReviewsPreview } from './specific/ReviewsPreview';
export { NormalUserForm } from './specific/NormalUserForm';
export { ProfessionalForm as ProfessionalEditForm } from './specific/ProfessionalForm';
export { InstitutionForm as InstitutionEditForm } from './specific/InstitutionForm';

// Auth components
export { default as UserTypeSelector } from './auth/UserTypeSelector';
export { default as ProfessionalForm } from './auth/ProfessionalForm';
export { default as InstitutionForm } from './auth/InstitutionForm';

// New common components  
export { SmartDashboard } from './common/SmartDashboard';
export { ProtectedComponent, useConditionalRender, usePermissionedAction } from './common/ProtectedComponent';
