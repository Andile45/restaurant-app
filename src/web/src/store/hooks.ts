import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Using withTypes() API (recommended in Redux Toolkit 2.11+)
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
