import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { PostgrestBuilder, PostgrestFilterBuilder } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { queryClient } from '../config/queryClient';

interface QueryConfig {
  table: string;
  select?: string;
  match?: Record<string, any>;
  order?: { column: string; ascending?: boolean };
  limit?: number;
  single?: boolean;
}

export function useSupabaseQuery<T>(
  key: string[],
  config: QueryConfig,
  options?: Omit<UseQueryOptions<T[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      let query = supabase.from(config.table).select(config.select || '*') as PostgrestBuilder<any>;

      if (config.match) {
        Object.entries(config.match).forEach(([key, value]) => {
          query = (query as PostgrestFilterBuilder<any, any>).eq(key, value);
        });
      }

      if (config.order) {
        query = query.order(config.order.column, {
          ascending: config.order.ascending ?? true
        });
      }

      if (config.limit) {
        query = query.limit(config.limit);
      }

      const { data, error } = await (config.single ? query.single() : query);

      if (error) throw error;
      return (data || []) as T[];
    },
    ...options
  });
}

interface MutationData {
  id?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export function useSupabaseMutation<T extends MutationData>(
  table: string,
  type: 'INSERT' | 'UPDATE' | 'DELETE',
  options?: UseMutationOptions<T[], Error, T>
) {
  return useMutation({
    mutationFn: async (variables: T) => {
      let query = supabase.from(table);

      switch (type) {
        case 'INSERT': {
          const { data, error } = await query.insert(variables).select();
          if (error) throw error;
          return data as T[];
        }
        case 'UPDATE': {
          if (!variables.id) {
            throw new Error('Missing id for update operation');
          }
          const { id, ...updateData } = variables;
          const { data, error } = await query
            .update(updateData)
            .eq('id', id)
            .select();
          if (error) throw error;
          return data as T[];
        }
        case 'DELETE': {
          if (!variables.id) {
            throw new Error('Missing id for delete operation');
          }
          const { data, error } = await query
            .delete()
            .eq('id', variables.id)
            .select();
          if (error) throw error;
          return data as T[];
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    ...options
  });
} 