import { RouteObject } from 'react-router-dom';
import { ApplicationDashboard } from '../pages/ApplicationDashboard';
import { ApplicationDetailPlaceholder } from '../pages/ApplicationDetailPlaceholder';

export const applicationRoutes: RouteObject[] = [
  {
    path: '/applications',
    element: <ApplicationDashboard />
  },
  {
    path: '/applications/:id',
    element: <ApplicationDetailPlaceholder />
  }
];
