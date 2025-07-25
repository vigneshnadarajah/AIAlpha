import { z, ZodError } from 'zod';

// User Registration Schema
export const userRegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  tenantName: z.string().min(2)
});

// User Login Schema
export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

// Tenant Creation Schema
export const tenantCreationSchema = z.object({
  name: z.string().min(2),
  domain: z.string().regex(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/),
  settings: z.object({
    theme: z.string().optional(),
    timezone: z.string().optional(),
    features: z.array(z.string()).optional()
  })
});

// Data Visualization Schema
export const dataVisualizationSchema = z.object({
  type: z.enum(['line', 'bar', 'pie']),
  title: z.string().min(2),
  data: z.object({
    labels: z.array(z.string()),
    datasets: z.array(z.object({
      label: z.string(),
      data: z.array(z.number())
    }))
  }),
  options: z.record(z.any()).optional()
});

export const validateSchema = <T>(schema: z.ZodType<T>, data: any): { success: boolean; data?: T; error?: ZodError } => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
};