import * as Yup from 'yup';

declare module 'formik' {
  import { FormikConfig, FormikValues, FormikProps } from 'formik';
  export function useFormik<Values extends FormikValues = FormikValues>(
    config: FormikConfig<Values>
  ): FormikProps<Values>;
  export * from 'formik';
}

declare module 'yup' {
  export interface BaseSchema<TType = any, TContext = any, TDefault = any> {
    required(message?: string): this;
    optional(): this;
  }

  export interface StringSchema<TType = string, TContext = any, TDefault = TType> extends BaseSchema<TType, TContext, TDefault> {
    email(message?: string): StringSchema<TType, TContext>;
    min(limit: number, message?: string): StringSchema<TType, TContext>;
    oneOf(arrayOfValues: any[], message?: string): StringSchema<TType, TContext>;
    when(key: string, options: WhenOptions<TType>): StringSchema<TType, TContext>;
  }

  export interface DateSchema<TType = Date, TContext = any, TDefault = TType> extends BaseSchema<TType, TContext, TDefault> {
    min(limit: Date | string | number, message?: string): DateSchema<TType, TContext>;
  }

  export interface ObjectSchema<TShape extends object, TContext = any, TDefault = any> extends BaseSchema<TShape, TContext, TDefault> {
    shape<T extends { [key: string]: any }>(shape: T): ObjectSchema<T, TContext>;
  }

  interface WhenOptions<T> {
    is: any;
    then: (schema: StringSchema<T>) => StringSchema<T>;
    otherwise: (schema: StringSchema<T>) => StringSchema<T>;
  }

  export function string<T extends string>(): StringSchema<T>;
  export function date(): DateSchema;
  export function object<T extends object>(): ObjectSchema<T>;
  export function ref(path: string): any;
}

declare module '@tanstack/react-query' {
  export interface QueryKey extends Array<string | number | object> {}
  
  export interface QueryFunctionContext<TQueryKey extends QueryKey = QueryKey> {
    queryKey: TQueryKey;
  }

  export type QueryFunction<
    TQueryFnData = unknown,
    TQueryKey extends QueryKey = QueryKey
  > = (context: QueryFunctionContext<TQueryKey>) => Promise<TQueryFnData>;

  export interface UseQueryOptions<
    TQueryFnData = unknown,
    TError = unknown,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey
  > {
    queryKey: TQueryKey;
    queryFn: QueryFunction<TQueryFnData, TQueryKey>;
    enabled?: boolean;
  }

  export interface UseQueryResult<TData = unknown, TError = unknown> {
    data?: TData;
    error: TError | null;
    isLoading: boolean;
  }

  export function useQuery<
    TQueryFnData = unknown,
    TError = unknown,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey
  >(
    options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
  ): UseQueryResult<TData, TError>;

  export class QueryClient {
    constructor(config?: any);
  }

  export interface QueryClientProviderProps {
    client: QueryClient;
    children?: React.ReactNode;
  }

  export const QueryClientProvider: React.FC<QueryClientProviderProps>;
} 